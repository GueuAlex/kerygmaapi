import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugAndLogoToPaymentGateways1758109446316
  implements MigrationInterface
{
  name = 'AddSlugAndLogoToPaymentGateways1758109446316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`config\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`slug\` enum ('OM', 'MTN', 'WAVE', 'MOOV', 'CARD', 'BANK') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`logo\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`integration_config\` json NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`transaction_fee_percentage\` decimal(5,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`transaction_fee_payer\` enum ('donor', 'parish', 'shared') NOT NULL DEFAULT 'donor'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`type\` enum ('mobile_money', 'card', 'bank_transfer') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`type\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`transaction_fee_payer\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`transaction_fee_percentage\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`integration_config\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`logo\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` DROP COLUMN \`slug\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_gateways\` ADD \`config\` json NULL`,
    );
  }
}
