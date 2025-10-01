import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeContributionCardIdToUuid1759232367509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Créer une nouvelle table temporaire avec UUID
        await queryRunner.query(`
            CREATE TABLE contribution_cards_temp (
                id VARCHAR(36) NOT NULL,
                campaign_id INT NOT NULL,
                card_number VARCHAR(50) NOT NULL UNIQUE,
                user_id VARCHAR(36) NULL,
                phone_number VARCHAR(20) NULL,
                initial_amount DECIMAL(10,2) DEFAULT 0,
                current_balance DECIMAL(10,2) DEFAULT 0,
                qr_code_url VARCHAR(255) NULL,
                is_physical BOOLEAN DEFAULT FALSE,
                status ENUM('active', 'inactive', 'completed', 'suspended') DEFAULT 'active',
                created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                INDEX idx_card_number (card_number),
                INDEX idx_card_phone (phone_number),
                INDEX idx_card_campaign (campaign_id),
                FOREIGN KEY (campaign_id) REFERENCES contribution_campaigns(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        // Sauvegarder les données existantes avec de nouveaux UUIDs
        await queryRunner.query(`
            INSERT INTO contribution_cards_temp (
                id, campaign_id, card_number, user_id, phone_number, 
                initial_amount, current_balance, qr_code_url, is_physical, 
                status, created_at, updated_at
            )
            SELECT 
                UUID() as id, campaign_id, card_number, user_id, phone_number,
                initial_amount, current_balance, qr_code_url, is_physical,
                status, created_at, updated_at
            FROM contribution_cards
        `);
        
        // Mettre à jour les références dans card_contributions avec les nouveaux UUIDs
        await queryRunner.query(`
            UPDATE card_contributions cc
            JOIN contribution_cards old_card ON cc.card_id = old_card.id
            JOIN contribution_cards_temp new_card ON old_card.card_number = new_card.card_number
            SET cc.card_id = new_card.id
        `);
        
        // Supprimer l'ancienne table
        await queryRunner.query(`DROP TABLE contribution_cards`);
        
        // Renommer la nouvelle table
        await queryRunner.query(`RENAME TABLE contribution_cards_temp TO contribution_cards`);
        
        // Modifier la table card_contributions pour accepter UUID
        await queryRunner.query(`
            ALTER TABLE card_contributions 
            MODIFY COLUMN card_id VARCHAR(36) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Migration inverse - revenir aux IDs entiers
        await queryRunner.query(`
            CREATE TABLE contribution_cards_temp (
                id INT AUTO_INCREMENT,
                campaign_id INT NOT NULL,
                card_number VARCHAR(50) NOT NULL UNIQUE,
                user_id VARCHAR(36) NULL,
                phone_number VARCHAR(20) NULL,
                initial_amount DECIMAL(10,2) DEFAULT 0,
                current_balance DECIMAL(10,2) DEFAULT 0,
                qr_code_url VARCHAR(255) NULL,
                is_physical BOOLEAN DEFAULT FALSE,
                status ENUM('active', 'inactive', 'completed', 'suspended') DEFAULT 'active',
                created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id),
                INDEX idx_card_number (card_number),
                INDEX idx_card_phone (phone_number),
                INDEX idx_card_campaign (campaign_id),
                FOREIGN KEY (campaign_id) REFERENCES contribution_campaigns(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        await queryRunner.query(`
            INSERT INTO contribution_cards_temp (
                campaign_id, card_number, user_id, phone_number,
                initial_amount, current_balance, qr_code_url, is_physical,
                status, created_at, updated_at
            )
            SELECT 
                campaign_id, card_number, user_id, phone_number,
                initial_amount, current_balance, qr_code_url, is_physical,
                status, created_at, updated_at
            FROM contribution_cards
        `);
        
        await queryRunner.query(`DROP TABLE contribution_cards`);
        await queryRunner.query(`RENAME TABLE contribution_cards_temp TO contribution_cards`);
        
        await queryRunner.query(`
            ALTER TABLE card_contributions 
            MODIFY COLUMN card_id INT NOT NULL
        `);
    }

}
