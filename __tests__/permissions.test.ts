import { describe, it, expect } from 'vitest'
import { hasPermission, isManagement, isOwner } from '@/lib/permissions'

describe('RBAC Permissions Matrix', () => {
  it('OWNER should have all permissions including billing and delete', () => {
    expect(hasPermission('OWNER', 'business:settings')).toBe(true)
    expect(hasPermission('OWNER', 'employees:manage')).toBe(true)
    expect(hasPermission('OWNER', 'services:manage')).toBe(true)
    expect(hasPermission('OWNER', 'clients:manage')).toBe(true)
    expect(hasPermission('OWNER', 'appointments:manage')).toBe(true)
    expect(hasPermission('OWNER', 'billing:manage')).toBe(true)
    expect(hasPermission('OWNER', 'business:delete')).toBe(true)
    expect(isOwner('OWNER')).toBe(true)
    expect(isManagement('OWNER')).toBe(true)
  })

  it('ADMIN should have management permissions but NO billing or delete', () => {
    expect(hasPermission('ADMIN', 'business:settings')).toBe(true)
    expect(hasPermission('ADMIN', 'employees:manage')).toBe(true)
    expect(hasPermission('ADMIN', 'services:manage')).toBe(true)
    expect(hasPermission('ADMIN', 'clients:manage')).toBe(true)
    expect(hasPermission('ADMIN', 'appointments:manage')).toBe(true)
    expect(hasPermission('ADMIN', 'billing:manage')).toBe(false)
    expect(hasPermission('ADMIN', 'business:delete')).toBe(false)
    expect(isOwner('ADMIN')).toBe(false)
    expect(isManagement('ADMIN')).toBe(true)
  })

  it('EMPLOYEE should only have operational permissions (clients & appointments)', () => {
    expect(hasPermission('EMPLOYEE', 'business:settings')).toBe(false)
    expect(hasPermission('EMPLOYEE', 'employees:manage')).toBe(false)
    expect(hasPermission('EMPLOYEE', 'services:manage')).toBe(false)
    expect(hasPermission('EMPLOYEE', 'clients:manage')).toBe(true)
    expect(hasPermission('EMPLOYEE', 'appointments:manage')).toBe(true)
    expect(hasPermission('EMPLOYEE', 'billing:manage')).toBe(false)
    expect(hasPermission('EMPLOYEE', 'business:delete')).toBe(false)
    expect(isOwner('EMPLOYEE')).toBe(false)
    expect(isManagement('EMPLOYEE')).toBe(false)
  })

  it('null or undefined role should have no permissions', () => {
    expect(hasPermission(null, 'clients:manage')).toBe(false)
    expect(hasPermission(undefined, 'appointments:manage')).toBe(false)
    expect(isManagement(null)).toBe(false)
  })
})
