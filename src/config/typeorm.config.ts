// src/config/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('database.synchronize'),
    logging: configService.get<boolean>('database.logging'),
    dropSchema: configService.get<boolean>('database.dropSchema'),
    autoLoadEntities: true,
    retryAttempts: configService.get<number>('database.retryAttempts'),
    retryDelay: configService.get<number>('database.retryDelay'),
    extra: {
      ...(configService.get('database.extra') || {}),
      connectTimeout: 60000,
    },
  };
};
