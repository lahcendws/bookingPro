import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/layout/sidebar'
import { getAuthUser } from '@/lib/auth-user'
import { getBusinessForUser } from '@/lib/business'

// Default operational modules available to all business users (owners and employees)
const DEFAULT_MODULES = ['bookings', 'crm', 'pos', 'inventory', 'notifications']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) redirect('/login')

  const business = await getBusinessForUser(user.id)

  if (!business) redirect('/onboarding')

  // SaaS: if user is on the main domain, redirect to their subdomain preserving the path.
  // Covers /dashboard, /settings, /pos, /crm, /inventory, /booking — any app route.
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  if (rootDomain && business?.slug) {
    const headersList = await headers()
    const host = headersList.get('host') ?? ''
    if (host === rootDomain || host === `www.${rootDomain}`) {
      // x-pathname is set by middleware on every request
      const pathname = headersList.get('x-pathname') ?? '/dashboard'
      redirect(`https://${business.slug}.${rootDomain}${pathname}`)
    }
  }

  const isBusinessOwner = 'isOwner' in business && business.isOwner === true

  // Use business configured modules or defaults - ensures employees always have access to core modules
  const enabledModules = business.enabled_modules?.length ? business.enabled_modules : DEFAULT_MODULES

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar businessName={business.name} enabledModules={enabledModules} isBusinessOwner={isBusinessOwner} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}
