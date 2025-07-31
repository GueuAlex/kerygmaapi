import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offering } from './entities/offering.entity';
import { OfferingType } from './entities/offering-type.entity';

@Injectable()
export class OfferingsService {
  constructor(
    @InjectRepository(Offering)
    private readonly offeringRepository: Repository<Offering>,
    @InjectRepository(OfferingType)
    private readonly offeringTypeRepository: Repository<OfferingType>,
  ) {}

  // Méthodes CRUD à compléter
}
