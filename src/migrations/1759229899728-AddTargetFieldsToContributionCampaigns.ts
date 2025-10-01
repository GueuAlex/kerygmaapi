import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTargetFieldsToContributionCampaigns1759229899728 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE contribution_campaigns 
            ADD COLUMN target_group ENUM('all', 'adults', 'youth', 'families', 'specific') DEFAULT 'all' AFTER fixed_amount,
            ADD COLUMN target_participant_count INT NULL AFTER target_group,
            ADD COLUMN target_amount DECIMAL(12,2) NULL AFTER target_participant_count,
            ADD COLUMN minimum_individual_amount DECIMAL(10,2) NULL AFTER target_amount
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE contribution_campaigns 
            DROP COLUMN minimum_individual_amount,
            DROP COLUMN target_amount,
            DROP COLUMN target_participant_count,
            DROP COLUMN target_group
        `);
    }

}
