import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { UserHasRole } from './entities/user-has-role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, UserHasRole, User])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {
  static forRoot() {
    return {
      module: RolesModule,
      global: true,
    };
  }
}
