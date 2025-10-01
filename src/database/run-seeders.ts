import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { DatabaseSeeder } from './seeders';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'digifaz',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function runSeeders() {
  console.log('Connexion a la base de donnees...');
  await dataSource.initialize();

  try {
    await DatabaseSeeder.run(dataSource);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Connexion fermee.');
  }
}

runSeeders().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});