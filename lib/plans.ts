/**
 * lib/plans.ts
 * SaaS plan management and feature limit helpers for BookingPro.
 */

export interface Plan {
  id: string
  name: string
  slug: 'free' | 'pro' | 'business' | 'enterprise'
  price_monthly: number
  price_yearly: number
  appointments_limit: number | null
  employees_limit: number | null
  locations_limit: number | null
  storage_limit_mb: number
  sms_enabled: boolean
  inventory_enabled: boolean
  analytics_enabled: boolean
  api_enabled: boolean
}

/** Check if a given feature is enabled for a plan */
export function isFeatureEnabled(plan: Plan | null, feature: keyof Pick<Plan, 'sms_enabled' | 'inventory_enabled' | 'analytics_enabled' | 'api_enabled'>): boolean {
  if (!plan) return false
  return plan[feature] === true
}
