import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToOfferings1758630000000 implements MigrationInterface {
  name = 'AddTimestampsToOfferings1758630000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier et ajouter la colonne created_at
    const createdAtColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'created_at'
    `);

    if (createdAtColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
      `);
    }

    // Vérifier et ajouter la colonne updated_at
    const updatedAtColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'updated_at'
    `);

    if (updatedAtColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes de timestamps
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`created_at\``);
  }
}