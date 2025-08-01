import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { UserHasRole } from './entities/user-has-role.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserHasRole)
    private readonly userHasRoleRepository: Repository<UserHasRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<UserRole> {
    const existingRole = await this.userRoleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Ce rôle existe déjà');
    }

    const role = this.userRoleRepository.create(createRoleDto);
    return this.userRoleRepository.save(role);
  }

  async findAllRoles(): Promise<UserRole[]> {
    return this.userRoleRepository.find();
  }

  async findRoleById(id: number): Promise<UserRole> {
    const role = await this.userRoleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }
    return role;
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<UserHasRole> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que le rôle existe
    const role = await this.findRoleById(roleId);

    // Vérifier si l'assignation existe déjà
    const existingAssignment = await this.userHasRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });

    if (existingAssignment) {
      throw new ConflictException('Ce rôle est déjà assigné à cet utilisateur');
    }

    const userHasRole = this.userHasRoleRepository.create({
      user_id: userId,
      role_id: roleId,
    });

    return this.userHasRoleRepository.save(userHasRole);
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    const result = await this.userHasRoleRepository.delete({
      user_id: userId,
      role_id: roleId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Assignation de rôle non trouvée');
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const userRoles = await this.userHasRoleRepository.find({
      where: { user_id: userId },
      relations: ['role'],
    });

    return userRoles.map(ur => ur.role);
  }

  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      if (role.permissions && role.permissions[resource]) {
        const resourcePermissions = role.permissions[resource];
        if (Array.isArray(resourcePermissions) && resourcePermissions.includes(action)) {
          return true;
        }
      }
    }
    
    return false;
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<UserRole> {
    const role = await this.findRoleById(id);
    
    // Vérifier l'unicité du nom si on le modifie
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.userRoleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException('Ce nom de rôle existe déjà');
      }
    }

    Object.assign(role, updateRoleDto);
    return this.userRoleRepository.save(role);
  }

  async deleteRole(id: number): Promise<void> {
    // Vérifier que le rôle existe
    await this.findRoleById(id);

    // Supprimer toutes les assignations de ce rôle
    await this.userHasRoleRepository.delete({ role_id: id });

    // Supprimer le rôle
    await this.userRoleRepository.delete(id);
  }

  async getEffectivePermissions(userId: string): Promise<Record<string, string[]>> {
    const userRoles = await this.getUserRoles(userId);
    const effectivePermissions: Record<string, string[]> = {};

    for (const role of userRoles) {
      if (role.permissions) {
        // Cas spécial : super admin avec tous les droits
        if (role.permissions['*'] && role.permissions['*'].includes('*')) {
          return { '*': ['*'] };
        }

        // Fusionner les permissions de chaque rôle
        Object.keys(role.permissions).forEach(resource => {
          if (!effectivePermissions[resource]) {
            effectivePermissions[resource] = [];
          }
          
          const resourcePermissions = role.permissions[resource];
          if (Array.isArray(resourcePermissions)) {
            resourcePermissions.forEach(permission => {
              if (!effectivePermissions[resource].includes(permission)) {
                effectivePermissions[resource].push(permission);
              }
            });
          }
        });
      }
    }

    return effectivePermissions;
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const effectivePermissions = await this.getEffectivePermissions(userId);
    
    // Vérifier les super droits
    if (effectivePermissions['*'] && effectivePermissions['*'].includes('*')) {
      return true;
    }

    // Vérifier la permission spécifique
    if (effectivePermissions[resource]) {
      return effectivePermissions[resource].includes(action) || 
             effectivePermissions[resource].includes('*');
    }

    return false;
  }

  async seedDefaultRoles(): Promise<UserRole[]> {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: 'Administrateur système avec tous les droits',
        permissions: { '*': ['*'] }
      },
      {
        name: 'parish_priest',
        description: 'Curé de paroisse',
        permissions: {
          masses: ['read', 'write', 'delete'],
          finances: ['read', 'write'],
          users: ['read', 'write'],
          reports: ['read', 'write'],
          roles: ['read']
        }
      },
      {
        name: 'treasurer',
        description: 'Trésorier de la paroisse',
        permissions: {
          finances: ['read', 'write'],
          reports: ['read', 'write'],
          offerings: ['read', 'write'],
          contributions: ['read', 'write']
        }
      },
      {
        name: 'secretary',
        description: 'Secrétaire de paroisse',
        permissions: {
          masses: ['read', 'write'],
          users: ['read'],
          reports: ['read'],
          parishes: ['read', 'write']
        }
      },
      {
        name: 'basic_user',
        description: 'Utilisateur de base avec permissions limitées',
        permissions: {
          profile: ['read', 'write'],
          masses: ['read'],
          offerings: ['write']
        }
      }
    ];

    const createdRoles: UserRole[] = [];

    for (const roleData of defaultRoles) {
      const existingRole = await this.userRoleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.userRoleRepository.create(roleData);
        const savedRole = await this.userRoleRepository.save(role);
        createdRoles.push(savedRole);
      }
    }

    return createdRoles;
  }
}
