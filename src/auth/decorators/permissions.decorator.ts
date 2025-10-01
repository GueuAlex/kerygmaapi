import { SetMetadata } from '@nestjs/common';

export interface Permission {
  resource: string;
  actions: string[];
}

export const PERMISSIONS_KEY = 'permissions';

/**
 * Décorateur pour définir les permissions requises pour un endpoint
 * @param resource - La ressource (ex: 'users', 'parishes', 'masses')
 * @param actions - Les actions requises (ex: ['read'], ['read', 'write'])
 */
export const RequirePermissions = (resource: string, ...actions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { resource, actions });

/**
 * Décorateurs prédéfinis pour les actions courantes
 */
export const CanRead = (resource: string) =>
  RequirePermissions(resource, 'read');

export const CanWrite = (resource: string) =>
  RequirePermissions(resource, 'create', 'update');

export const CanCreate = (resource: string) =>
  RequirePermissions(resource, 'create');

export const CanUpdate = (resource: string) =>
  RequirePermissions(resource, 'update');

export const CanDelete = (resource: string) =>
  RequirePermissions(resource, 'delete');

export const CanManage = (resource: string) =>
  RequirePermissions(resource, 'read', 'create', 'update', 'delete');

/**
 * Permissions prédéfinies pour les ressources communes
 */
export const Permissions = {
  // Utilisateurs
  Users: {
    Read: () => CanRead('users'),
    Create: () => CanCreate('users'),
    Update: () => CanUpdate('users'),
    Write: () => CanWrite('users'),
    Delete: () => CanDelete('users'),
    Manage: () => CanManage('users'),
  },
  // Paroisses
  Parishes: {
    Read: () => CanRead('parishes'),
    Create: () => CanCreate('parishes'),
    Update: () => CanUpdate('parishes'),
    Write: () => CanWrite('parishes'),
    Delete: () => CanDelete('parishes'),
    Manage: () => CanManage('parishes'),
  },
  // Messes
  Masses: {
    Read: () => CanRead('masses'),
    Create: () => CanCreate('masses'),
    Update: () => CanUpdate('masses'),
    Write: () => CanWrite('masses'),
    Delete: () => CanDelete('masses'),
    Manage: () => CanManage('masses'),
  },
  // Offrandes
  Offerings: {
    Read: () => CanRead('offerings'),
    Create: () => CanCreate('offerings'),
    Update: () => CanUpdate('offerings'),
    Write: () => CanWrite('offerings'),
    Delete: () => CanDelete('offerings'),
    Manage: () => CanManage('offerings'),
  },
  // Contributions
  Contributions: {
    Read: () => CanRead('contributions'),
    Create: () => CanCreate('contributions'),
    Update: () => CanUpdate('contributions'),
    Write: () => CanWrite('contributions'),
    Delete: () => CanDelete('contributions'),
    Manage: () => CanManage('contributions'),
  },
  // Paiements
  Payments: {
    Read: () => CanRead('payments'),
    Create: () => CanCreate('payments'),
    Update: () => CanUpdate('payments'),
    Write: () => CanWrite('payments'),
    Delete: () => CanDelete('payments'),
    Manage: () => CanManage('payments'),
  },
  // Rapports
  Reports: {
    Read: () => CanRead('reports'),
    Create: () => CanCreate('reports'),
    Update: () => CanUpdate('reports'),
    Write: () => CanWrite('reports'),
    Delete: () => CanDelete('reports'),
    Generate: () => RequirePermissions('reports', 'create', 'read'),
    Manage: () => CanManage('reports'),
  },
  // Notifications
  Notifications: {
    Read: () => CanRead('notifications'),
    Create: () => CanCreate('notifications'),
    Update: () => CanUpdate('notifications'),
    Write: () => CanWrite('notifications'),
    Delete: () => CanDelete('notifications'),
    Manage: () => CanManage('notifications'),
  },
  // Rôles
  Roles: {
    Read: () => CanRead('roles'),
    Create: () => CanCreate('roles'),
    Update: () => CanUpdate('roles'),
    Write: () => CanWrite('roles'),
    Delete: () => CanDelete('roles'),
    Manage: () => CanManage('roles'),
  },
  // Système
  System: {
    ManageSettings: () => RequirePermissions('system', 'manage_settings'),
    ViewLogs: () => RequirePermissions('system', 'view_logs'),
    BackupRestore: () => RequirePermissions('system', 'backup_restore'),
    Manage: () => RequirePermissions('system', 'manage_settings', 'view_logs', 'backup_restore'),
  },
};
