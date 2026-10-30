/**
 * lib/permissions.ts
 * Formal role-based access control (RBAC) for BookingPro.
 * Roles: OWNER, ADMIN, EMPLOYEE
 */

export type UserRole = 'OWNER' | 'ADMIN' | 'EMPLOYEE'

export type PermissionAction =
  | 'business:settings'
  | 'employees:manage'
  | 'services:manage'
  | 'clients:manage'
  | 'appointments:manage'
  | 'billing:manage'
  | 'business:delete'

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  OWNER: [
    'business:settings',
    'employees:manage',
    'services:manage',
    'clients:manage',
    'appointments:manage',
    'billing:manage',
    'business:delete',
  ],
  ADMIN: [
    'business:settings',
    'employees:manage',
    'services:manage',
    'clients:manage',
    'appointments:manage',
  ],
  EMPLOYEE: [
    'clients:manage',
    'appointments:manage',
  ],
}

/** Check if a given role has a specific permission */
export function hasPermission(role: UserRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false
  const permissions = ROLE_PERMISSIONS[role] ?? []
  return permissions.includes(action)
}

/** Helper to verify if role is management (Owner or Admin) */
export function isManagement(role: UserRole | null | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

/** Helper to verify if role is Owner */
export function isOwner(role: UserRole | null | undefined): boolean {
  return role === 'OWNER'
}
