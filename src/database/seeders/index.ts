import { DataSource } from 'typeorm';
import { UserRolesSeeder } from './user-roles.seeder';
import { UsersSeeder } from './users.seeder';

export class DatabaseSeeder {
  public static async run(dataSource: DataSource): Promise<void> {
    console.log('Demarrage des seeders...');

    try {
      console.log('1. Creation des roles utilisateur...');
      await UserRolesSeeder.run(dataSource);

      console.log('2. Creation des utilisateurs...');
      await UsersSeeder.run(dataSource);

      console.log('Seeders executes avec succes !');
    } catch (error) {
      console.error('Erreur lors de l\'execution des seeders:', error);
      throw error;
    }
  }
}