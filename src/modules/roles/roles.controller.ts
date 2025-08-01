import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto, UserRolesResponseDto } from './dto/role-response.dto';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Gestion des Rôles et Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('seed')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initialiser les rôles par défaut',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Crée les rôles par défaut du système avec leurs permissions :
- **super_admin** : Tous les droits
- **parish_priest** : Curé de paroisse
- **treasurer** : Trésorier
- **secretary** : Secrétaire
- **basic_user** : Utilisateur de base

**Sécurité :** Ne crée que les rôles qui n'existent pas encore.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Rôles par défaut créés avec succès',
    type: [RoleResponseDto],
  })
  async seedDefaultRoles(): Promise<RoleResponseDto[]> {
    return this.rolesService.seedDefaultRoles();
  }

  @Get()
  @Roles('admin', 'priest')
  @ApiOperation({
    summary: 'Liste de tous les rôles',
    description: `
🔒 **Endpoint protégé** - Accessible aux admins et prêtres

Retourne la liste complète des rôles disponibles avec leurs permissions.

**Cas d'usage :**
- Interface d'administration des rôles
- Sélection de rôles lors de l'assignation
- Audit des permissions du système
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des rôles récupérée avec succès',
    type: [RoleResponseDto],
  })
  async findAllRoles(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @Roles('admin', 'priest')
  @ApiParam({
    name: 'id',
    description: 'ID du rôle',
    example: 1,
  })
  @ApiOperation({
    summary: 'Détails d\'un rôle spécifique',
    description: `
🔒 **Endpoint protégé** - Accessible aux admins et prêtres

Retourne les détails complets d'un rôle avec toutes ses permissions.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Détails du rôle récupérés avec succès',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rôle non trouvé',
  })
  async findRoleById(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.rolesService.findRoleById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Créer un nouveau rôle',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Crée un nouveau rôle personnalisé avec ses permissions spécifiques.

**Structure des permissions :**
\`\`\`json
{
  "resource_name": ["action1", "action2"],
  "finances": ["read", "write"],
  "users": ["read"],
  "*": ["*"]  // Super admin (tous droits)
}
\`\`\`

**Actions courantes :** read, write, delete, *
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Rôle créé avec succès',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Un rôle avec ce nom existe déjà',
  })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.createRole(createRoleDto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiParam({
    name: 'id',
    description: 'ID du rôle à modifier',
    example: 1,
  })
  @ApiOperation({
    summary: 'Modifier un rôle existant',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Modifie les propriétés d'un rôle existant (nom, description, permissions).

**Note :** La modification des permissions affecte immédiatement tous les utilisateurs ayant ce rôle.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Rôle modifié avec succès',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rôle non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Le nouveau nom de rôle existe déjà',
  })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: 'ID du rôle à supprimer',
    example: 1,
  })
  @ApiOperation({
    summary: 'Supprimer un rôle',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Supprime définitivement un rôle et toutes ses assignations.

**⚠️ Attention :** Cette action est irréversible et retire le rôle de tous les utilisateurs qui l'avaient.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Rôle supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Rôle non trouvé',
  })
  async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  @Roles('admin', 'priest')
  @ApiParam({
    name: 'id',
    description: 'ID du rôle',
    example: 1,
  })
  @ApiOperation({
    summary: 'Permissions détaillées d\'un rôle',
    description: `
🔒 **Endpoint protégé** - Accessible aux admins et prêtres

Retourne uniquement les permissions d'un rôle spécifique dans un format détaillé.

**Utile pour :**
- Audit des permissions
- Interface de modification des droits
- Vérification des accès
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions du rôle récupérées avec succès',
    example: {
      finances: ['read', 'write'],
      users: ['read'],
      reports: ['read', 'write']
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Rôle non trouvé',
  })
  async getRolePermissions(@Param('id', ParseIntPipe) id: number): Promise<Record<string, any>> {
    const role = await this.rolesService.findRoleById(id);
    return role.permissions || {};
  }

  @Post('users/:userId/roles/:roleId')
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({
    name: 'userId',
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID du rôle à assigner',
    example: 1,
  })
  @ApiOperation({
    summary: 'Assigner un rôle à un utilisateur',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Assigne un rôle spécifique à un utilisateur.

**Fonctionnement :**
- Un utilisateur peut avoir plusieurs rôles
- Les permissions se cumulent entre les rôles
- L'assignation est immédiate
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Rôle assigné avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur ou rôle non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Ce rôle est déjà assigné à cet utilisateur',
  })
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<{ message: string }> {
    await this.rolesService.assignRoleToUser(userId, roleId);
    return { message: 'Rôle assigné avec succès' };
  }

  @Delete('users/:userId/roles/:roleId')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'userId',
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID du rôle à retirer',
    example: 1,
  })
  @ApiOperation({
    summary: 'Retirer un rôle d\'un utilisateur',
    description: `
🔒 **Endpoint protégé** - Réservé aux administrateurs

Retire un rôle spécifique d'un utilisateur.

**Note :** L'utilisateur perd immédiatement les permissions liées à ce rôle.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Rôle retiré avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Assignation de rôle non trouvée',
  })
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<void> {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  @Get('users/:userId/roles')
  @Roles('admin', 'priest')
  @ApiParam({
    name: 'userId',
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  @ApiOperation({
    summary: 'Rôles d\'un utilisateur',
    description: `
🔒 **Endpoint protégé** - Accessible aux admins et prêtres

Retourne tous les rôles assignés à un utilisateur spécifique.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Rôles de l\'utilisateur récupérés avec succès',
    type: [RoleResponseDto],
  })
  async getUserRoles(@Param('userId') userId: string): Promise<RoleResponseDto[]> {
    return this.rolesService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions')
  @Roles('admin', 'priest')
  @ApiParam({
    name: 'userId',
    description: 'ID de l\'utilisateur',
    example: 'uuid-1234-5678-9012',
  })
  @ApiOperation({
    summary: 'Permissions effectives d\'un utilisateur',
    description: `
🔒 **Endpoint protégé** - Accessible aux admins et prêtres

Calcule et retourne toutes les permissions effectives d'un utilisateur.

**Fonctionnement :**
- Fusionne les permissions de tous les rôles de l'utilisateur
- Élimine les doublons
- Retourne le résultat consolidé

**Utile pour :**
- Vérification des droits d'accès
- Interface utilisateur adaptative
- Audit de sécurité
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions effectives calculées avec succès',
    type: UserRolesResponseDto,
  })
  async getUserPermissions(@Param('userId') userId: string): Promise<UserRolesResponseDto> {
    const roles = await this.rolesService.getUserRoles(userId);
    const effectivePermissions = await this.rolesService.getEffectivePermissions(userId);
    
    return {
      userId,
      roles,
      effectivePermissions,
    };
  }
}
