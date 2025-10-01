-- =====================================================================
-- SCRIPT DE CORRECTION : PERMISSIONS ADMINISTRATEUR
-- =====================================================================
-- 
-- Ce script corrige les permissions des utilisateurs admin en dev et prod
-- Résout le problème des admins avec des permissions limitées
--
-- Exécution : dev ET production
-- Date : 2025-09-17
-- =====================================================================

-- =====================================================================
-- 1. VÉRIFICATION ET CRÉATION DES RÔLES NÉCESSAIRES
-- =====================================================================

-- S'assurer que le rôle super_admin existe
INSERT IGNORE INTO user_roles (name, description, permissions) 
VALUES (
  'super_admin', 
  'Administrateur système avec accès complet à toutes les ressources',
  '{"*": ["*"]}'
);

-- S'assurer que le rôle system_admin existe (backup)
INSERT IGNORE INTO user_roles (name, description, permissions) 
VALUES (
  'system_admin', 
  'Administrateur système - Accès total',
  '{
    "*": ["*"],
    "users": ["create", "read", "update", "delete"],
    "roles": ["create", "read", "update", "delete"],
    "parishes": ["create", "read", "update", "delete"],
    "masses": ["create", "read", "update", "delete"],
    "offerings": ["create", "read", "update", "delete"],
    "contributions": ["create", "read", "update", "delete"],
    "payments": ["create", "read", "update", "delete"],
    "reports": ["create", "read", "update", "delete"],
    "notifications": ["create", "read", "update", "delete"]
  }'
);

-- =====================================================================
-- 2. CORRECTION DES PERMISSIONS ADMIN EXISTANTS
-- =====================================================================

-- Récupérer l'ID du rôle super_admin
SET @super_admin_role_id = (SELECT id FROM user_roles WHERE name = 'super_admin' LIMIT 1);
SET @system_admin_role_id = (SELECT id FROM user_roles WHERE name = 'system_admin' LIMIT 1);

-- Utiliser super_admin ou system_admin selon disponibilité
SET @target_role_id = COALESCE(@super_admin_role_id, @system_admin_role_id);

-- Corriger tous les utilisateurs avec role='admin' dans la colonne users.role
UPDATE user_has_roles uhr
INNER JOIN users u ON uhr.user_id = u.id
SET uhr.role_id = @target_role_id
WHERE u.role IN ('admin', 'super_admin', 'system_admin');

-- Ajouter les admins qui n'ont pas encore de rôle granulaire
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT 
    u.id as user_id,
    @target_role_id as role_id
FROM users u
LEFT JOIN user_has_roles uhr ON u.id = uhr.user_id
WHERE u.role IN ('admin', 'super_admin', 'system_admin') 
AND uhr.user_id IS NULL;

-- =====================================================================
-- 3. CORRECTION SPÉCIFIQUE POUR LES ADMINS CONNUS
-- =====================================================================

-- Liste des emails d'admins connus (ajoutez d'autres si nécessaire)
SET @admin_emails = 'admin@kerygma.com,admin@digifaz.com,super@admin.com';

-- Corriger ces admins spécifiques
UPDATE user_has_roles uhr
INNER JOIN users u ON uhr.user_id = u.id
SET uhr.role_id = @target_role_id
WHERE FIND_IN_SET(u.email, @admin_emails) > 0;

-- Ajouter les rôles pour ces admins s'ils n'en ont pas
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT 
    u.id as user_id,
    @target_role_id as role_id
FROM users u
LEFT JOIN user_has_roles uhr ON u.id = uhr.user_id
WHERE FIND_IN_SET(u.email, @admin_emails) > 0
AND uhr.user_id IS NULL;

-- =====================================================================
-- 4. NETTOYAGE - SUPPRIMER LES RÔLES LIMITÉS POUR LES ADMINS
-- =====================================================================

-- Supprimer les assignations de rôles limités (basic_user, guest, etc.) pour les admins
DELETE uhr FROM user_has_roles uhr
INNER JOIN users u ON uhr.user_id = u.id
INNER JOIN user_roles r ON uhr.role_id = r.id
WHERE u.role IN ('admin', 'super_admin', 'system_admin')
AND r.name IN ('basic_user', 'guest', 'user', 'parishioner')
AND uhr.role_id != @target_role_id;

-- Supprimer aussi pour les admins connus par email
DELETE uhr FROM user_has_roles uhr
INNER JOIN users u ON uhr.user_id = u.id
INNER JOIN user_roles r ON uhr.role_id = r.id
WHERE FIND_IN_SET(u.email, @admin_emails) > 0
AND r.name IN ('basic_user', 'guest', 'user', 'parishioner')
AND uhr.role_id != @target_role_id;

-- =====================================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================================

-- Afficher le statut final des administrateurs
SELECT 
    'VERIFICATION FINALE - ADMINS' as status,
    u.email,
    u.role as old_role_column,
    r.name as assigned_granular_role,
    r.permissions as permissions_json,
    CASE 
        WHEN r.permissions LIKE '%"*": ["*"]%' THEN 'ADMIN_OK' 
        ELSE 'NEEDS_REVIEW' 
    END as permission_status
FROM users u
LEFT JOIN user_has_roles uhr ON u.id = uhr.user_id
LEFT JOIN user_roles r ON uhr.role_id = r.id
WHERE u.role IN ('admin', 'super_admin', 'system_admin')
   OR FIND_IN_SET(u.email, @admin_emails) > 0
ORDER BY u.email;

-- Compter les admins correctement configurés
SELECT 
    COUNT(*) as total_admins,
    SUM(CASE WHEN r.permissions LIKE '%"*": ["*"]%' THEN 1 ELSE 0 END) as admins_with_full_permissions,
    SUM(CASE WHEN r.permissions NOT LIKE '%"*": ["*"]%' OR r.permissions IS NULL THEN 1 ELSE 0 END) as admins_needing_review
FROM users u
LEFT JOIN user_has_roles uhr ON u.id = uhr.user_id
LEFT JOIN user_roles r ON uhr.role_id = r.id
WHERE u.role IN ('admin', 'super_admin', 'system_admin')
   OR FIND_IN_SET(u.email, @admin_emails) > 0;

-- =====================================================================
-- 6. RAPPORT DE MIGRATION
-- =====================================================================

SELECT '=== RAPPORT DE MIGRATION - PERMISSIONS ADMIN ===' as rapport;
SELECT CONCAT('Rôle cible utilisé: ', 
    (SELECT name FROM user_roles WHERE id = @target_role_id)
) as role_info;

SELECT 'Migration terminée. Vérifiez les résultats ci-dessus.' as conclusion;

-- =====================================================================
-- FIN DU SCRIPT
-- =====================================================================