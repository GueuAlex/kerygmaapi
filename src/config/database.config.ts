// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'dev',
  password: process.env.DB_PASSWORD || 'devpass',
  database: process.env.DB_DATABASE || 'digifaz',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
  dropSchema: process.env.TYPEORM_DROP_SCHEMA === 'true',
  autoLoadEntities: true,
  retryAttempts: 10,
  retryDelay: 3000,
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
}));
