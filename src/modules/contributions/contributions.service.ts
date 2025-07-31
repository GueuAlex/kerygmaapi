import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributionCampaign } from './entities/contribution-campaign.entity';
import { ContributionCard } from './entities/contribution-card.entity';
import { CardContribution } from './entities/card-contribution.entity';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionCampaign)
    private readonly campaignRepository: Repository<ContributionCampaign>,
    @InjectRepository(ContributionCard)
    private readonly cardRepository: Repository<ContributionCard>,
    @InjectRepository(CardContribution)
    private readonly cardContributionRepository: Repository<CardContribution>,
  ) {}

  // Méthodes CRUD à compléter
}
