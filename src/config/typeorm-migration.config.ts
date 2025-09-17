import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Charger les variables d'environnement selon l'environnement
const envPath =
  process.env.NODE_ENV === 'production'
    ? join(__dirname, '../../environments/prod/.env')
    : process.env.NODE_ENV === 'test'
      ? join(__dirname, '../../environments/test/.env')
      : join(__dirname, '../../environments/dev/.env');

config({ path: envPath });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'dev',
  password: process.env.DB_PASSWORD || 'devpass',
  database: process.env.DB_DATABASE || 'digifaz',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Important: false pour les migrations
  logging: process.env.TYPEORM_LOGGING === 'true',
});
