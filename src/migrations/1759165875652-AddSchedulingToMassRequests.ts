import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingToMassRequests1759165875652 implements MigrationInterface {
    name = 'AddSchedulingToMassRequests1759165875652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mass_requests\` ADD \`scheduled_date\` date NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mass_requests\` ADD \`mass_calendar_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`mass_requests\` ADD CONSTRAINT \`FK_13f406976bfe757569f77b937e1\` FOREIGN KEY (\`mass_calendar_id\`) REFERENCES \`mass_calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mass_requests\` DROP FOREIGN KEY \`FK_13f406976bfe757569f77b937e1\``);
        await queryRunner.query(`ALTER TABLE \`mass_requests\` DROP COLUMN \`mass_calendar_id\``);
        await queryRunner.query(`ALTER TABLE \`mass_requests\` DROP COLUMN \`scheduled_date\``);
    }

}
