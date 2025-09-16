import { Module } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferingType } from './entities/offering-type.entity';
import { Offering } from './entities/offering.entity';
import { OfferingCampaign } from './entities/offering-campaign.entity';
import { OfferingsController } from './offerings.controller';
import { RolesModule } from '../roles/roles.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferingType, Offering, OfferingCampaign, User]),
    RolesModule,
  ],
  controllers: [OfferingsController],
  providers: [OfferingsService],
  exports: [OfferingsService],
})
export class OfferingsModule {}
