import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteOfferingsTable1758620000000 implements MigrationInterface {
  name = 'CompleteOfferingsTable1758620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier et ajouter la colonne payment_method
    const paymentMethodColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'payment_method'
    `);

    if (paymentMethodColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`payment_method\` enum('cash','bank_transfer','mobile_money','card') NOT NULL DEFAULT 'cash'
      `);
    }

    // Vérifier et ajouter la colonne anonymous_donor_info
    const anonymousDonorColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'anonymous_donor_info'
    `);

    if (anonymousDonorColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`anonymous_donor_info\` json NULL
      `);
    }

    // Vérifier et ajouter la colonne campaign_id
    const campaignIdColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'campaign_id'
    `);

    if (campaignIdColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`campaign_id\` varchar(255) NULL
      `);
    }

    // Vérifier et ajouter la colonne user_id si elle n'existe pas
    const userIdColumn = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offerings' 
      AND COLUMN_NAME = 'user_id'
    `);

    if (userIdColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offerings\` 
        ADD \`user_id\` varchar(255) NULL
      `);
    }

    // Créer la table offering_campaigns si elle n'existe pas
    const offeringCampaignsTable = await queryRunner.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offering_campaigns'
    `);

    if (offeringCampaignsTable.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`offering_campaigns\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`description\` text NOT NULL,
          \`target_amount\` decimal(12,2) NULL,
          \`start_date\` date NOT NULL,
          \`end_date\` date NOT NULL,
          \`status\` enum('draft','active','completed','cancelled') NOT NULL DEFAULT 'draft',
          \`image_url\` varchar(255) NULL,
          \`settings\` json NULL,
          \`created_by_user_id\` varchar(255) NULL DEFAULT NULL,
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la table offering_campaigns
    await queryRunner.query(`DROP TABLE IF EXISTS \`offering_campaigns\``);
    
    // Supprimer les colonnes ajoutées dans offerings
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`user_id\``);
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`campaign_id\``);
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`anonymous_donor_info\``);
    await queryRunner.query(`ALTER TABLE \`offerings\` DROP COLUMN IF EXISTS \`payment_method\``);
  }
}