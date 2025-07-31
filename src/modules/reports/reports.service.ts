import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportConfig } from './entities/report-config.entity';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportConfig)
    private readonly reportConfigRepository: Repository<ReportConfig>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  // Méthodes CRUD à compléter
}
