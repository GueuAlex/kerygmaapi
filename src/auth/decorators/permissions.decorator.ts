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
  RequirePermissions(resource, 'write');

export const CanDelete = (resource: string) =>
  RequirePermissions(resource, 'delete');

export const CanManage = (resource: string) =>
  RequirePermissions(resource, 'read', 'write', 'delete');

/**
 * Permissions prédéfinies pour les ressources communes
 */
export const Permissions = {
  // Utilisateurs
  Users: {
    Read: () => CanRead('users'),
    Write: () => CanWrite('users'),
    Delete: () => CanDelete('users'),
    Manage: () => CanManage('users'),
  },
  // Paroisses
  Parishes: {
    Read: () => CanRead('parishes'),
    Write: () => CanWrite('parishes'),
    Delete: () => CanDelete('parishes'),
    Manage: () => CanManage('parishes'),
  },
  // Messes
  Masses: {
    Read: () => CanRead('masses'),
    Write: () => CanWrite('masses'),
    Delete: () => CanDelete('masses'),
    Manage: () => CanManage('masses'),
  },
  // Finances
  Finances: {
    Read: () => CanRead('finances'),
    Write: () => CanWrite('finances'),
    Delete: () => CanDelete('finances'),
    Manage: () => CanManage('finances'),
  },
  // Rapports
  Reports: {
    Read: () => CanRead('reports'),
    Write: () => CanWrite('reports'),
    Generate: () => RequirePermissions('reports', 'read', 'write'),
  },
  // Rôles
  Roles: {
    Read: () => CanRead('roles'),
    Write: () => CanWrite('roles'),
    Delete: () => CanDelete('roles'),
    Manage: () => CanManage('roles'),
  },
};
