-- Insertion des utilisateurs de test
-- À exécuter dans phpMyAdmin pour la base digifaz_prod
-- IMPORTANT: Exécuter APRÈS le fichier seeders-roles.sql

-- Mot de passe pour tous les utilisateurs: P@ssword (hashé avec bcrypt)

INSERT IGNORE INTO users (id, email, password, fullName, phone, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@test.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Utilisateur Test', '+237690000000', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'admin@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Administrateur Systeme', '+237690000001', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'priest@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Pere Jean Baptiste', '+237690000002', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'manager@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Gestionnaire Paroisse', '+237690000003', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'treasurer@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Tresorier Paroisse', '+237690000004', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'secretary@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Secretaire Paroisse', '+237690000005', 'active'),
('550e8400-e29b-41d4-a716-446655440006', 'user@digifaz.com', '$2a$10$QvNu/F87g0YRgQT4yvAtKOCGlp41qju02eiP2fN5wT851ON1bZKDC', 'Fidele Paroisse', '+237690000006', 'active');

-- Attribution des rôles aux utilisateurs
INSERT IGNORE INTO user_has_roles (user_id, role_id) 
SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'test@test.com' AND user_roles.name = 'super_admin'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'admin@digifaz.com' AND user_roles.name = 'super_admin'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'priest@digifaz.com' AND user_roles.name = 'priest'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'manager@digifaz.com' AND user_roles.name = 'parish_manager'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'treasurer@digifaz.com' AND user_roles.name = 'treasurer'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'secretary@digifaz.com' AND user_roles.name = 'secretary'

UNION ALL

SELECT users.id, user_roles.id 
FROM users, user_roles 
WHERE users.email = 'user@digifaz.com' AND user_roles.name = 'volunteer';