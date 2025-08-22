import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MassRequestType } from './entities/mass-request-type.entity';
import { MassRequestPackage } from './entities/mass-request-package.entity';
import { MassRequest } from './entities/mass-request.entity';
import { MassRequestDetail } from './entities/mass-request-detail.entity';
import { MassRequestSchedule } from './entities/mass-request-schedule.entity';
import { User } from '../users/entities/user.entity';
import { MassRequestsController } from './mass-requests.controller';
import { MassRequestsService } from './mass-requests.service';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MassRequestType,
      MassRequestPackage,
      MassRequest,
      MassRequestDetail,
      MassRequestSchedule,
      User,
    ]),
    RolesModule,
  ],
  controllers: [MassRequestsController],
  providers: [MassRequestsService],
  exports: [MassRequestsService],
})
export class MassRequestsModule {}
