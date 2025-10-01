import { DataSource } from 'typeorm';
import { UserRole } from '../../modules/roles/entities/user-role.entity';

export class UserRolesSeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    const userRoleRepository = dataSource.getRepository(UserRole);

    const roles = [
      {
        name: 'super_admin',
        description: 'Administrateur systeme avec tous les privileges',
        permissions: {
          users: ['create', 'read', 'update', 'delete'],
          parishes: ['create', 'read', 'update', 'delete'],
          masses: ['create', 'read', 'update', 'delete'],
          offerings: ['create', 'read', 'update', 'delete'],
          contributions: ['create', 'read', 'update', 'delete'],
          payments: ['create', 'read', 'update', 'delete'],
          roles: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          notifications: ['create', 'read', 'update', 'delete'],
          system: ['manage_settings', 'view_logs', 'backup_restore'],
        },
      },
      {
        name: 'parish_manager',
        description: 'Gestionnaire de paroisse avec privileges etendus',
        permissions: {
          users: ['read', 'update'],
          parishes: ['read', 'update'],
          masses: ['create', 'read', 'update', 'delete'],
          offerings: ['create', 'read', 'update', 'delete'],
          contributions: ['create', 'read', 'update', 'delete'],
          payments: ['read', 'update'],
          reports: ['create', 'read'],
          notifications: ['create', 'read', 'update'],
        },
      },
      {
        name: 'priest',
        description:
          'Pretre avec acces aux fonctions liturgiques et pastorales',
        permissions: {
          users: ['read'],
          parishes: ['read'],
          masses: ['create', 'read', 'update'],
          offerings: ['read'],
          contributions: ['read'],
          payments: ['read'],
          reports: ['read'],
        },
      },
      {
        name: 'treasurer',
        description: 'Tresorier avec acces aux fonctions financieres',
        permissions: {
          users: ['read'],
          parishes: ['read'],
          masses: ['read'],
          offerings: ['create', 'read', 'update'],
          contributions: ['create', 'read', 'update'],
          payments: ['create', 'read', 'update'],
          reports: ['create', 'read'],
        },
      },
      {
        name: 'secretary',
        description: 'Secretaire avec acces aux fonctions administratives',
        permissions: {
          users: ['create', 'read', 'update'],
          parishes: ['read', 'update'],
          masses: ['create', 'read', 'update'],
          offerings: ['read'],
          contributions: ['read'],
          payments: ['read'],
          reports: ['read'],
          notifications: ['create', 'read', 'update'],
        },
      },
      {
        name: 'volunteer',
        description: 'Benevole avec acces limite aux fonctions de base',
        permissions: {
          users: ['read'],
          parishes: ['read'],
          masses: ['read'],
          offerings: ['read'],
          contributions: ['read'],
        },
      },
      {
        name: 'parishioner',
        description:
          'Paroissien/utilisateur normal avec acces aux services principaux',
        permissions: {
          users: ['read'],
          parishes: ['read'],
          masses: ['create', 'read'],
          offerings: ['create', 'read'],
          contributions: ['create', 'read'],
          payments: ['create', 'read'],
        },
      },
    ];

    for (const roleData of roles) {
      const existingRole = await userRoleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = userRoleRepository.create(roleData);
        await userRoleRepository.save(role);
        console.log(`Role cree: ${roleData.name}`);
      } else {
        console.log(`Role existe deja: ${roleData.name}`);
      }
    }
  }
}
