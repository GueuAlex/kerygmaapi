import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { OfferingsService } from './offerings.service';

import {
  CreateOfferingTypeDto,
  UpdateOfferingTypeDto,
  OfferingTypeResponseDto,
  QueryOfferingTypesDto,
  OfferingTypesListResponseDto,
} from './dto/offering-type.dto';

import {
  CreateOfferingDto,
  UpdateOfferingDto,
  OfferingResponseDto,
  QueryOfferingsDto,
  OfferingsListResponseDto,
} from './dto/offering.dto';

import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  QueryCampaignsDto,
  CampaignsListResponseDto,
} from './dto/offering-campaign.dto';

import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Offrandes')
@Controller('offerings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  // === GESTION DES TYPES D'OFFRANDES ===

  @Post('types')
  @ApiOperation({
    summary: "Creer un nouveau type d'offrande",
    description:
      "Permet de creer un nouveau type d'offrande avec nom et description",
  })
  @ApiResponse({
    status: 201,
    description: "Type d'offrande cree avec succes",
    type: OfferingTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifie' })
  @ApiResponse({ status: 403, description: 'Permissions insuffisantes' })
  @ApiResponse({ status: 409, description: "Type d'offrande deja existant" })
  @RequirePermissions('offerings', 'create')
  async createOfferingType(
    @Body(ValidationPipe) createOfferingTypeDto: CreateOfferingTypeDto,
  ): Promise<OfferingTypeResponseDto> {
    return this.offeringsService.createOfferingType(createOfferingTypeDto);
  }

  @Get('types')
  @ApiOperation({
    summary: "Lister les types d'offrandes",
    description: "Recupere la liste paginee des types d'offrandes avec filtres",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des types d'offrandes",
    type: OfferingTypesListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Recherche par nom',
  })
  @ApiQuery({
    name: 'is_active',
    required: false,
    description: 'Filtrer par statut actif',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Numero de page' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: "Nombre d'elements par page",
  })
  @RequirePermissions('offerings', 'read')
  async getOfferingTypes(
    @Query(ValidationPipe) query: QueryOfferingTypesDto,
  ): Promise<OfferingTypesListResponseDto> {
    return this.offeringsService.findAllOfferingTypes(query);
  }

  @Get('types/:id')
  @ApiOperation({
    summary: "Recuperer un type d'offrande",
    description: "Recupere les details d'un type d'offrande specifique",
  })
  @ApiParam({ name: 'id', description: "ID du type d'offrande" })
  @ApiResponse({
    status: 200,
    description: "Details du type d'offrande",
    type: OfferingTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Type d'offrande non trouve" })
  @RequirePermissions('offerings', 'read')
  async getOfferingType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OfferingTypeResponseDto> {
    return this.offeringsService.findOfferingTypeById(id);
  }

  @Put('types/:id')
  @ApiOperation({
    summary: "Mettre a jour un type d'offrande",
    description: "Met a jour les informations d'un type d'offrande",
  })
  @ApiParam({ name: 'id', description: "ID du type d'offrande" })
  @ApiResponse({
    status: 200,
    description: "Type d'offrande mis a jour",
    type: OfferingTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: "Type d'offrande non trouve" })
  @RequirePermissions('offerings', 'update')
  async updateOfferingType(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOfferingTypeDto: UpdateOfferingTypeDto,
  ): Promise<OfferingTypeResponseDto> {
    return this.offeringsService.updateOfferingType(id, updateOfferingTypeDto);
  }

  @Delete('types/:id')
  @ApiOperation({
    summary: "Supprimer un type d'offrande",
    description: "Supprime un type d'offrande (si aucune offrande associee)",
  })
  @ApiParam({ name: 'id', description: "ID du type d'offrande" })
  @ApiResponse({ status: 204, description: "Type d'offrande supprime" })
  @ApiResponse({ status: 404, description: "Type d'offrande non trouve" })
  @ApiResponse({
    status: 409,
    description: "Type d'offrande utilise par des offrandes",
  })
  @RequirePermissions('offerings', 'delete')
  async deleteOfferingType(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.offeringsService.deleteOfferingType(id);
  }

  // === GESTION DES OFFRANDES ===

  @Post()
  @ApiOperation({
    summary: 'Enregistrer une nouvelle offrande',
    description: 'Enregistre une offrande avec support des donateurs anonymes',
  })
  @ApiResponse({
    status: 201,
    description: 'Offrande enregistree avec succes',
    type: OfferingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({
    status: 404,
    description: "Type d'offrande ou campagne non trouve",
  })
  @RequirePermissions('offerings', 'create')
  async createOffering(
    @Body(ValidationPipe) createOfferingDto: CreateOfferingDto,
    @Request() req: { user: any },
  ): Promise<OfferingResponseDto> {
    return this.offeringsService.createOffering(createOfferingDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les offrandes',
    description: 'Recupere la liste paginee des offrandes avec filtres avances',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des offrandes',
    type: OfferingsListResponseDto,
  })
  @ApiQuery({
    name: 'offering_type_id',
    required: false,
    description: 'Filtrer par type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'campaign_id',
    required: false,
    description: 'Filtrer par campagne',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Date de debut (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Date de fin (YYYY-MM-DD)',
  })
  @RequirePermissions('offerings', 'read')
  async getOfferings(
    @Query(ValidationPipe) query: QueryOfferingsDto,
  ): Promise<OfferingsListResponseDto> {
    return this.offeringsService.findAllOfferings(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Recuperer une offrande',
    description: "Recupere les details d'une offrande specifique",
  })
  @ApiParam({ name: 'id', description: "ID de l'offrande" })
  @ApiResponse({
    status: 200,
    description: "Details de l'offrande",
    type: OfferingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Offrande non trouvee' })
  @RequirePermissions('offerings', 'read')
  async getOffering(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OfferingResponseDto> {
    return this.offeringsService.findOfferingById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre a jour une offrande',
    description: "Met a jour le statut ou d'autres informations d'une offrande",
  })
  @ApiParam({ name: 'id', description: "ID de l'offrande" })
  @ApiResponse({
    status: 200,
    description: 'Offrande mise a jour',
    type: OfferingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Offrande non trouvee' })
  @RequirePermissions('offerings', 'update')
  async updateOffering(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOfferingDto: UpdateOfferingDto,
  ): Promise<OfferingResponseDto> {
    return this.offeringsService.updateOffering(id, updateOfferingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une offrande',
    description: 'Supprime une offrande (action sensible)',
  })
  @ApiParam({ name: 'id', description: "ID de l'offrande" })
  @ApiResponse({ status: 204, description: 'Offrande supprimee' })
  @ApiResponse({ status: 404, description: 'Offrande non trouvee' })
  @RequirePermissions('offerings', 'delete')
  async deleteOffering(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.offeringsService.deleteOffering(id);
  }

  // === GESTION DES CAMPAGNES D'OFFRANDES ===

  @Post('campaigns')
  @ApiOperation({
    summary: "Creer une nouvelle campagne d'offrandes",
    description: "Cree une campagne d'offrandes avec objectif et dates",
  })
  @ApiResponse({
    status: 201,
    description: 'Campagne creee avec succes',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @RequirePermissions('offerings', 'create')
  async createCampaign(
    @Body(ValidationPipe) createCampaignDto: CreateCampaignDto,
    @Request() req: { user: any },
  ): Promise<CampaignResponseDto> {
    return this.offeringsService.createCampaign(createCampaignDto, req.user.id);
  }

  @Get('campaigns')
  @ApiOperation({
    summary: "Lister les campagnes d'offrandes",
    description: 'Recupere la liste paginee des campagnes avec filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes',
    type: CampaignsListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Recherche par nom',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'is_public',
    required: false,
    description: 'Campagnes publiques uniquement',
  })
  @RequirePermissions('offerings', 'read')
  async getCampaigns(
    @Query(ValidationPipe) query: QueryCampaignsDto,
  ): Promise<CampaignsListResponseDto> {
    return this.offeringsService.findAllCampaigns(query);
  }

  @Get('campaigns/:id')
  @ApiOperation({
    summary: 'Recuperer une campagne',
    description: "Recupere les details d'une campagne avec statistiques",
  })
  @ApiParam({ name: 'id', description: 'ID de la campagne' })
  @ApiResponse({
    status: 200,
    description: 'Details de la campagne',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campagne non trouvee' })
  @RequirePermissions('offerings', 'read')
  async getCampaign(@Param('id') id: string): Promise<CampaignResponseDto> {
    return this.offeringsService.findCampaignById(id);
  }

  @Put('campaigns/:id')
  @ApiOperation({
    summary: 'Mettre a jour une campagne',
    description: "Met a jour les informations d'une campagne d'offrandes",
  })
  @ApiParam({ name: 'id', description: 'ID de la campagne' })
  @ApiResponse({
    status: 200,
    description: 'Campagne mise a jour',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvee' })
  @RequirePermissions('offerings', 'update')
  async updateCampaign(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCampaignDto: UpdateCampaignDto,
    @Request() req: { user: any },
  ): Promise<CampaignResponseDto> {
    return this.offeringsService.updateCampaign(
      id,
      updateCampaignDto,
      req.user.id,
    );
  }

  @Delete('campaigns/:id')
  @ApiOperation({
    summary: 'Supprimer une campagne',
    description:
      "Supprime une campagne d'offrandes (si aucune offrande associee)",
  })
  @ApiParam({ name: 'id', description: 'ID de la campagne' })
  @ApiResponse({ status: 204, description: 'Campagne supprimee' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvee' })
  @ApiResponse({
    status: 409,
    description: 'Campagne utilisee par des offrandes',
  })
  @RequirePermissions('offerings', 'delete')
  async deleteCampaign(
    @Param('id') id: string,
    @Request() req: { user: any },
  ): Promise<void> {
    return this.offeringsService.deleteCampaign(id, req.user.id);
  }

  // === ENDPOINTS PUBLICS (sans authentification) ===

  @Get('public/campaigns')
  @ApiOperation({
    summary: 'Lister les campagnes publiques',
    description: 'Recupere les campagnes publiques visibles par tous',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des campagnes publiques',
    type: CampaignsListResponseDto,
  })
  async getPublicCampaigns(
    @Query(ValidationPipe) query: QueryCampaignsDto,
  ): Promise<CampaignsListResponseDto> {
    const publicQuery = { ...query, is_public: true };
    return this.offeringsService.findAllCampaigns(publicQuery);
  }

  @Get('public/campaigns/:id')
  @ApiOperation({
    summary: 'Recuperer une campagne publique',
    description: "Recupere les details d'une campagne publique",
  })
  @ApiParam({ name: 'id', description: 'ID de la campagne' })
  @ApiResponse({
    status: 200,
    description: 'Details de la campagne publique',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvee ou non publique',
  })
  async getPublicCampaign(
    @Param('id') id: string,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.offeringsService.findCampaignById(id);
    if (!campaign.settings?.is_public) {
      throw new NotFoundException('Campagne non trouvee ou non publique');
    }
    return campaign;
  }

  @Post('public/offerings')
  @ApiOperation({
    summary: 'Faire un don anonyme',
    description: 'Permet aux visiteurs non authentifies de faire des dons',
  })
  @ApiResponse({
    status: 201,
    description: 'Don anonyme enregistre',
    type: OfferingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvee ou fermee aux anonymes',
  })
  async createAnonymousOffering(
    @Body(ValidationPipe) createOfferingDto: CreateOfferingDto,
  ): Promise<OfferingResponseDto> {
    if (createOfferingDto.campaign_id) {
      const campaign = await this.offeringsService.findCampaignById(
        createOfferingDto.campaign_id,
      );
      if (!campaign.settings?.allow_anonymous) {
        throw new ForbiddenException(
          "Cette campagne n'accepte pas les dons anonymes",
        );
      }
    }

    if (!createOfferingDto.anonymous_donor_info?.full_name) {
      throw new BadRequestException(
        'Informations du donateur anonyme requises',
      );
    }

    return this.offeringsService.createOffering(createOfferingDto, undefined);
  }
}
