import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { MassesService } from './masses.service';
import {
  CreateCelebrationTypeDto,
  UpdateCelebrationTypeDto,
  CelebrationTypeResponseDto,
  CreateMassCalendarDto,
  UpdateMassCalendarDto,
  QueryMassCalendarDto,
  MassCalendarResponseDto,
  PaginatedMassCalendarResponseDto,
} from './dto';

@ApiTags('Gestion des Messes et Célébrations')
@Controller('masses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MassesController {
  constructor(private readonly massesService: MassesService) {}

  // ========== CELEBRATION TYPES ==========

  @Post('celebration-types')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Créer un nouveau type de célébration',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Crée un nouveau type de célébration (messe dominicale, mariage, baptême, etc.).

**Cas d'usage :**
- Configuration initiale de la paroisse
- Ajout de nouveaux types de célébrations spéciales
- Personnalisation selon les besoins liturgiques
    `,
  })
  @ApiBody({ type: CreateCelebrationTypeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Type de célébration créé avec succès',
    type: CelebrationTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un type de célébration avec ce nom existe déjà',
    schema: {
      example: {
        message: 'Un type de célébration avec le nom "Messe dominicale" existe déjà',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permissions insuffisantes',
    schema: {
      example: {
        message: 'Permission refusée. Ressource: masses, Action: write',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  async createCelebrationType(
    @Body(ValidationPipe) createDto: CreateCelebrationTypeDto,
  ): Promise<CelebrationTypeResponseDto> {
    return this.massesService.createCelebrationType(createDto);
  }

  @Get('celebration-types')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Lister tous les types de célébrations',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère la liste complète des types de célébrations disponibles, triée par nom.

**Cas d'usage :**
- Interface de création de messes
- Sélection de type lors de la programmation
- Administration des types de célébrations
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des types de célébrations récupérée avec succès',
    type: [CelebrationTypeResponseDto],
  })
  async findAllCelebrationTypes(): Promise<CelebrationTypeResponseDto[]> {
    return this.massesService.findAllCelebrationTypes();
  }

  @Get('celebration-types/:id')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Détails d\'un type de célébration',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère les détails complets d'un type de célébration spécifique.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de célébration',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de célébration trouvé',
    type: CelebrationTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Type de célébration non trouvé',
    schema: {
      example: {
        message: 'Type de célébration avec l\'ID 1 non trouvé',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async findCelebrationTypeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CelebrationTypeResponseDto> {
    return this.massesService.findCelebrationTypeById(id);
  }

  @Put('celebration-types/:id')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Modifier un type de célébration',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Modifie les informations d'un type de célébration existant.

**Note :** La modification peut affecter toutes les messes existantes de ce type.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de célébration à modifier',
    example: 1,
  })
  @ApiBody({ type: UpdateCelebrationTypeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de célébration modifié avec succès',
    type: CelebrationTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Type de célébration non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Le nouveau nom existe déjà',
  })
  async updateCelebrationType(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateCelebrationTypeDto,
  ): Promise<CelebrationTypeResponseDto> {
    return this.massesService.updateCelebrationType(id, updateDto);
  }

  @Delete('celebration-types/:id')
  @Permissions.Masses.Delete()
  @ApiOperation({
    summary: 'Supprimer un type de célébration',
    description: `
🔒 **Permission requise** : Suppression sur les messes

⚠️ **Action irréversible** - Supprime définitivement un type de célébration.

**Restriction :** Impossible de supprimer si des messes y sont associées.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de célébration à supprimer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de célébration supprimé avec succès',
    schema: {
      example: {
        message: 'Type de célébration "Messe dominicale" supprimé avec succès',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Type de célébration non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Impossible de supprimer - des messes y sont associées',
    schema: {
      example: {
        message: 'Impossible de supprimer ce type de célébration. 5 messe(s) y sont associée(s).',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async deleteCelebrationType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.massesService.deleteCelebrationType(id);
  }

  // ========== MASS CALENDAR ==========

  @Post('calendar')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Programmer une nouvelle messe',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Programme une nouvelle messe dans le calendrier avec validation des conflits d'horaire.

**Validations automatiques :**
- Vérification que la date n'est pas dans le passé
- Contrôle des conflits d'horaire au même lieu
- Validation de la cohérence des heures (fin > début)
- Vérification de l'existence du type de célébration

**Cas d'usage :**
- Planification hebdomadaire/mensuelle des messes
- Programmation d'événements spéciaux
- Organisation du calendrier liturgique
    `,
  })
  @ApiBody({ type: CreateMassCalendarDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Messe programmée avec succès',
    type: MassCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides ou conflit d\'horaire',
    schema: {
      example: {
        message: 'Impossible de créer une messe dans le passé',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit d\'horaire détecté',
    schema: {
      example: {
        message: 'Conflit d\'horaire détecté. Une autre messe est programmée à la même heure et au même lieu.',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async createMassCalendar(
    @Body(ValidationPipe) createDto: CreateMassCalendarDto,
    @Request() req: { user: any },
  ): Promise<MassCalendarResponseDto> {
    return this.massesService.createMassCalendar(createDto, req.user.userId);
  }

  @Get('calendar')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Calendrier des messes avec filtres',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère le calendrier des messes avec possibilité de filtrage avancé et pagination.

**Filtres disponibles :**
- **Période** : Date de début et fin
- **Type** : Filtrer par type de célébration
- **Statut** : Active, annulée, demandes désactivées
- **Tri** : Par date, heure, type, etc.

**Cas d'usage :**
- Affichage du calendrier liturgique
- Planning des célébrants
- Recherche de créneaux libres
- Statistiques et rapports
    `,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page', example: 10 })
  @ApiQuery({ name: 'start_date', required: false, description: 'Date de début (YYYY-MM-DD)', example: '2025-01-01' })
  @ApiQuery({ name: 'end_date', required: false, description: 'Date de fin (YYYY-MM-DD)', example: '2025-01-31' })
  @ApiQuery({ name: 'celebration_type_id', required: false, description: 'Filtrer par type de célébration', example: 1 })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut', example: 'active' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Champ de tri', example: 'mass_date' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Ordre de tri', example: 'ASC' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendrier des messes récupéré avec succès',
    type: PaginatedMassCalendarResponseDto,
  })
  async findAllMassCalendar(
    @Query(ValidationPipe) queryDto: QueryMassCalendarDto,
  ): Promise<PaginatedMassCalendarResponseDto> {
    return this.massesService.findAllMassCalendar(queryDto);
  }

  @Get('calendar/upcoming')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Prochaines messes à venir',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère la liste des prochaines messes actives, triées par date et heure.

**Utilisation :**
- Affichage sur tableau de bord
- Notifications aux fidèles
- Planning rapide des célébrants
    `,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre maximum de messes à retourner',
    example: 10,
    schema: { type: 'integer', minimum: 1, maximum: 50 },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prochaines messes récupérées avec succès',
    type: [MassCalendarResponseDto],
  })
  async getUpcomingMasses(
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<MassCalendarResponseDto[]> {
    return this.massesService.getUpcomingMasses(limit);
  }

  @Get('calendar/stats')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Statistiques du calendrier des messes',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Fournit des statistiques détaillées sur le calendrier des messes.

**Données fournies :**
- Nombre total de messes programmées
- Messes d'aujourd'hui, de cette semaine, de ce mois
- Répartition par statut (active, annulée, etc.)
- Répartition par type de célébration

**Cas d'usage :**
- Tableaux de bord administrateurs
- Rapports d'activité
- Planification des ressources
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques récupérées avec succès',
    schema: {
      example: {
        total: 245,
        today: 3,
        thisWeek: 15,
        thisMonth: 67,
        byStatus: {
          active: 220,
          cancelled: 15,
          disabled_requests: 10,
        },
        byCelebrationType: {
          'Messe dominicale': 104,
          'Messe quotidienne': 120,
          'Mariage': 12,
          'Baptême': 9,
        },
      },
    },
  })
  async getMassesStats() {
    return this.massesService.getMassesStats();
  }

  @Get('calendar/:id')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Détails d\'une messe spécifique',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère les détails complets d'une messe programmée avec son type de célébration.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la messe',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messe trouvée',
    type: MassCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Messe non trouvée',
    schema: {
      example: {
        message: 'Messe avec l\'ID 1 non trouvée',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async findMassCalendarById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MassCalendarResponseDto> {
    return this.massesService.findMassCalendarById(id);
  }

  @Put('calendar/:id')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Modifier une messe programmée',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Modifie les détails d'une messe déjà programmée avec validation des conflits.

**Validations automatiques :**
- Vérification des nouveaux conflits d'horaire
- Validation de la cohérence des heures
- Contrôle de l'existence du nouveau type de célébration

**Note :** Les modifications peuvent affecter les demandes de messes liées.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la messe à modifier',
    example: 1,
  })
  @ApiBody({ type: UpdateMassCalendarDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messe modifiée avec succès',
    type: MassCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Messe non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflit d\'horaire avec les modifications',
  })
  async updateMassCalendar(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateMassCalendarDto,
  ): Promise<MassCalendarResponseDto> {
    return this.massesService.updateMassCalendar(id, updateDto);
  }

  @Delete('calendar/:id')
  @Permissions.Masses.Delete()
  @ApiOperation({
    summary: 'Supprimer une messe programmée',
    description: `
🔒 **Permission requise** : Suppression sur les messes

⚠️ **Action irréversible** - Supprime définitivement une messe du calendrier.

**Impact :** Cette action peut affecter les demandes de messes et reservations liées.

**Recommandation :** Préférer l'annulation (changement de statut) à la suppression.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la messe à supprimer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messe supprimée avec succès',
    schema: {
      example: {
        message: 'Messe "Messe dominicale du 2025-01-12 à 08:00" supprimée avec succès',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Messe non trouvée',
  })
  async deleteMassCalendar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.massesService.deleteMassCalendar(id);
  }
}
