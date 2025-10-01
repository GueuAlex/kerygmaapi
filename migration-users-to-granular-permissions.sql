-- =====================================================================
-- SCRIPT DE MIGRATION : ROLES CLASSIQUES → PERMISSIONS GRANULAIRES
-- =====================================================================
-- 
-- Ce script migre tous les utilisateurs existants du système de rôles
-- classiques vers le nouveau système de permissions granulaires
--
-- Exécution recommandée : En phase de développement uniquement
-- =====================================================================

-- 1. Créer les rôles de migration qui correspondent aux anciens rôles
-- (S'ils n'existent pas déjà)

-- Rôle pour les anciens 'admin'
INSERT IGNORE INTO user_roles (name, description, permissions) VALUES 
('legacy_admin', 'Migration automatique - Ancien rôle admin', 
'{"*": ["*"]}');

-- Rôle pour les anciens 'priest'
INSERT IGNORE INTO user_roles (name, description, permissions) VALUES 
('legacy_priest', 'Migration automatique - Ancien rôle priest', 
'{
  "users": ["read", "write"], 
  "parishes": ["read", "write"], 
  "masses": ["read", "write", "delete"], 
  "roles": ["read"],
  "reports": ["read", "write"],
  "offerings": ["read", "write"]
}');

-- Rôle pour les anciens 'parish_admin'
INSERT IGNORE INTO user_roles (name, description, permissions) VALUES 
('legacy_parish_admin', 'Migration automatique - Ancien rôle parish_admin', 
'{
  "parishes": ["read", "write"], 
  "users": ["read"], 
  "masses": ["read", "write"], 
  "reports": ["read"],
  "offerings": ["read", "write"]
}');

-- Rôle pour les anciens 'user'
INSERT IGNORE INTO user_roles (name, description, permissions) VALUES 
('legacy_user', 'Migration automatique - Ancien rôle user', 
'{
  "masses": ["read"], 
  "profile": ["read", "write"], 
  "offerings": ["write"]
}');

-- 2. Migrer tous les utilisateurs existants vers le nouveau système
-- (Éviter les doublons avec INSERT IGNORE)

-- Migration des utilisateurs 'admin'
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT u.id, ur.id 
FROM users u 
JOIN user_roles ur ON ur.name = 'legacy_admin'
WHERE u.role = 'admin'
  AND u.id NOT IN (SELECT user_id FROM user_has_roles);

-- Migration des utilisateurs 'priest'  
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT u.id, ur.id 
FROM users u 
JOIN user_roles ur ON ur.name = 'legacy_priest'
WHERE u.role = 'priest'
  AND u.id NOT IN (SELECT user_id FROM user_has_roles);

-- Migration des utilisateurs 'parish_admin'
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT u.id, ur.id 
FROM users u 
JOIN user_roles ur ON ur.name = 'legacy_parish_admin'
WHERE u.role = 'parish_admin'
  AND u.id NOT IN (SELECT user_id FROM user_has_roles);

-- Migration des utilisateurs 'user'
INSERT IGNORE INTO user_has_roles (user_id, role_id)
SELECT u.id, ur.id 
FROM users u 
JOIN user_roles ur ON ur.name = 'legacy_user'
WHERE u.role = 'user'
  AND u.id NOT IN (SELECT user_id FROM user_has_roles);

-- 3. Vérifier les résultats de la migration
SELECT 
    'RÉSULTATS DE MIGRATION' as info;

-- Compter les utilisateurs par ancien rôle
SELECT 
    'Utilisateurs par ancien rôle:' as section,
    role,
    COUNT(*) as total
FROM users 
GROUP BY role;

-- Compter les utilisateurs avec permissions granulaires
SELECT 
    'Utilisateurs avec permissions granulaires:' as section,
    ur.name as nouveau_role,
    COUNT(*) as total
FROM user_has_roles uhr
JOIN user_roles ur ON uhr.role_id = ur.id
GROUP BY ur.name;

-- Utilisateurs non migrés (s'il y en a)
SELECT 
    'Utilisateurs NON MIGRÉS (à vérifier):' as section,
    u.id,
    u.email,
    u.fullName,
    u.role as ancien_role
FROM users u
LEFT JOIN user_has_roles uhr ON u.id = uhr.user_id
WHERE uhr.user_id IS NULL;

-- 4. Message de confirmation
SELECT 
    '✅ MIGRATION TERMINÉE' as status,
    'Tous les utilisateurs ont maintenant des permissions granulaires' as message,
    'Vous pouvez maintenant tester les accès dans l''application' as next_step;