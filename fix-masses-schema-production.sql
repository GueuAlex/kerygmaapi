-- Script de correction pour le module masses en production
-- Problèmes identifiés : created_by_user_id en INT au lieu de VARCHAR(36) pour UUID

USE digifaz_prod;

-- Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS mass_calendar_backup AS SELECT * FROM mass_calendar;

-- Modifier la colonne created_by_user_id pour accepter les UUID
ALTER TABLE mass_calendar 
MODIFY COLUMN created_by_user_id VARCHAR(36) NULL;

-- Si il y a des données avec des ID numériques, les nettoyer
UPDATE mass_calendar SET created_by_user_id = NULL WHERE created_by_user_id = 'NaN' OR created_by_user_id = '';

-- Vérification finale
DESCRIBE mass_calendar;

-- Afficher le résultat
SELECT 'Migration terminée: mass_calendar.created_by_user_id maintenant en VARCHAR(36) pour UUID' as status;