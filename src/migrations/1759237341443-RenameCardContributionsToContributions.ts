import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCardContributionsToContributions1759237341443 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la table card_contributions existe
        const hasCardContributionsTable = await queryRunner.hasTable('card_contributions');
        const hasContributionsTable = await queryRunner.hasTable('contributions');
        
        if (hasCardContributionsTable && hasContributionsTable) {
            // Les deux tables existent, migrer les données puis supprimer l'ancienne
            console.log('Migration des données de card_contributions vers contributions...');
            
            // Migrer les données si elles ne sont pas déjà présentes
            await queryRunner.query(`
                INSERT IGNORE INTO contributions 
                (id, amount, contribution_method, contribution_date, notes, created_at, 
                 card_id, contributor_user_id, payment_id, collected_by_user_id)
                SELECT id, amount, contribution_method, contribution_date, notes, created_at,
                       card_id, contributor_user_id, payment_id, collected_by_user_id
                FROM card_contributions
            `);
            
            // Supprimer l'ancienne table
            await queryRunner.dropTable('card_contributions');
            console.log('Table card_contributions supprimée après migration');
            
        } else if (hasCardContributionsTable && !hasContributionsTable) {
            // Renommer la table card_contributions en contributions
            await queryRunner.query('RENAME TABLE card_contributions TO contributions');
            console.log('Table card_contributions renommée en contributions');
        } else if (hasContributionsTable) {
            console.log('Table contributions existe déjà, rien à faire');
        } else {
            console.log('Aucune table de contributions trouvée');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Vérifier si la table contributions existe
        const hasContributionsTable = await queryRunner.hasTable('contributions');
        const hasCardContributionsTable = await queryRunner.hasTable('card_contributions');
        
        if (hasContributionsTable && !hasCardContributionsTable) {
            // Renommer la table contributions en card_contributions
            await queryRunner.query('RENAME TABLE contributions TO card_contributions');
            console.log('Table contributions renommée en card_contributions');
        } else if (hasCardContributionsTable) {
            console.log('Table card_contributions existe déjà');
        } else {
            console.log('Table contributions n\'existe pas');
        }
    }

}
