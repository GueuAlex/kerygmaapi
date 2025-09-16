import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributionCampaign } from './entities/contribution-campaign.entity';
import { ContributionCard } from './entities/contribution-card.entity';
import { CardContribution } from './entities/card-contribution.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  QueryCampaignsDto,
  CampaignStatus,
} from './dto/contribution-campaign.dto';
import {
  CreateCardDto,
  UpdateCardDto,
  CardResponseDto,
  QueryCardsDto,
  CardStatus,
} from './dto/contribution-card.dto';
import {
  CreateContributionDto,
  ContributionResponseDto,
  ContributionMethod,
} from './dto/create-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionCampaign)
    private readonly campaignRepository: Repository<ContributionCampaign>,
    @InjectRepository(ContributionCard)
    private readonly cardRepository: Repository<ContributionCard>,
    @InjectRepository(CardContribution)
    private readonly cardContributionRepository: Repository<CardContribution>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ========================= CAMPAGNES =========================

  async createCampaign(
    createDto: CreateCampaignDto,
    createdByUserId: string,
  ): Promise<CampaignResponseDto> {
    // Verifier que l'utilisateur existe
    const createdByUser = await this.userRepository.findOne({
      where: { id: createdByUserId },
    });
    
    if (!createdByUser) {
      throw new NotFoundException('Utilisateur createur non trouve');
    }

    // Validation dates
    if (createDto.end_date && new Date(createDto.start_date) >= new Date(createDto.end_date)) {
      throw new BadRequestException('La date de fin doit etre posterieure a la date de debut');
    }

    // Validation montant fixe
    if (createDto.is_fixed_amount && !createDto.fixed_amount) {
      throw new BadRequestException('Le montant fixe est requis quand is_fixed_amount = true');
    }

    const campaign = this.campaignRepository.create({
      name: createDto.name,
      description: createDto.description,
      start_date: createDto.start_date,
      end_date: createDto.end_date,
      is_fixed_amount: createDto.is_fixed_amount || false,
      fixed_amount: createDto.fixed_amount || undefined,
      created_by_user: createdByUser,
      status: CampaignStatus.ACTIVE,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);
    return this.formatCampaignResponse(savedCampaign);
  }

  async findAllCampaigns(queryDto: QueryCampaignsDto = {}) {
    const {
      status,
      start_date_from,
      start_date_to,
      page = 1,
      limit = 10,
    } = queryDto;

    const query = this.campaignRepository.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.created_by_user', 'creator')
      .leftJoin('campaign.cards', 'cards')
      .leftJoin('cards.contributions', 'contributions')
      .addSelect('COUNT(DISTINCT cards.id)', 'total_cards')
      .addSelect('COALESCE(SUM(contributions.amount), 0)', 'total_collected')
      .groupBy('campaign.id')
      .addGroupBy('creator.id');

    // Filtres
    if (status) {
      query.andWhere('campaign.status = :status', { status });
    }

    if (start_date_from && start_date_to) {
      query.andWhere('campaign.start_date BETWEEN :start_date_from AND :start_date_to', {
        start_date_from,
        start_date_to,
      });
    } else if (start_date_from) {
      query.andWhere('campaign.start_date >= :start_date_from', { start_date_from });
    } else if (start_date_to) {
      query.andWhere('campaign.start_date <= :start_date_to', { start_date_to });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    // Execution
    const [campaigns, total] = await Promise.all([
      query.getRawAndEntities(),
      this.campaignRepository.count(),
    ]);

    const formattedCampaigns = campaigns.entities.map((campaign, index) => ({
      ...this.formatCampaignResponse(campaign),
      total_cards: parseInt(campaigns.raw[index].total_cards) || 0,
      total_collected: parseFloat(campaigns.raw[index].total_collected) || 0,
    }));

    return {
      data: formattedCampaigns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCampaignById(id: number): Promise<CampaignResponseDto> {
    const campaign = await this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.created_by_user', 'creator')
      .leftJoin('campaign.cards', 'cards')
      .leftJoin('cards.contributions', 'contributions')
      .addSelect('COUNT(DISTINCT cards.id)', 'total_cards')
      .addSelect('COALESCE(SUM(contributions.amount), 0)', 'total_collected')
      .where('campaign.id = :id', { id })
      .groupBy('campaign.id')
      .addGroupBy('creator.id')
      .getRawAndEntities();

    if (!campaign.entities.length) {
      throw new NotFoundException('Campagne non trouvee');
    }

    return {
      ...this.formatCampaignResponse(campaign.entities[0]),
      total_cards: parseInt(campaign.raw[0].total_cards) || 0,
      total_collected: parseFloat(campaign.raw[0].total_collected) || 0,
    };
  }

  async updateCampaign(
    id: number,
    updateDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['created_by_user'],
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvee');
    }

    // Validation dates si modifiees
    if (updateDto.end_date) {
      const startDate = new Date(campaign.start_date);
      const newEndDate = new Date(updateDto.end_date);
      
      if (startDate >= newEndDate) {
        throw new BadRequestException('La date de fin doit etre posterieure a la date de debut');
      }
    }

    await this.campaignRepository.update(id, updateDto);
    return this.findCampaignById(id);
  }

  async deleteCampaign(id: number): Promise<void> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['cards'],
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvee');
    }

    if (campaign.cards && campaign.cards.length > 0) {
      throw new ConflictException('Impossible de supprimer une campagne avec des cartes existantes');
    }

    await this.campaignRepository.delete(id);
  }

  // ========================= CARTES =========================

  async createCard(createDto: CreateCardDto): Promise<CardResponseDto> {
    // Verifier que la campagne existe
    const campaign = await this.campaignRepository.findOne({
      where: { id: createDto.campaign_id },
    });

    if (!campaign) {
      throw new NotFoundException('Campagne non trouvee');
    }

    // Verifier que la campagne est active
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('La campagne n\'est plus active');
    }

    // Verifier l'utilisateur si fourni
    let user: User | null = null;
    if (createDto.user_id) {
      user = await this.userRepository.findOne({
        where: { id: createDto.user_id },
      });
      
      if (!user) {
        throw new NotFoundException('Utilisateur non trouve');
      }
    }

    // Generer numero de carte unique
    const cardNumber = await this.generateUniqueCardNumber();

    const card = this.cardRepository.create({
      campaign,
      user: user || undefined,
      phone_number: createDto.phone_number,
      card_number: cardNumber,
      initial_amount: createDto.initial_amount || 0,
      current_balance: 0,
      is_physical: createDto.is_physical || false,
      status: CardStatus.ACTIVE,
    });

    const savedCard = await this.cardRepository.save(card);
    return this.findCardById(savedCard.id);
  }

  private async generateUniqueCardNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    let cardNumber: string;
    let exists = true;
    let counter = 1;

    do {
      cardNumber = `CARD-${currentYear}-${counter.toString().padStart(6, '0')}`;
      const existingCard = await this.cardRepository.findOne({
        where: { card_number: cardNumber },
      });
      exists = !!existingCard;
      counter++;
    } while (exists);

    return cardNumber;
  }

  private formatCampaignResponse(campaign: ContributionCampaign): CampaignResponseDto {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      is_fixed_amount: campaign.is_fixed_amount,
      fixed_amount: campaign.fixed_amount,
      status: campaign.status as CampaignStatus,
      total_cards: 0, // Sera rempli par la requête
      total_collected: 0, // Sera rempli par la requête
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
    };
  }

  async findCardById(id: number): Promise<CardResponseDto> {
    const card = await this.cardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.campaign', 'campaign')
      .leftJoinAndSelect('card.user', 'user')
      .leftJoin('card.contributions', 'contributions')
      .addSelect('COUNT(contributions.id)', 'contributions_count')
      .where('card.id = :id', { id })
      .groupBy('card.id')
      .addGroupBy('campaign.id')
      .addGroupBy('user.id')
      .getRawAndEntities();

    if (!card.entities.length) {
      throw new NotFoundException('Carte non trouvee');
    }

    const cardEntity = card.entities[0];
    const contributionsCount = parseInt(card.raw[0].contributions_count) || 0;

    return {
      id: cardEntity.id,
      card_number: cardEntity.card_number,
      campaign: {
        id: cardEntity.campaign.id,
        name: cardEntity.campaign.name,
        status: cardEntity.campaign.status,
      },
      user: cardEntity.user ? {
        id: cardEntity.user.id,
        email: cardEntity.user.email,
      } : null,
      phone_number: cardEntity.phone_number,
      initial_amount: cardEntity.initial_amount,
      current_balance: cardEntity.current_balance,
      qr_code_url: cardEntity.qr_code_url,
      is_physical: cardEntity.is_physical,
      status: cardEntity.status as CardStatus,
      contributions_count: contributionsCount,
      created_at: cardEntity.created_at,
      updated_at: cardEntity.updated_at,
    };
  }
}
