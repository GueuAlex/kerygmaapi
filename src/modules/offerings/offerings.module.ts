import { Module } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferingType } from './entities/offering-type.entity';
import { Offering } from './entities/offering.entity';
import { OfferingsController } from './offerings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OfferingType, Offering])],
  controllers: [OfferingsController],
  providers: [OfferingsService],
  exports: [OfferingsService],
})
export class OfferingsModule {}
