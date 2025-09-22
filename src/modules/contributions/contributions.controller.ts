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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Request } from 'express';
import { UserRole } from '../../modules/users/entities/user.entity';
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

@ApiTags('Contributions')
@Controller('api/v1/contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  // ========================= CAMPAGNES =========================

  @Post('campaigns')
  @ApiOperation({
    summary: 'Créer une campagne de contribution',
    description: `
    Permet aux administrateurs de créer une nouvelle campagne de cotisation.
    
    **Fonctionnalités :**
    - Création de campagnes avec montants fixes ou variables
    - Définition de périodes de validité
    - Gestion automatique du statut de la campagne
    
    **Permissions requises :** ADMIN ou PARISH_ADMIN
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
        message: 'Accès refusé. Rôle ADMIN ou PARISH_ADMIN requis.',
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
  @Roles(UserRole.ADMIN, UserRole.PARISH_ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.PARISH_ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.PARISH_ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.PARISH_ADMIN)
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
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN, UserRole.PARISH_ADMIN)
  async createCard(@Body() createDto: CreateCardDto): Promise<CardResponseDto> {
    return this.contributionsService.createCard(createDto);
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
  async findCardById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CardResponseDto> {
    return this.contributionsService.findCardById(id);
  }
}
