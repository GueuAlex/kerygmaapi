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
import { MassRequestsService } from './mass-requests.service';
import {
  CreateMassRequestTypeDto,
  UpdateMassRequestTypeDto,
  MassRequestTypeResponseDto,
  CreateMassRequestDto,
  UpdateMassRequestDto,
  QueryMassRequestsDto,
  MassRequestResponseDto,
  PaginatedMassRequestsResponseDto,
} from './dto';

@ApiTags('Demandes de Messes et Intentions')
@Controller('mass-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MassRequestsController {
  constructor(private readonly massRequestsService: MassRequestsService) {}

  // ========== AVAILABLE MASSES ==========

  @Get('available-masses')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Lister les messes disponibles pour les demandes',
    description: `
🔒 **Endpoint protégé** - Accessible aux utilisateurs avec permission de lecture des messes

Retourne la liste des messes disponibles dans le calendrier pour faire des demandes d'intentions.

**Fonctionnalités :**
- Filtre automatiquement les messes futures (à partir d'aujourd'hui)
- Exclut les messes annulées ou fermées aux demandes
- Trie par date et heure chronologique
- Affiche les informations complètes de chaque messe

**Utilisé pour :**
- Interface de sélection lors de la création d'une demande de messe
- Planning des messes disponibles pour les paroissiens
- Vérification des disponibilités
    `,
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    description: 'Date de début pour filtrer les messes (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des messes disponibles récupérée avec succès',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 5 },
          mass_date: { type: 'string', example: '2025-12-25' },
          start_time: { type: 'string', example: '07:00' },
          end_time: { type: 'string', example: '08:30' },
          location: { type: 'string', example: 'Église principale' },
          status: { type: 'string', example: 'active' },
          notes: { type: 'string', example: 'Messe de Noël' },
          celebration_type: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Messe dominicale' },
              description: { type: 'string', example: 'Messe du dimanche' },
            },
          },
          display_name: { type: 'string', example: 'Messe de Noël - 2025-12-25 à 07:00 (Église principale)' },
        },
      },
    },
  })
  async getAvailableMasses(
    @Query('from_date') fromDate?: string,
  ): Promise<any[]> {
    return this.massRequestsService.findAvailableMasses(fromDate);
  }

  // ========== MASS REQUEST TYPES ==========

  @Post('types')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Créer un type de demande de messe',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Crée un nouveau type de demande de messe avec tarification.

**Exemples de types :**
- Messe pour un défunt
- Messe d'action de grâces
- Messe d'intention spéciale
- Neuvaine
- Messe d'anniversaire

**Cas d'usage :**
- Configuration initiale des services paroissiaux
- Personnalisation selon les traditions locales
- Gestion des tarifs par type de service
    `,
  })
  @ApiBody({ type: CreateMassRequestTypeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Type de demande créé avec succès',
    type: MassRequestTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Un type avec ce nom existe déjà',
    schema: {
      example: {
        message: 'Un type de demande avec le nom "Messe pour un défunt" existe déjà',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  async createMassRequestType(
    @Body(ValidationPipe) createDto: CreateMassRequestTypeDto,
  ): Promise<MassRequestTypeResponseDto> {
    return this.massRequestsService.createMassRequestType(createDto);
  }

  @Get('types')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Lister les types de demandes de messes',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère tous les types de demandes de messes disponibles.

**Cas d'usage :**
- Interface de création de demandes
- Affichage des tarifs aux fidèles
- Administration des services paroissiaux
    `,
  })
  @ApiQuery({
    name: 'active_only',
    required: false,
    description: 'Afficher uniquement les types actifs',
    example: true,
    schema: { type: 'boolean' },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des types de demandes récupérée avec succès',
    type: [MassRequestTypeResponseDto],
  })
  async findAllMassRequestTypes(
    @Query('active_only') activeOnly: boolean = false,
  ): Promise<MassRequestTypeResponseDto[]> {
    return this.massRequestsService.findAllMassRequestTypes(activeOnly);
  }

  @Get('types/:id')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Détails d\'un type de demande',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère les détails complets d'un type de demande avec template et tarification.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de demande',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de demande trouvé',
    type: MassRequestTypeResponseDto,
  })
  async findMassRequestTypeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MassRequestTypeResponseDto> {
    return this.massRequestsService.findMassRequestTypeById(id);
  }

  @Put('types/:id')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Modifier un type de demande',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Modifie les informations d'un type de demande existant.

