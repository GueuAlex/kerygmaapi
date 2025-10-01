import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionCampaign } from './entities/contribution-campaign.entity';
import { ContributionCard } from './entities/contribution-card.entity';
import { CardContribution } from './entities/card-contribution.entity';
import { User } from '../users/entities/user.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContributionCampaign,
      ContributionCard,
      CardContribution,
      User,
    ]),
    RolesModule,
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
