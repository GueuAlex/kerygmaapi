import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProductionSchema1758580000000 implements MigrationInterface {
  name = 'FixProductionSchema1758580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // === OFFERING_TYPES ===
    // Vérifier si la colonne is_active existe avant de l'ajouter
    const offeringTypesColumns = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offering_types' 
      AND COLUMN_NAME = 'is_active'
    `);

    if (offeringTypesColumns.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offering_types\` 
        ADD \`is_active\` tinyint NOT NULL DEFAULT '1'
      `);
    }

    // Vérifier et ajouter updated_at si nécessaire
    const offeringTypesUpdatedAt = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'offering_types' 
      AND COLUMN_NAME = 'updated_at'
    `);

    if (offeringTypesUpdatedAt.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`offering_types\` 
        ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
      `);
    }

    // === CONTRIBUTION_CAMPAIGNS ===
    // Vérifier si is_fixed_amount existe
    const campaignsIsFixed = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'contribution_campaigns' 
      AND COLUMN_NAME = 'is_fixed_amount'
    `);

    if (campaignsIsFixed.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`contribution_campaigns\` 
        ADD \`is_fixed_amount\` tinyint NOT NULL DEFAULT '0'
      `);
    }

    // Vérifier si fixed_amount existe
    const campaignsFixedAmount = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'contribution_campaigns' 
      AND COLUMN_NAME = 'fixed_amount'
    `);

    if (campaignsFixedAmount.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`contribution_campaigns\` 
        ADD \`fixed_amount\` decimal(10,2) NULL
      `);
    }

    // === PAYMENT_GATEWAYS ===
    // Vérifier si type existe
    const gatewayType = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'type'
    `);

    if (gatewayType.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`type\` enum('mobile_money','card','bank_transfer') NOT NULL DEFAULT 'mobile_money'
      `);
    }

    // Vérifier si slug existe
    const gatewaySlug = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'slug'
    `);

    if (gatewaySlug.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`slug\` enum('OM','MTN','WAVE','MOOV','CARD','BANK') NULL
      `);
    }

    // Vérifier si logo existe
    const gatewayLogo = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'logo'
    `);

    if (gatewayLogo.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`logo\` varchar(255) NULL
      `);
    }

    // Vérifier si integration_config existe (au lieu de config)
    const gatewayIntegrationConfig = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'integration_config'
    `);

    const gatewayOldConfig = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'config'
    `);

    if (gatewayIntegrationConfig.length === 0 && gatewayOldConfig.length > 0) {
      // Renommer config vers integration_config
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        CHANGE \`config\` \`integration_config\` json NULL
      `);
    } else if (gatewayIntegrationConfig.length === 0) {
      // Créer integration_config si aucune des deux n'existe
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`integration_config\` json NULL
      `);
    }

    // Vérifier les autres colonnes manquantes dans payment_gateways
    const gatewayFeePct = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'transaction_fee_percentage'
    `);

    if (gatewayFeePct.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`transaction_fee_percentage\` decimal(5,2) NULL
      `);
    }

    const gatewayFeePayer = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'transaction_fee_payer'
    `);

    if (gatewayFeePayer.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`transaction_fee_payer\` enum('donor','parish','shared') NOT NULL DEFAULT 'donor'
      `);
    }

    const gatewayIsActive = await queryRunner.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payment_gateways' 
      AND COLUMN_NAME = 'is_active'
    `);

    if (gatewayIsActive.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`payment_gateways\` 
        ADD \`is_active\` tinyint NOT NULL DEFAULT '1'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes ajoutées (ordre inverse)
    
    // Payment gateways
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`is_active\``);
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`transaction_fee_payer\``);
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`transaction_fee_percentage\``);
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`logo\``);
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`slug\``);
    await queryRunner.query(`ALTER TABLE \`payment_gateways\` DROP COLUMN \`type\``);
    
    // Contribution campaigns
    await queryRunner.query(`ALTER TABLE \`contribution_campaigns\` DROP COLUMN \`fixed_amount\``);
    await queryRunner.query(`ALTER TABLE \`contribution_campaigns\` DROP COLUMN \`is_fixed_amount\``);
    
    // Offering types
    await queryRunner.query(`ALTER TABLE \`offering_types\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`offering_types\` DROP COLUMN \`is_active\``);
  }
}