import { createClient } from './supabase/server'

/**
 * Get the business associated with a user.
 * First checks if the user owns a business, then checks if they're an employee in a business.
 * This should be used in server components/pages that need business data.
 */
export async function getBusinessForUser(userId: string) {
  const supabase = await createClient()

  // First try to find a business owned by the user
  const { data: ownedBusiness } = await supabase
    .from('businesses')
    .select('id, name, slug, plan, enabled_modules, timezone, currency, onboarding_completed')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ownedBusiness) return ownedBusiness

  // If no owned business, check if user is an employee in a business
  const { data: employee } = await supabase
    .from('employees')
    .select('business_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (employee?.business_id) {
    const { data: employeeBusiness } = await supabase
      .from('businesses')
      .select('id, name, slug, plan, enabled_modules, timezone, currency, onboarding_completed')
      .eq('id', employee.business_id)
      .maybeSingle()
    return employeeBusiness
  }

  return null
}