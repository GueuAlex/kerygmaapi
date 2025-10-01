import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offering, OfferingStatus } from './entities/offering.entity';
import { OfferingType } from './entities/offering-type.entity';
import { OfferingCampaign, CampaignStatus } from './entities/offering-campaign.entity';
import { User } from '../users/entities/user.entity';

import { 
  CreateOfferingTypeDto, 
  UpdateOfferingTypeDto, 
  OfferingTypeResponseDto,
  QueryOfferingTypesDto,
  OfferingTypesListResponseDto
} from './dto/offering-type.dto';

import {
  CreateOfferingDto,
  UpdateOfferingDto,
  OfferingResponseDto,
  QueryOfferingsDto,
  OfferingsListResponseDto
} from './dto/offering.dto';

import {
  CreateOfferingCampaignDto,
  UpdateOfferingCampaignDto,
  OfferingCampaignResponseDto,
  QueryOfferingCampaignsDto,
  OfferingCampaignsListResponseDto
} from './dto/offering-campaign.dto';

@Injectable()
export class OfferingsService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepository: Repository<Offering>,
    @InjectRepository(OfferingType)
    private readonly offeringTypeRepository: Repository<OfferingType>,
    @InjectRepository(OfferingCampaign)
    private readonly campaignRepository: Repository<OfferingCampaign>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ===================== UTILITAIRES =====================

  private async checkAdminPermissions(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    
    if (!user || !user.userRoles) return false;
    
    const roleNames = user.userRoles.map((ur) => ur.role.name);
    return roleNames.includes('admin') || roleNames.includes('parish_admin');
  }

  private async canModifyOffering(offeringUserId: string | null, currentUserId?: string): Promise<boolean> {
    if (!currentUserId) return false;
    
    // L'utilisateur peut modifier sa propre offrande
    if (offeringUserId === currentUserId) return true;
    
    // Ou si c'est un admin
    return this.checkAdminPermissions(currentUserId);
  }

  // ===================== TYPES D'OFFRANDES =====================

  async createOfferingType(createDto: CreateOfferingTypeDto): Promise<OfferingTypeResponseDto> {
    // Vérifier l'unicité du nom
    const existingType = await this.offeringTypeRepository.findOne({
      where: { name: createDto.name }
    });

    if (existingType) {
      throw new ConflictException(`Le type d'offrande "${createDto.name}" existe déjà`);
    }

    const offeringType = this.offeringTypeRepository.create({
      ...createDto,
      is_active: createDto.is_active ?? true,
    });

    const savedType = await this.offeringTypeRepository.save(offeringType);
    return this.mapOfferingTypeToResponse(savedType);
  }

  async findAllOfferingTypes(queryDto: QueryOfferingTypesDto): Promise<OfferingTypesListResponseDto> {
    const {
      search,
      is_active,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = queryDto;

    const queryBuilder = this.offeringTypeRepository.createQueryBuilder('type');

    // Filtres
    if (search) {
      queryBuilder.andWhere('type.name ILIKE :search OR type.description ILIKE :search', {
        search: `%${search}%`
      });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('type.is_active = :is_active', { is_active });
    }

    // Tri
    queryBuilder.orderBy(`type.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [types, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: types.map(type => this.mapOfferingTypeToResponse(type)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOfferingTypeById(id: number): Promise<OfferingTypeResponseDto> {
    const offeringType = await this.offeringTypeRepository.findOne({
      where: { id }
    });

    if (!offeringType) {
      throw new NotFoundException(`Type d'offrande avec l'ID ${id} non trouvé`);
    }

    return this.mapOfferingTypeToResponse(offeringType);
  }

  async updateOfferingType(id: number, updateDto: UpdateOfferingTypeDto): Promise<OfferingTypeResponseDto> {
    const offeringType = await this.offeringTypeRepository.findOne({
      where: { id }
    });

    if (!offeringType) {
      throw new NotFoundException(`Type d'offrande avec l'ID ${id} non trouvé`);
    }

    // Vérifier l'unicité du nom si modifié
    if (updateDto.name && updateDto.name !== offeringType.name) {
      const existingType = await this.offeringTypeRepository.findOne({
        where: { name: updateDto.name }
      });

      if (existingType) {
        throw new ConflictException(`Le type d'offrande "${updateDto.name}" existe déjà`);
      }
    }

    Object.assign(offeringType, updateDto);
    const updatedType = await this.offeringTypeRepository.save(offeringType);
    
    return this.mapOfferingTypeToResponse(updatedType);
  }

  async deleteOfferingType(id: number): Promise<void> {
    const offeringType = await this.offeringTypeRepository.findOne({
      where: { id }
    });

    if (!offeringType) {
      throw new NotFoundException(`Type d'offrande avec l'ID ${id} non trouvé`);
    }

    // Vérifier s'il y a des offrandes associées
    const offeringsCount = await this.offeringRepository.count({
      where: { offering_type: { id } }
    });

    if (offeringsCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer ce type d'offrande. ${offeringsCount} offrandes sont associées.`
      );
    }

    await this.offeringTypeRepository.remove(offeringType);
  }

  // ===================== OFFRANDES =====================

  async createOffering(createDto: CreateOfferingDto, userId?: string): Promise<OfferingResponseDto> {
    // Vérifier que le type d'offrande existe
    const offeringType = await this.offeringTypeRepository.findOne({
      where: { id: createDto.offering_type_id, is_active: true }
    });

    if (!offeringType) {
      throw new NotFoundException(`Type d'offrande avec l'ID ${createDto.offering_type_id} non trouvé ou inactif`);
    }

    // Vérifier la campagne si spécifiée
    if (createDto.campaign_id) {
      const campaign = await this.campaignRepository.findOne({
        where: { id: createDto.campaign_id, status: CampaignStatus.ACTIVE }
      });

      if (!campaign) {
        throw new NotFoundException(`Campagne "${createDto.campaign_id}" non trouvée ou inactive`);
      }

      // Vérifier si la campagne est encore active
      const today = new Date().toISOString().split('T')[0];
      if (campaign.start_date > today || campaign.end_date < today) {
        throw new BadRequestException('Cette campagne n\'est plus active');
      }
    }

    const offering = this.offeringRepository.create({
      offering_type: offeringType,
      user: userId ? { id: userId } : undefined,
      amount: createDto.amount,
      message: createDto.message,
      payment_method: createDto.payment_method,
      anonymous_donor_info: createDto.anonymous_donor_info,
      campaign: createDto.campaign_id ? { id: createDto.campaign_id } : undefined,
      status: OfferingStatus.PENDING,
    });

    const savedOffering = await this.offeringRepository.save(offering);
    return this.findOfferingById(savedOffering.id);
  }

  async findAllOfferings(queryDto: QueryOfferingsDto): Promise<OfferingsListResponseDto> {
    const {
      offering_type_id,
      status,
      payment_method,
      start_date,
      end_date,
      min_amount,
      max_amount,
      campaign_id,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = queryDto;

    const queryBuilder = this.offeringRepository.createQueryBuilder('offering')
      .leftJoinAndSelect('offering.offering_type', 'type')
      .leftJoinAndSelect('offering.user', 'user');

    // Filtres
    if (offering_type_id) {
      queryBuilder.andWhere('type.id = :offering_type_id', { offering_type_id });
    }

    if (status) {
      queryBuilder.andWhere('offering.status = :status', { status });
    }

    if (payment_method) {
      queryBuilder.andWhere('offering.payment_method = :payment_method', { payment_method });
    }

    if (start_date) {
      queryBuilder.andWhere('DATE(offering.created_at) >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('DATE(offering.created_at) <= :end_date', { end_date });
    }

    if (min_amount) {
      queryBuilder.andWhere('offering.amount >= :min_amount', { min_amount });
    }

    if (max_amount) {
      queryBuilder.andWhere('offering.amount <= :max_amount', { max_amount });
    }

    if (campaign_id) {
      queryBuilder.andWhere('offering.campaign_id = :campaign_id', { campaign_id });
    }

    // Tri
    queryBuilder.orderBy(`offering.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [offerings, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: offerings.map(offering => this.mapOfferingToResponse(offering)),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOfferingById(id: number): Promise<OfferingResponseDto> {
    const offering = await this.offeringRepository.findOne({
      where: { id },
      relations: ['offering_type', 'user']
    });

    if (!offering) {
      throw new NotFoundException(`Offrande avec l'ID ${id} non trouvée`);
    }

    return this.mapOfferingToResponse(offering);
  }

  async updateOffering(id: number, updateDto: UpdateOfferingDto, userId?: string): Promise<OfferingResponseDto> {
    const offering = await this.offeringRepository.findOne({
      where: { id },
      relations: ['offering_type', 'user']
    });

    if (!offering) {
      throw new NotFoundException(`Offrande avec l'ID ${id} non trouvée`);
    }

    // Seul le créateur ou un admin peut modifier
    if (userId && !(await this.canModifyOffering(offering.user?.id || null, userId))) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres offrandes');
    }

    Object.assign(offering, updateDto);
    const updatedOffering = await this.offeringRepository.save(offering);
    
    return this.mapOfferingToResponse(updatedOffering);
  }

  async deleteOffering(id: number, userId?: string): Promise<void> {
    const offering = await this.offeringRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!offering) {
      throw new NotFoundException(`Offrande avec l'ID ${id} non trouvée`);
    }

    // Seul le créateur ou un admin peut supprimer
    if (userId && !(await this.canModifyOffering(offering.user?.id || null, userId))) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres offrandes');
    }

    // On ne peut supprimer que les offrandes en attente
    if (offering.status === OfferingStatus.COMPLETED) {
      throw new BadRequestException('Impossible de supprimer une offrande terminée');
    }

    await this.offeringRepository.remove(offering);
  }

  // ===================== CAMPAGNES =====================

  async createCampaign(createDto: CreateOfferingCampaignDto, userId: string): Promise<OfferingCampaignResponseDto> {
    // Valider que l'utilisateur est authentifie
    if (!userId) {
      throw new BadRequestException('Utilisateur non authentifie');
    }

    // Valider les dates
    if (createDto.start_date >= createDto.end_date) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    const campaign = this.campaignRepository.create({
      ...createDto,
      created_by_user_id: userId,
      status: CampaignStatus.DRAFT,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);
    return this.findCampaignById(savedCampaign.id);
  }

  async findAllCampaigns(queryDto: QueryOfferingCampaignsDto): Promise<OfferingCampaignsListResponseDto> {
    console.log('🔍 [OFFERINGS SERVICE] Données reçues du controller:', JSON.stringify(queryDto, null, 2));
    
    const {
      search,
      status,
      start_date,
      end_date,
      is_public,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = queryDto;

    // Conversion et valeurs par défaut pour les paramètres numériques
    const page = typeof queryDto.page === 'string' ? parseInt(queryDto.page, 10) || 1 : queryDto.page || 1;
    const limit = typeof queryDto.limit === 'string' ? parseInt(queryDto.limit, 10) || 10 : queryDto.limit || 10;

    console.log('📊 [OFFERINGS SERVICE] Paramètres après destructuration:', {
      search, status, start_date, end_date, is_public, page, limit, sortBy, sortOrder
    });

    const queryBuilder = this.campaignRepository.createQueryBuilder('campaign');

    // Filtres
    if (search) {
      queryBuilder.andWhere('campaign.name ILIKE :search OR campaign.description ILIKE :search', {
        search: `%${search}%`
      });
    }

    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    if (start_date) {
      queryBuilder.andWhere('campaign.start_date >= :start_date', { start_date });
    }

    if (end_date) {
      queryBuilder.andWhere('campaign.end_date <= :end_date', { end_date });
    }


    // Tri
    queryBuilder.orderBy(`campaign.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [campaigns, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => this.mapCampaignToResponse(campaign))
    );

    return {
      data: campaignsWithStats,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findCampaignById(id: string): Promise<OfferingCampaignResponseDto> {
    const campaign = await this.campaignRepository.findOne({
      where: { id }
    });

    if (!campaign) {
      throw new NotFoundException(`Campagne avec l'ID ${id} non trouvée`);
    }

    return this.mapCampaignToResponse(campaign);
  }

  async updateCampaign(id: string, updateDto: UpdateOfferingCampaignDto, userId: string): Promise<OfferingCampaignResponseDto> {
    const campaign = await this.campaignRepository.findOne({
      where: { id }
    });

    if (!campaign) {
      throw new NotFoundException(`Campagne avec l'ID ${id} non trouvée`);
    }

    // Seul le créateur ou un admin peut modifier
    if (campaign.created_by_user_id !== userId && !(await this.checkAdminPermissions(userId))) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres campagnes');
    }

    // Validation des dates si modifiées
    const newStartDate = updateDto.start_date || campaign.start_date;
    const newEndDate = updateDto.end_date || campaign.end_date;
    
    if (newStartDate >= newEndDate) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    Object.assign(campaign, updateDto);
    const updatedCampaign = await this.campaignRepository.save(campaign);
    
    return this.mapCampaignToResponse(updatedCampaign);
  }

  async deleteCampaign(id: string, userId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id }
    });

    if (!campaign) {
      throw new NotFoundException(`Campagne avec l'ID ${id} non trouvée`);
    }

    // Seul le créateur ou un admin peut supprimer
    if (campaign.created_by_user_id !== userId && !(await this.checkAdminPermissions(userId))) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres campagnes');
    }

    // Vérifier s'il y a des offrandes associées
    const offeringsCount = await this.offeringRepository.count({
      where: { campaign: { id: id } }
    });

    if (offeringsCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer cette campagne. ${offeringsCount} offrandes sont associées.`
      );
    }

    await this.campaignRepository.remove(campaign);
  }

  // ===================== STATISTIQUES =====================

  async getOfferingsStats(startDate?: string, endDate?: string, campaignId?: string) {
    const queryBuilder = this.offeringRepository.createQueryBuilder('offering')
      .leftJoin('offering.offering_type', 'type');

    if (startDate) {
      queryBuilder.andWhere('DATE(offering.created_at) >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(offering.created_at) <= :endDate', { endDate });
    }

    if (campaignId) {
      queryBuilder.andWhere('offering.campaign_id = :campaignId', { campaignId });
    }

    // Statistiques générales
    const totalStats = await queryBuilder
      .select([
        'COUNT(*) as total_offerings',
        'SUM(offering.amount) as total_amount',
        'AVG(offering.amount) as average_amount',
        'MIN(offering.amount) as min_amount',
        'MAX(offering.amount) as max_amount'
      ])
      .getRawOne();

    // Par statut
    const byStatus = await queryBuilder
      .select(['offering.status', 'COUNT(*) as count', 'SUM(offering.amount) as total'])
      .groupBy('offering.status')
      .getRawMany();

    // Par méthode de paiement
    const byPaymentMethod = await queryBuilder
      .select(['offering.payment_method', 'COUNT(*) as count', 'SUM(offering.amount) as total'])
      .groupBy('offering.payment_method')
      .getRawMany();

    // Par type d'offrande
    const byType = await queryBuilder
      .select(['type.name', 'COUNT(*) as count', 'SUM(offering.amount) as total'])
      .groupBy('type.name')
      .getRawMany();

    return {
      total: {
        offerings: parseInt(totalStats.total_offerings) || 0,
        amount: parseFloat(totalStats.total_amount) || 0,
        average: parseFloat(totalStats.average_amount) || 0,
        min: parseFloat(totalStats.min_amount) || 0,
        max: parseFloat(totalStats.max_amount) || 0,
      },
      by_status: byStatus.reduce((acc, item) => {
        acc[item.status] = {
          count: parseInt(item.count),
          total: parseFloat(item.total) || 0
        };
        return acc;
      }, {}),
      by_payment_method: byPaymentMethod.reduce((acc, item) => {
        acc[item.payment_method] = {
          count: parseInt(item.count),
          total: parseFloat(item.total) || 0
        };
        return acc;
      }, {}),
      by_type: byType.reduce((acc, item) => {
        acc[item.name] = {
          count: parseInt(item.count),
          total: parseFloat(item.total) || 0
        };
        return acc;
      }, {}),
    };
  }

  // ===================== MÉTHODES PRIVÉES =====================

  private mapOfferingTypeToResponse(offeringType: OfferingType): OfferingTypeResponseDto {
    return {
      id: offeringType.id,
      name: offeringType.name,
      description: offeringType.description,
      is_active: offeringType.is_active,
      created_at: offeringType.created_at,
      updated_at: offeringType.updated_at,
    };
  }

  private mapOfferingToResponse(offering: Offering): OfferingResponseDto {
    // Masquer les informations sensibles pour l'anonymat
    let donorInfo: { full_name?: string; is_anonymous?: boolean } | null = null;
    if (offering.user) {
      donorInfo = {
        full_name: this.maskName(offering.user.fullName),
        is_anonymous: false,
      };
    } else if (offering.anonymous_donor_info?.full_name) {
      donorInfo = {
        full_name: this.maskName(offering.anonymous_donor_info.full_name),
        is_anonymous: true,
      };
    }

    return {
      id: offering.id,
      offering_type: this.mapOfferingTypeToResponse(offering.offering_type),
      amount: offering.amount,
      message: offering.message,
      status: offering.status,
      payment_method: offering.payment_method,
      donor_info: donorInfo,
      campaign_id: offering.campaign?.id || null,
      created_at: offering.created_at,
      updated_at: offering.updated_at,
    };
  }

  private async mapCampaignToResponse(campaign: OfferingCampaign): Promise<OfferingCampaignResponseDto> {
    // Calculer les statistiques de la campagne
    const stats = await this.calculateCampaignStats(campaign.id);

    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      target_amount: campaign.target_amount,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      status: campaign.status,
      image_url: campaign.image_url,
      stats,
      created_by_user_id: campaign.created_by_user_id,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    };
  }

  private async calculateCampaignStats(campaignId: string) {
    const result = await this.offeringRepository
      .createQueryBuilder('offering')
      .select([
        'COUNT(*) as total_donors',
        'SUM(offering.amount) as total_raised',
        'AVG(offering.amount) as average_donation'
      ])
      .where('offering.campaign_id = :campaignId', { campaignId })
      .andWhere('offering.status = :status', { status: OfferingStatus.COMPLETED })
      .getRawOne();

    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId }
    });

    const totalRaised = parseFloat(result.total_raised) || 0;
    const totalDonors = parseInt(result.total_donors) || 0;
    const averageDonation = parseFloat(result.average_donation) || 0;

    let progressPercentage = 0;
    if (campaign?.target_amount && campaign.target_amount > 0) {
      progressPercentage = Math.min((totalRaised / campaign.target_amount) * 100, 100);
    }

    // Calculer les jours restants
    const today = new Date();
    const endDate = new Date(campaign?.end_date || today);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      total_raised: totalRaised,
      total_donors: totalDonors,
      average_donation: averageDonation,
      progress_percentage: Math.round(progressPercentage * 100) / 100,
      days_remaining: daysRemaining,
    };
  }

  private maskName(fullName: string): string {
    if (!fullName || fullName.length <= 2) return fullName;
    
    const parts = fullName.split(' ');
    return parts.map(part => {
      if (part.length <= 2) return part;
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    }).join(' ');
  }
}