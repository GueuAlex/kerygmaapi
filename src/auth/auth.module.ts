import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationService } from './services/notification.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { User } from '../modules/users/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RolesModule } from '../modules/roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordReset]),
    PassportModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'digifaz-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, NotificationService, PermissionsGuard],
  exports: [AuthService, PermissionsGuard],
})
export class AuthModule {}
