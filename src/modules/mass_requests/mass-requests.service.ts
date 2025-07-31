import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MassRequestType } from './entities/mass-request-type.entity';
import { MassRequestPackage } from './entities/mass-request-package.entity';
import { MassRequest } from './entities/mass-request.entity';
import { MassRequestDetail } from './entities/mass-request-detail.entity';
import { MassRequestSchedule } from './entities/mass-request-schedule.entity';

@Injectable()
export class MassRequestsService {
  constructor(
    @InjectRepository(MassRequestType)
    private readonly massRequestTypeRepository: Repository<MassRequestType>,
    @InjectRepository(MassRequestPackage)
    private readonly massRequestPackageRepository: Repository<MassRequestPackage>,
    @InjectRepository(MassRequest)
    private readonly massRequestRepository: Repository<MassRequest>,
    @InjectRepository(MassRequestDetail)
    private readonly massRequestDetailRepository: Repository<MassRequestDetail>,
    @InjectRepository(MassRequestSchedule)
    private readonly massRequestScheduleRepository: Repository<MassRequestSchedule>,
  ) {}

  // Méthodes CRUD à compléter
}
