-- Script de correction pour la table parishes en production
-- Problème : colonne id en INT au lieu de VARCHAR(36) pour les UUID

USE digifaz_prod;

-- Étape 1 : Sauvegarder les données existantes si il y en a
CREATE TABLE IF NOT EXISTS parishes_backup AS SELECT * FROM parishes;

-- Étape 2 : Supprimer les contraintes de clé étrangère qui référencent parishes.id
-- (Vérifier d'abord s'il y a des tables qui référencent parishes)

-- Étape 3 : Modifier la structure de la table parishes
ALTER TABLE parishes 
MODIFY COLUMN id VARCHAR(36) NOT NULL;

-- Étape 4 : Si il y a des données existantes avec des IDs numériques, les convertir
-- (Cette partie nécessiterait une conversion manuelle selon les données existantes)

-- Vérification finale
DESCRIBE parishes;

-- Afficher le résultat
SELECT 'Migration terminée: parishes.id maintenant en VARCHAR(36) pour UUID' as status;