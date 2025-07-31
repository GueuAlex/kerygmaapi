import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parish } from './entities/parish.entity';

@Injectable()
export class ParishesService {
  constructor(
    @InjectRepository(Parish)
    private readonly parishRepository: Repository<Parish>,
  ) {}

  // Méthodes CRUD à compléter
}
