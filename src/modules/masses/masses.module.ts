import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelebrationType } from './entities/celebration-type.entity';
import { MassCalendar } from './entities/mass-calendar.entity';
import { MassesController } from './masses.controller';
import { MassesService } from './masses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CelebrationType, MassCalendar])],
  controllers: [MassesController],
  providers: [MassesService],
  exports: [MassesService],
})
export class MassesModule {}
