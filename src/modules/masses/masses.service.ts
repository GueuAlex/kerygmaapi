import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CelebrationType } from './entities/celebration-type.entity';
import { MassCalendar } from './entities/mass-calendar.entity';

@Injectable()
export class MassesService {
  constructor(
    @InjectRepository(CelebrationType)
    private readonly celebrationTypeRepository: Repository<CelebrationType>,
    @InjectRepository(MassCalendar)
    private readonly massCalendarRepository: Repository<MassCalendar>,
  ) {}

  // Méthodes CRUD à compléter
}
