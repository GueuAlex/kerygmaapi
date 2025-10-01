import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto, UsersListResponseDto } from './dto/user-response.dto';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@ApiTags('Gestion des utilisateurs')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions.Users.Read()
  @ApiOperation({
    summary: 'Liste des utilisateurs avec filtres et pagination',
    description: `
🔒 **Permission requise** : Lecture des utilisateurs

Récupère la liste des utilisateurs avec possibilité de :
- **Rechercher** par nom ou email
- **Filtrer** par rôle et statut
- **Paginer** les résultats
- **Trier** par différents champs

**Cas d'usage :**
- Administration des utilisateurs
- Recherche d'utilisateurs spécifiques
- Statistiques et rapports
- Gestion des rôles et permissions
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle insuffisant',
  })
  async findAll(
    @Query() queryDto: QueryUsersDto,
  ): Promise<UsersListResponseDto> {
    return this.usersService.findAll(queryDto);
  }

  @Get('me')
  @ApiOperation({
    summary: "Profil de l'utilisateur connecté",
    description: `
🔒 **Endpoint protégé** - Accessible à tous les utilisateurs connectés

Retourne les informations complètes du profil de l'utilisateur actuellement connecté.

**Cas d'usage :**
- Affichage du profil dans l'interface utilisateur
- Récupération des permissions et rôles
- Vérification de l'état du compte
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
    type: UserResponseDto,
  })
  async getProfile(@Request() req: { user: any }): Promise<UserResponseDto> {
    return this.usersService.findOne(req.user.userId);
  }

  @Get('stats')
  @Permissions.Users.Read()
  @ApiOperation({
    summary: 'Statistiques des utilisateurs',
    description: `
🔒 **Permission requise** : Lecture des utilisateurs

Retourne des statistiques détaillées sur les utilisateurs :
- Nombre total d'utilisateurs
- Répartition par rôles
- Répartition par statuts

**Cas d'usage :**
- Tableaux de bord administrateur
- Rapports statistiques
- Monitoring de la plateforme
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
    example: {
      total: 150,
      byRole: {
        admin: 5,
        priest: 12,
        parish_admin: 25,
        user: 108,
      },
      byStatus: {
        active: 140,
        inactive: 8,
        suspended: 2,
      },
    },
  })
  async getStats() {
    const [total, byRole, byStatus] = await Promise.all([
      this.usersService.count(),
      this.usersService.countByRole(),
      this.usersService.countByStatus(),
    ]);

    return { total, byRole, byStatus };
  }

  @Get(':id')
  @Permissions.Users.Read()
  @ApiOperation({
    summary: "Détails d'un utilisateur spécifique",
    description: `
🔒 **Permission requise** : Lecture des utilisateurs

Récupère les informations détaillées d'un utilisateur par son ID.

**Cas d'usage :**
- Consultation de profil utilisateur
- Modération et administration
- Support utilisateur
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle insuffisant',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Modifier son propre profil',
    description: `
🔒 **Endpoint protégé** - Accessible à tous les utilisateurs connectés

Permet à un utilisateur de modifier ses propres informations :
- Nom complet
- Email (si unique)
- Téléphone

**Restrictions :**
- Un utilisateur ne peut pas modifier son propre rôle
- Un utilisateur ne peut pas modifier son propre statut
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé par un autre utilisateur',
  })
  async updateProfile(
    @Request() req: { user: any },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Empêcher la modification du statut par l'utilisateur lui-même
    const { status, ...allowedUpdates } = updateUserDto;
    return this.usersService.update(req.user.userId, allowedUpdates);
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Modifier son mot de passe',
    description: `
🔒 **Endpoint protégé** - Accessible à tous les utilisateurs connectés

Permet à un utilisateur de modifier son propre mot de passe de manière sécurisée.

**Processus de sécurisation :**
1. Validation de l'ancien mot de passe
2. Vérification que le nouveau mot de passe est différent
3. Application des règles de complexité
4. Hachage sécurisé du nouveau mot de passe

**Règles de complexité :**
- Minimum 8 caractères, maximum 50
- Au moins 1 minuscule, 1 majuscule, 1 chiffre
- Au moins 1 caractère spécial (@$!%*?&)

**Cas d'usage :**
- Changement périodique pour la sécurité
- Mot de passe compromis ou oublié
- Conformité aux politiques de sécurité
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
    example: {
      message: 'Mot de passe modifié avec succès',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Erreur de validation (nouveaux mots de passe différents, même mot de passe, etc.)',
  })
  @ApiResponse({
    status: 401,
    description: 'Mot de passe actuel incorrect',
  })
  async changePassword(
    @Request() req: { user: any },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Put(':id')
  @Permissions.Users.Write()
  @ApiOperation({
    summary: 'Modifier un utilisateur',
    description: `
🔒 **Permission requise** : Lecture des utilisateurs

Permet à un administrateur de modifier tous les aspects d'un utilisateur :
- Informations personnelles (nom, email, téléphone)
- Rôle utilisateur
- Statut du compte

**Cas d'usage :**
- Administration des comptes utilisateurs
- Gestion des rôles et permissions
- Modération (suspension/activation)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé par un autre utilisateur',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle Admin requis',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions.Users.Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description: `
🔒 **Permission requise** : Lecture des utilisateurs

⚠️ **Action irréversible** - Supprime définitivement un utilisateur et toutes ses données.

**Cas d'usage :**
- Nettoyage des comptes inactifs
- Suppression de comptes frauduleux
- Conformité RGPD (droit à l'oubli)

**Recommandation :** Préférer la suspension à la suppression définitive.
    `,
  })
  @ApiResponse({
    status: 204,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé - Rôle Admin requis',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
