import { describe, it, expect } from 'vitest'
import { isFeatureEnabled, Plan } from '@/lib/plans'

const mockFreePlan: Plan = {
  id: '1',
  name: 'Free',
  slug: 'free',
  price_monthly: 0,
  price_yearly: 0,
  appointments_limit: 50,
  employees_limit: 1,
  locations_limit: 1,
  storage_limit_mb: 50,
  sms_enabled: false,
  inventory_enabled: false,
  analytics_enabled: false,
  api_enabled: false,
}

const mockBusinessPlan: Plan = {
  id: '3',
  name: 'Business',
  slug: 'business',
  price_monthly: 79,
  price_yearly: 790,
  appointments_limit: null,
  employees_limit: 15,
  locations_limit: 3,
  storage_limit_mb: 2000,
  sms_enabled: true,
  inventory_enabled: true,
  analytics_enabled: true,
  api_enabled: true,
}

describe('SaaS Plans and Feature Limits', () => {
  it('Free plan should have inventory and api disabled', () => {
    expect(isFeatureEnabled(mockFreePlan, 'inventory_enabled')).toBe(false)
    expect(isFeatureEnabled(mockFreePlan, 'api_enabled')).toBe(false)
    expect(isFeatureEnabled(mockFreePlan, 'sms_enabled')).toBe(false)
  })

  it('Business plan should have inventory, analytics, and api enabled', () => {
    expect(isFeatureEnabled(mockBusinessPlan, 'inventory_enabled')).toBe(true)
    expect(isFeatureEnabled(mockBusinessPlan, 'analytics_enabled')).toBe(true)
    expect(isFeatureEnabled(mockBusinessPlan, 'api_enabled')).toBe(true)
    expect(isFeatureEnabled(mockBusinessPlan, 'sms_enabled')).toBe(true)
  })

  it('null plan should return false for all features', () => {
    expect(isFeatureEnabled(null, 'inventory_enabled')).toBe(false)
  })
})
