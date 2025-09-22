import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToOfferings1758610000000 implements MigrationInterface {
  name = 'AddStatusToOfferings1758610000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne status existe avant de l'ajouter
    const statusColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'status'
    `);

    if (statusColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`status\` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending'
      `);
    }

    // Vérifier et ajouter d'autres colonnes potentiellement manquantes
    const paymentIdColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'payment_id'
    `);

    if (paymentIdColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`payment_id\` int NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN \`payment_id\``);
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN \`status\``);
  }
}