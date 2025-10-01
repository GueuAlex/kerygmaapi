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
  ParseUUIDPipe,
  ValidationPipe,
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
  CreateOfferingCampaignDto,
  UpdateOfferingCampaignDto,
  OfferingCampaignResponseDto,
  QueryOfferingCampaignsDto,
  OfferingCampaignsListResponseDto,
} from './dto/offering-campaign.dto';

import { Permissions } from '../../auth/decorators/permissions.decorator';

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
  @Permissions.Offerings.Create()
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
  @Permissions.Offerings.Read()
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
  @Permissions.Offerings.Read()
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
  @Permissions.Offerings.Update()
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
  @Permissions.Offerings.Delete()
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
  @Permissions.Offerings.Create()
  async createOffering(
    @Body(ValidationPipe) createOfferingDto: CreateOfferingDto,
    @Request() req: { user: any },
  ): Promise<OfferingResponseDto> {
    return this.offeringsService.createOffering(
      createOfferingDto,
      req.user.userId,
    );
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
  @Permissions.Offerings.Read()
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
  @Permissions.Offerings.Read()
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
  @Permissions.Offerings.Update()
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
  @Permissions.Offerings.Delete()
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
    type: OfferingCampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @Permissions.Offerings.Create()
  async createCampaign(
    @Body(ValidationPipe) createCampaignDto: CreateOfferingCampaignDto,
    @Request() req: { user: any },
  ): Promise<OfferingCampaignResponseDto> {
    return this.offeringsService.createCampaign(
      createCampaignDto,
      req.user.userId,
    );
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
    type: OfferingCampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campagne non trouvee' })
  @Permissions.Offerings.Read()
  async getCampaign(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OfferingCampaignResponseDto> {
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
    type: OfferingCampaignResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Donnees invalides' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvee' })
  @Permissions.Offerings.Update()
  async updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCampaignDto: UpdateOfferingCampaignDto,
    @Request() req: { user: any },
  ): Promise<OfferingCampaignResponseDto> {
    return this.offeringsService.updateCampaign(
      id,
      updateCampaignDto,
      req.user.userId,
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
  @Permissions.Offerings.Delete()
  async deleteCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: any },
  ): Promise<void> {
    return this.offeringsService.deleteCampaign(id, req.user.userId);
  }

  // === ENDPOINTS PUBLICS (sans authentification) ===

  @Get('public/campaigns')
  @ApiOperation({
    summary: 'Lister toutes les campagnes d\'offrandes',
    description: 'Recupere la liste paginee de toutes les campagnes avec filtres',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les campagnes',
    type: OfferingCampaignsListResponseDto,
  })
  async getAllCampaigns(
    @Query(ValidationPipe) query: QueryOfferingCampaignsDto,
  ): Promise<OfferingCampaignsListResponseDto> {
    return this.offeringsService.findAllCampaigns(query);
  }

  @Get('public/campaigns/:id')
  @ApiOperation({
    summary: 'Recuperer une campagne',
    description: "Recupere les details d'une campagne avec statistiques",
  })
  @ApiParam({ name: 'id', description: 'ID de la campagne' })
  @ApiResponse({
    status: 200,
    description: 'Details de la campagne',
    type: OfferingCampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campagne non trouvee',
  })
  async getPublicCampaignDetails(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OfferingCampaignResponseDto> {
    return this.offeringsService.findCampaignById(id);
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
    }

    if (!createOfferingDto.anonymous_donor_info?.full_name) {
      throw new BadRequestException(
        'Informations du donateur anonyme requises',
      );
    }

    return this.offeringsService.createOffering(createOfferingDto, undefined);
  }
}
