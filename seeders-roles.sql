-- Insertion des rôles utilisateur
-- À exécuter dans phpMyAdmin pour la base digifaz_prod

INSERT IGNORE INTO user_roles (name, description, permissions) VALUES 
('super_admin', 'Administrateur systeme avec tous les privileges', JSON_OBJECT(
    'users', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'parishes', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'masses', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'offerings', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'contributions', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'payments', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'roles', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'reports', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'notifications', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'system', JSON_ARRAY('manage_settings', 'view_logs', 'backup_restore')
)),

('parish_manager', 'Gestionnaire de paroisse avec privileges etendus', JSON_OBJECT(
    'users', JSON_ARRAY('read', 'update'),
    'parishes', JSON_ARRAY('read', 'update'),
    'masses', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'offerings', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'contributions', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'payments', JSON_ARRAY('read', 'update'),
    'reports', JSON_ARRAY('create', 'read'),
    'notifications', JSON_ARRAY('create', 'read', 'update')
)),

('priest', 'Pretre avec acces aux fonctions liturgiques et pastorales', JSON_OBJECT(
    'users', JSON_ARRAY('read'),
    'parishes', JSON_ARRAY('read'),
    'masses', JSON_ARRAY('create', 'read', 'update'),
    'offerings', JSON_ARRAY('read'),
    'contributions', JSON_ARRAY('read'),
    'payments', JSON_ARRAY('read'),
    'reports', JSON_ARRAY('read')
)),

('treasurer', 'Tresorier avec acces aux fonctions financieres', JSON_OBJECT(
    'users', JSON_ARRAY('read'),
    'parishes', JSON_ARRAY('read'),
    'masses', JSON_ARRAY('read'),
    'offerings', JSON_ARRAY('create', 'read', 'update'),
    'contributions', JSON_ARRAY('create', 'read', 'update'),
    'payments', JSON_ARRAY('create', 'read', 'update'),
    'reports', JSON_ARRAY('create', 'read')
)),

('secretary', 'Secretaire avec acces aux fonctions administratives', JSON_OBJECT(
    'users', JSON_ARRAY('create', 'read', 'update'),
    'parishes', JSON_ARRAY('read', 'update'),
    'masses', JSON_ARRAY('create', 'read', 'update'),
    'offerings', JSON_ARRAY('read'),
    'contributions', JSON_ARRAY('read'),
    'payments', JSON_ARRAY('read'),
    'reports', JSON_ARRAY('read'),
    'notifications', JSON_ARRAY('create', 'read', 'update')
)),

('volunteer', 'Benevole avec acces limite aux fonctions de base', JSON_OBJECT(
    'users', JSON_ARRAY('read'),
    'parishes', JSON_ARRAY('read'),
    'masses', JSON_ARRAY('read'),
    'offerings', JSON_ARRAY('read'),
    'contributions', JSON_ARRAY('read')
)),

('parishioner', 'Paroissien/utilisateur normal avec acces aux services principaux', JSON_OBJECT(
    'users', JSON_ARRAY('read'),
    'parishes', JSON_ARRAY('read'),
    'masses', JSON_ARRAY('create', 'read'),
    'offerings', JSON_ARRAY('create', 'read'),
    'contributions', JSON_ARRAY('create', 'read'),
    'payments', JSON_ARRAY('create', 'read')
));