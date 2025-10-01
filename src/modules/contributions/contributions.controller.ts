import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Request } from 'express';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  QueryCampaignsDto,
} from './dto/contribution-campaign.dto';
import {
  CreateCardDto,
  CardResponseDto,
} from './dto/contribution-card.dto';
import {
  CreateContributionDto,
  ContributionResponseDto,
} from './dto/create-contribution.dto';

@ApiTags('Contributions')
@Controller('contributions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  // ========================= CAMPAGNES =========================

  @Post('campaigns')
  @ApiOperation({
    summary: 'Créer une campagne de contribution',
    description: `
    Permet aux administrateurs de créer une nouvelle campagne de cotisation.
    
    **Fonctionnalités principales :**
    - Création de campagnes avec montants fixes ou variables
    - Définition de périodes de validité et ciblage des participants
    - Configuration d'objectifs financiers et de participation
    - Gestion automatique du statut de la campagne
    
    **Nouveaux champs de ciblage :**
    - target_group : Définit le groupe cible (all, adults, youth, families, specific)
    - target_participant_count : Nombre souhaité de participants
    - target_amount : Objectif financier total en FCFA
    - minimum_individual_amount : Contribution minimum individuelle
    
    **Exemples :**
    - Cotisation annuelle : is_fixed_amount=true, target_group=adults, fixed_amount=25000
    - Construction : is_fixed_amount=false, target_group=all, target_amount=50000000
    - Activités jeunes : is_fixed_amount=false, target_group=youth, target_amount=2000000
    
    **Permissions requises :** contributions.create
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Campagne créée avec succès',
    type: CampaignResponseDto,
    schema: {
      example: {
        id: 1,
        name: 'Construction Nouvelle Église 2025',
        description: 'Campagne pour financer la construction de la nouvelle église paroissiale',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        is_fixed_amount: false,
        fixed_amount: null,
        target_group: 'all',
        target_participant_count: 300,
        target_amount: 10000000,
        minimum_individual_amount: 5000,
        status: 'active',
        total_cards: 0,
        total_collected: 0,
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides',
    schema: {
      example: {
        statusCode: 400,
        message: 'La date de fin doit être postérieure à la date de début',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Non authentifié',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Permissions insuffisantes',
    schema: {
      example: {
        statusCode: 403,
        message: 'Accès refusé. Permission contributions.create requise.',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Utilisateur créateur non trouvé',
    schema: {
      example: {
        statusCode: 404,
        message: 'Utilisateur créateur non trouvé',
        error: 'Not Found',
      },
    },
  })
  @Permissions.Contributions.Create()
  async createCampaign(
    @Body() createDto: CreateCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const userId = (req as any).user?.id;
    return this.contributionsService.createCampaign(createDto, userId);
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Lister les campagnes',
    description: 'Recupere la liste des campagnes avec pagination et filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes recuperee avec succes',
  })
  @Permissions.Contributions.Read()
  async findAllCampaigns(@Query() queryDto: QueryCampaignsDto) {
    return this.contributionsService.findAllCampaigns(queryDto);
  }

  @Get('campaigns/:id')
  @ApiOperation({
    summary: 'Details d\'une campagne',
    description: 'Recupere les details complets d\'une campagne par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Details de la campagne',
    type: CampaignResponseDto,
  })
  @Permissions.Contributions.Read()
  async findCampaignById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CampaignResponseDto> {
    return this.contributionsService.findCampaignById(id);
  }

  @Put('campaigns/:id')
  @ApiOperation({
    summary: 'Modifier une campagne',
    description: 'Modifie les informations d\'une campagne existante',
  })
  @ApiResponse({
    status: 200,
    description: 'Campagne modifiee avec succes',
    type: CampaignResponseDto,
  })
  @Permissions.Contributions.Update()
  async updateCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.contributionsService.updateCampaign(id, updateDto);
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une campagne',
    description: 'Supprime une campagne (uniquement si aucune carte n\'existe)',
  })
  @ApiResponse({
    status: 204,
    description: 'Campagne supprimee avec succes',
  })
  @Permissions.Contributions.Delete()
  async deleteCampaign(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contributionsService.deleteCampaign(id);
  }

  // ========================= CARTES =========================

  @Post('cards')
  @ApiOperation({
    summary: 'Creer une carte de contribution',
    description: 'Cree une nouvelle carte virtuelle ou physique pour une campagne',
  })
  @ApiResponse({
    status: 201,
    description: 'Carte creee avec succes',
    type: CardResponseDto,
  })
  @Permissions.Contributions.Create()
  async createCard(@Body() createDto: CreateCardDto): Promise<CardResponseDto> {
    return this.contributionsService.createCard(createDto);
  }

  // ========================= CONTRIBUTIONS =========================

  @Post('cards/:cardId/contribute')
  @ApiOperation({
    summary: 'Ajouter une contribution à une carte',
    description: `
    Permet d'enregistrer une nouvelle contribution sur une carte de cotisation.
    
    **Modes de contribution :**
    - **En ligne (online)** : Contribution via paiement mobile/carte bancaire
    - **En espèces (cash_on_site)** : Contribution collectée physiquement
    
    **Fonctionnalités :**
    - Enregistrement de la contribution dans contributions
    - Mise à jour automatique du current_balance de la carte
    - Traçabilité complète (qui, quand, combien, comment)
    - Lien avec le système de paiements pour les contributions en ligne
    
    **Validation :**
    - La carte doit exister et être active
    - Le montant doit être positif
    - Pour cash_on_site : collected_by_user_id obligatoire
    - Pour online : contributor_user_id recommandé
    
    **Permissions requises :** contributions.create
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Contribution enregistrée avec succès',
    type: ContributionResponseDto,
    schema: {
      example: {
        id: 1,
        card: {
          id: '47057c70-71c6-48bd-bd48-d7a669c6b271',
          card_number: 'CARD-2025-000002',
          campaign_name: 'Test avec nouveaux champs',
        },
        contributor_user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@test.com',
        },
        amount: 5000,
        contribution_method: 'online',
        collected_by_user: null,
        payment: null,
        contribution_date: '2025-09-30T12:00:00.000Z',
        notes: 'Contribution via application mobile',
        created_at: '2025-09-30T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
    schema: {
      example: {
        statusCode: 400,
        message: 'collected_by_user_id requis pour les contributions en espèces',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carte non trouvée',
    schema: {
      example: {
        statusCode: 404,
        message: 'Carte de contribution non trouvée',
        error: 'Not Found',
      },
    },
  })
  @Permissions.Contributions.Create()
  async addContribution(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() createDto: CreateContributionDto,
    @Req() req: Request,
  ): Promise<ContributionResponseDto> {
    const userId = (req as any).user?.id;
    return this.contributionsService.addContribution(cardId, createDto, userId);
  }

  @Get('cards/:cardId/contributions')
  @ApiOperation({
    summary: 'Lister les contributions d\'une carte',
    description: 'Recupere la liste des contributions pour une carte donnée',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des contributions de la carte',
    type: [ContributionResponseDto],
  })
  @Permissions.Contributions.Read()
  async getCardContributions(
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ) {
    return this.contributionsService.getCardContributions(cardId);
  }

  @Get('cards/:id')
  @ApiOperation({
    summary: 'Details d\'une carte',
    description: 'Recupere les details d\'une carte par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Details de la carte',
    type: CardResponseDto,
  })
  @Permissions.Contributions.Read()
  async findCardById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CardResponseDto> {
    return this.contributionsService.findCardById(id);
  }
}