**Impact :** Les modifications de tarifs n'affectent pas les demandes déjà créées.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de demande à modifier',
    example: 1,
  })
  @ApiBody({ type: UpdateMassRequestTypeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de demande modifié avec succès',
    type: MassRequestTypeResponseDto,
  })
  async updateMassRequestType(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateMassRequestTypeDto,
  ): Promise<MassRequestTypeResponseDto> {
    return this.massRequestsService.updateMassRequestType(id, updateDto);
  }

  @Delete('types/:id')
  @Permissions.Masses.Delete()
  @ApiOperation({
    summary: 'Supprimer un type de demande',
    description: `
🔒 **Permission requise** : Suppression sur les messes

⚠️ **Action irréversible** - Supprime définitivement un type de demande.

**Restriction :** Impossible si des demandes y sont associées.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant du type de demande à supprimer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Type de demande supprimé avec succès',
    schema: {
      example: {
        message: 'Type de demande "Messe pour un défunt" supprimé avec succès',
      },
    },
  })
  async deleteMassRequestType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.massRequestsService.deleteMassRequestType(id);
  }

  // ========== MASS REQUESTS ==========

  @Post()
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Créer une demande de messe avec programmation flexible',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Crée une nouvelle demande de messe avec **deux modes de programmation** :

## 📅 **Mode 1 : Sélection d'une messe existante**
\`\`\`json
{
  "mass_request_type_id": 1,
  "mass_calendar_id": 5,
  "requester_name": "Jean Dupont",
  "message_additionnel": "Pour le repos de l'âme de...",
  "total_amount": 5000
}
\`\`\`
- **Avantage** : \`scheduled_date\` auto-rempli avec la date de la messe
- **Usage** : Quand l'utilisateur choisit une messe programmée dans le calendrier

## 🗓️ **Mode 2 : Date libre personnalisée**
\`\`\`json
{
  "mass_request_type_id": 1,
  "scheduled_date": "2025-12-25",
  "requester_name": "Marie Antoinette",
  "message_additionnel": "Messe de Noël privée",
  "total_amount": 7000
}
\`\`\`
- **Avantage** : \`mass_calendar\` sera \`null\`, date complètement libre
- **Usage** : Pour des dates spéciales non programmées au calendrier

## ✅ **Validation intelligente**
- **Requis** : Au moins \`mass_calendar_id\` OU \`scheduled_date\`
- **Auto-fill** : Si \`mass_calendar_id\` fourni, \`scheduled_date\` = date de la messe
- **Cohérence** : Si les deux fournis, vérification de correspondance
- **Sécurité** : Interdiction des dates passées

## 🎯 **Cas d'usage typiques**
- **Paroissiens** : Choisir une messe dominicale (Mode 1)
- **Événements spéciaux** : Anniversaire, mariage (Mode 2)
- **Accueil paroissial** : Flexibilité selon demande
    `,
  })
  @ApiBody({ 
    type: CreateMassRequestDto,
    examples: {
      'Mode 1 - Messe existante': {
        value: {
          "mass_request_type_id": 1,
          "mass_calendar_id": 1,
          "requester_name": "Jean Baptiste Kouassi",
          "requester_phone": "+225 07 12 34 56 78",
          "requester_email": "jean.kouassi@example.com",
          "message_additionnel": "Messe en mémoire de notre père décédé",
          "total_amount": 5000
        }
      },
      'Mode 2 - Date libre': {
        value: {
          "mass_request_type_id": 1,
          "scheduled_date": "2025-12-25",
          "requester_name": "Marie Antoinette Koné",
          "requester_email": "marie@example.com",
          "message_additionnel": "Messe de Noël personnalisée",
          "total_amount": 7000
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Demande de messe créée avec succès',
    type: MassRequestResponseDto,
    schema: {
      example: {
        "id": 123,
        "requester_name": "Jean Baptiste Kouassi",
        "requester_phone": "+225 07 12 34 56 78",
        "requester_email": "jean.kouassi@example.com",
        "mass_request_type": {
          "id": 1,
          "name": "Messe pour un défunt",
          "base_amount": 5000
        },
        "mass_calendar": {
          "id": 1,
          "mass_date": "2025-09-30",
          "start_time": "08:00:00",
          "end_time": "09:30:00",
          "location": "Église Saint-Pierre",
          "celebration_type": {
            "id": 1,
            "name": "Messe dominicale",
            "description": "Messe célébrée chaque dimanche"
          }
        },
        "scheduled_date": "2025-09-30",
        "message_additionnel": "Messe en mémoire de notre père décédé",
        "status": "pending_payment",
        "total_amount": 5000,
        "created_at": "2025-09-30T10:15:30.000Z"
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erreurs de validation',
    schema: {
      examples: {
        'Aucun mode sélectionné': {
          value: {
            "message": "Vous devez fournir soit mass_calendar_id soit scheduled_date",
            "error": "Bad Request",
            "statusCode": 400
          }
        },
        'Date dans le passé': {
          value: {
            "message": "Impossible de programmer une demande pour une date passée",
            "error": "Bad Request", 
            "statusCode": 400
          }
        },
        'Incohérence date/messe': {
          value: {
            "message": "La date fournie (2025-12-25) ne correspond pas à la date de la messe sélectionnée (2025-09-30)",
            "error": "Bad Request",
            "statusCode": 400
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ressource non trouvée',
    schema: {
      examples: {
        'Type de demande inexistant': {
          value: {
            "message": "Type de demande avec l'ID 999 non trouvé ou inactif",
            "error": "Not Found",
            "statusCode": 404
          }
        },
        'Messe inexistante': {
          value: {
            "message": "Messe avec l'ID 999 non trouvée ou indisponible",
            "error": "Not Found",
            "statusCode": 404
          }
        }
      }
    }
  })
  async createMassRequest(
    @Body(ValidationPipe) createDto: CreateMassRequestDto,
    @Request() req: { user: any },
  ): Promise<MassRequestResponseDto> {
    return this.massRequestsService.createMassRequest(createDto, req.user.userId);
  }

  @Get()
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Liste des demandes de messes avec filtres',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère la liste paginée des demandes de messes avec filtrage avancé.

**Filtres disponibles :**
- **Recherche** : Par nom, email ou téléphone du demandeur
- **Statut** : En attente, payé, programmé, complété, annulé
- **Type** : Par type de demande
- **Période** : Par plage de dates
- **Tri** : Par différents critères

**Cas d'usage :**
- Gestion administrative des demandes
- Suivi des paiements
- Planification des célébrations
- Recherche de demandes spécifiques
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des demandes récupérée avec succès',
    type: PaginatedMassRequestsResponseDto,
  })
  async findAllMassRequests(
    @Query(ValidationPipe) queryDto: QueryMassRequestsDto,
  ): Promise<PaginatedMassRequestsResponseDto> {
    return this.massRequestsService.findAllMassRequests(queryDto);
  }

  @Get('stats')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Statistiques des demandes de messes',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Fournit des statistiques détaillées sur les demandes de messes.

**Données fournies :**
- Nombre total de demandes
- Demandes d'aujourd'hui, de cette semaine, de ce mois
- Répartition par statut
- Répartition par type de demande
- Statistiques financières (montant total et moyen)

**Cas d'usage :**
- Tableaux de bord administratifs
- Rapports d'activité pastorale
- Analyses financières
- Planification des ressources
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques récupérées avec succès',
    schema: {
      example: {
        total: 156,
        today: 5,
        thisWeek: 23,
        thisMonth: 87,
        byStatus: {
          pending_payment: 12,
          paid: 89,
          scheduled: 34,
          completed: 15,
          cancelled: 6,
        },
        byType: {
          'Messe pour un défunt': 78,
          'Messe d\'action de grâces': 45,
          'Neuvaine': 23,
          'Messe d\'anniversaire': 10,
        },
        totalAmount: 780000,
        averageAmount: 5000,
      },
    },
  })
  async getMassRequestsStats() {
    return this.massRequestsService.getMassRequestsStats();
  }

  @Get(':id')
  @Permissions.Masses.Read()
  @ApiOperation({
    summary: 'Détails d\'une demande spécifique',
    description: `
🔒 **Permission requise** : Lecture sur les messes

Récupère les détails complets d'une demande de messe avec toutes les informations associées.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la demande de messe',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demande de messe trouvée',
    type: MassRequestResponseDto,
  })
  async findMassRequestById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MassRequestResponseDto> {
    return this.massRequestsService.findMassRequestById(id);
  }

  @Put(':id')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Modifier une demande de messe',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Modifie les détails d'une demande de messe existante.

**Modifications possibles :**
- Informations du demandeur
- Type de demande et tarif
- Statut et suivi
- Associations avec paiements
- Raisons d'annulation

**Note :** Certaines modifications peuvent être restreintes selon le statut.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la demande à modifier',
    example: 1,
  })
  @ApiBody({ type: UpdateMassRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demande modifiée avec succès',
    type: MassRequestResponseDto,
  })
  async updateMassRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateMassRequestDto,
  ): Promise<MassRequestResponseDto> {
    return this.massRequestsService.updateMassRequest(id, updateDto);
  }

  @Put(':id/cancel')
  @Permissions.Masses.Write()
  @ApiOperation({
    summary: 'Annuler une demande de messe',
    description: `
🔒 **Permission requise** : Écriture sur les messes

Annule une demande de messe avec possibilité de spécifier une raison.

**Restrictions :**
- Impossible d'annuler une demande déjà complétée
- Impossible d'annuler une demande déjà annulée

**Effet :** Change le statut à "cancelled" et enregistre la date d'annulation.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la demande à annuler',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Raison de l\'annulation',
          example: 'Annulation à la demande de la famille',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demande annulée avec succès',
    type: MassRequestResponseDto,
  })
  async cancelMassRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ): Promise<MassRequestResponseDto> {
    return this.massRequestsService.cancelMassRequest(id, body.reason);
  }

  @Delete(':id')
  @Permissions.Masses.Delete()
  @ApiOperation({
    summary: 'Supprimer une demande de messe',
    description: `
🔒 **Permission requise** : Suppression sur les messes

⚠️ **Action irréversible** - Supprime définitivement une demande de messe.

**Recommandation :** Préférer l'annulation à la suppression pour conserver l'historique.

**Impact :** Peut affecter les statistiques et les rapports financiers.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Identifiant de la demande à supprimer',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Demande supprimée avec succès',
    schema: {
      example: {
        message: 'Demande de messe "Messe pour un défunt de Jean Kouassi" supprimée avec succès',
      },
    },
  })
  async deleteMassRequest(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.massRequestsService.deleteMassRequest(id);
  }
}
