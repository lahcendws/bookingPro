import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { getTranslations } from 'next-intl/server'
import { SettingsTabs } from './settings-tabs'
import { getAuthUser } from '@/lib/auth-user'

export default async function SettingsPage() {
  const supabase = await createClient()
  const t = await getTranslations('settings')
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, slug, type, phone, email, address, timezone, currency, plan, plan_expires_at, telegram_bot_token, telegram_chat_id, viber_bot_token, viber_chat_id, owner_whatsapp, email_provider, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, resend_api_key, meta_whatsapp_phone_number_id, meta_whatsapp_access_token, wa_template_confirmation, wa_template_reminder, wa_template_thankyou, wa_template_reactivation, wa_template_birthday, wa_template_language, brand_color, notification_language, logo_url, enabled_modules, owner_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) redirect('/onboarding')

  const [
    { data: services },
    { data: employees },
    { data: businessHours },
    { data: businessMembers },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price, duration_min, category, is_active, capacity')
      .eq('business_id', business.id)
      .order('name'),
    supabase
      .from('employees')
      .select('id, name, role, email, phone, is_active, user_id')
      .eq('business_id', business.id)
      .order('name'),
    supabase
      .from('business_hours')
      .select('day_of_week, is_open, open_time, close_time, break_start, break_end')
      .eq('business_id', business.id)
      .order('day_of_week'),
    supabase
      .from('business_members')
      .select('user_id, role, employee_id')
      .eq('business_id', business.id),
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const ownerFullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  if (ownerFullName && business.owner_id) {
    const ownerEmp = (employees ?? []).find(e => e.user_id === business.owner_id || e.name === 'Patron')
    if (ownerEmp && ownerEmp.name === 'Patron') {
      await supabase.from('employees').update({ name: ownerFullName }).eq('id', ownerEmp.id)
      ownerEmp.name = ownerFullName
    }
  }

  const enrichedEmployees = (employees ?? []).map(emp => {
    const member = (businessMembers ?? []).find(m => m.employee_id === emp.id || (emp.user_id && m.user_id === emp.user_id))
    const isOwner = business.owner_id && (emp.user_id === business.owner_id || member?.user_id === business.owner_id)
    return {
      ...emp,
      role: isOwner ? 'admin' : (member?.role ?? emp.role ?? 'employee'),
      isOwner: !!isOwner,
    }
  })

  return (
    <>
      <Header title={t('title')} />
      <SettingsTabs
        business={business}
        services={services ?? []}
        employees={enrichedEmployees}
        workingHours={businessHours ?? []}
        userEmail={user.email ?? ''}
      />
    </>
  )
}
