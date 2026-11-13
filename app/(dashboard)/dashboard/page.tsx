import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatInBusinessTimezone } from '@/lib/utils'
import { Users, Package, CalendarDays, TrendingUp, ArrowUpRight, DollarSign, AlertCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { OnboardingChecklist } from '@/components/onboarding-checklist'
import { getAuthUser } from '@/lib/auth-user'

const STATUS_STRIPE: Record<string, string> = {
  pending:   '#94a3b8',
  confirmed: '#16a34a',
  completed: '#3b82f6',
  paid:      '#eab308',
  cancelled: '#ef4444',
  no_show:   '#f97316',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('dashboard')
  const user = await getAuthUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, currency, timezone, onboarding_completed, enabled_modules')
    .eq('owner_id', user!.id)
    .maybeSingle()

  if (!business) return null

  if (!business.onboarding_completed) redirect('/onboarding')

  // eslint-disable-next-line react-hooks/purity
  const todayStr = new Date().toISOString().slice(0, 10)
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)

  const [
    { count: clientCount },
    { data: apptToday },
    { data: recentTransactions },
    { data: upcomingAppointments },
    { data: todayRevenue },
    { data: inventoryItems },
    { data: sparklineRaw },
  ] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('appointments').select('id, status')
      .eq('business_id', business.id)
      .gte('starts_at', todayStr)
      // eslint-disable-next-line react-hooks/purity
      .lt('starts_at', new Date(Date.now() + 86400000).toISOString().slice(0, 10)),
    supabase.from('transactions').select('id, amount, payment_method, created_at, clients(name)')
      .eq('business_id', business.id).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('appointments')
      .select('id, starts_at, status, clients(name), services(name)')
      .eq('business_id', business.id)
      .gte('starts_at', new Date().toISOString())
      .in('status', ['pending', 'confirmed'])
      .order('starts_at', { ascending: true }).limit(5),
    supabase.from('transactions').select('amount')
      .eq('business_id', business.id).eq('status', 'completed')
      .gte('created_at', todayStr),
    supabase.from('inventory_items')
      .select('quantity, low_stock_threshold')
      .eq('business_id', business.id),
    supabase.from('transactions').select('amount, created_at')
      .eq('business_id', business.id).eq('status', 'completed')
      .gte('created_at', sevenDaysAgo),
  ])

  const revenueToday = todayRevenue?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0
  const lowStock = (inventoryItems ?? []).filter(
    (item) => Number(item.quantity) <= Number(item.low_stock_threshold)
  ).length

  // Sparkline: sum revenue per day for last 7 days
  const sparklineDays = Array.from({ length: 7 }, (_, i) => {
    // eslint-disable-next-line react-hooks/purity
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return d.toISOString().slice(0, 10)
  })
  const sparklineByDay: Record<string, number> = {}
  for (const day of sparklineDays) sparklineByDay[day] = 0
  for (const tx of sparklineRaw ?? []) {
    const day = tx.created_at.slice(0, 10)
    if (day in sparklineByDay) sparklineByDay[day] += tx.amount
  }
  const sparklineValues = sparklineDays.map((d) => sparklineByDay[d])
  const sparklineMax = Math.max(...sparklineValues, 1)

  // Bookings today breakdown by status
  const apptTodayCount = apptToday?.length ?? 0
  const statusBreakdown: Record<string, number> = {}
  for (const a of apptToday ?? []) {
    statusBreakdown[a.status] = (statusBreakdown[a.status] ?? 0) + 1
  }
  const breakdownParts = (['confirmed', 'pending', 'completed'] as const)
    .filter((s) => (statusBreakdown[s] ?? 0) > 0)
    .map((s) => `${statusBreakdown[s]} ${s}`)

  // ========================
  // RENTABILITY METRICS (Phase 2 - Qlyo)
  // ========================

  // Use sevenDaysAgo already defined above (uses slice(0,10))
  const sevenDaysAgoDate = sevenDaysAgo // already defined

  // Calculate monthly totals for comparison
  const firstDayOfMonth = new Date().toISOString().split('T')[0] + '-01'

  // Get all completed transactions for the last 7 days (CA Facturé)
  const { data: caFactureRaw } = await supabase
    .from('transactions')
    .select('amount, tax_amount, created_at')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgoDate)

  // Calculate monthly totals for comparison
  const { data: caFactureMonth } = await supabase
    .from('transactions')
    .select('amount, tax_amount, created_at')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .gte('created_at', firstDayOfMonth)

  const caFactureHT = caFactureRaw?.reduce((sum, tx) => sum + (tx.amount - tx.tax_amount), 0) ?? 0
  const caFactureHTMonth = caFactureMonth?.reduce((sum, tx) => sum + (tx.amount - tx.tax_amount), 0) ?? 0

  // Get paid transactions (CA Encaissé)
  const { data: caEncaisseRaw } = await supabase
    .from('transactions')
    .select('amount, tax_amount, created_at, payment_method')
    .eq('business_id', business.id)
    .eq('status', 'paid')
    .gte('created_at', sevenDaysAgoDate)

  const caEncaisseeTTC = caEncaisseRaw?.reduce((sum, tx) => sum + tx.amount, 0) ?? 0

  // Get expenses for the month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount_ht, tax_rate, category, expense_date')
    .eq('business_id', business.id)
    .gte('expense_date', firstDayOfMonth)

  const chargesTotalHT = expenses?.reduce((sum, e) => sum + (e.amount_ht ?? 0), 0) ?? 0
  const chargesTotalTTC = expenses?.reduce((sum, e) => sum + (e.amount_ht ?? 0) * (1 + (e.tax_rate ?? 20) / 100), 0) ?? 0

  // Calculate net benefit
  const beneficeNet = caEncaisseeTTC - chargesTotalTTC

  // Outstanding invoices (impayés)
  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('id, total_ttc, due_date, status')
    .eq('business_id', business.id)
    .eq('status', 'sent')
    .lt('due_date', new Date().toISOString().split('T')[0])

  const impayesCount = unpaidInvoices?.length ?? 0

  // Break-even calculation: find minimum revenue needed to cover expenses
  const breakEvenPoint = chargesTotalTTC
  const dailyAverage = caEncaisseeTTC / 7
  const daysToBreakEven = dailyAverage > 0 ? Math.ceil(breakEvenPoint / dailyAverage) : 0
  const breakEvenProgress = Math.min(100, (caEncaisseeTTC / Math.max(breakEvenPoint, 1)) * 100)

  // Revenue by service category
  const { data: revenueByService } = await supabase
    .from('transactions')
    .select('amount, services(name, category)')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo)

  const revenueByCategory: Record<string, number> = {}
  for (const tx of revenueByService ?? []) {
    const category = (tx.services as any)?.category ?? 'other'
    revenueByCategory[category] = (revenueByCategory[category] ?? 0) + tx.amount
  }

  // Revenue by vehicle body type (through appointments with vehicles)
  const { data: appointmentsWithVehicles } = await supabase
    .from('appointments')
    .select('id, vehicles!inner(body_type_id), transactions(amount)')
    .eq('appointments.business_id', business.id)
    .eq('appointments.status', 'completed')
    .gte('appointments.starts_at', sevenDaysAgo)

  const revenueByBodyType: Record<string, number> = {}
  const bodyTypeLabels: Record<string, string> = {
    moto: 'Moto',
    citadine: 'Citadine',
    berline: 'Berline',
    break: 'Break',
    suv: 'SUV/4x4',
    monospace: 'Monospace',
    utilitaire: 'Utilitaire',
    camping_car: 'Camping-car',
    poids_lourd: 'Poids lourd',
    autre: 'Autre'
  }
  for (const appt of appointmentsWithVehicles ?? []) {
    const bodyType = (appt.vehicles as any)?.body_type_id
    const amount = (appt.transactions as any)?.amount ?? 0
    if (bodyType) {
      revenueByBodyType[bodyType] = (revenueByBodyType[bodyType] ?? 0) + amount
    }
  }

  // Top clients (last 12 months)
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0]
  const { data: clientRevenue } = await supabase
    .from('transactions')
    .select('amount, clients(name)')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .gte('created_at', oneYearAgo)

  const clientRevenueMap: Record<string, { name: string; total: number; visits: number }> = {}
  for (const tx of clientRevenue ?? []) {
    const clientId = (tx.clients as any)?.id ?? 'walkin'
    const clientName = (tx.clients as any)?.name ?? 'Client occasionnel'
    if (!clientRevenueMap[clientId]) {
      clientRevenueMap[clientId] = { name: clientName, total: 0, visits: 0 }
    }
    clientRevenueMap[clientId].total += tx.amount
    clientRevenueMap[clientId].visits += 1
  }
  const topClients = Object.entries(clientRevenueMap)
    .map(([client_id, data]) => ({ client_id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Calculate margin by service (revenue - cost_price)
  const { data: servicesWithMargin } = await supabase
    .from('services')
    .select('id, name, price, cost_price_ht, category')
    .eq('business_id', business.id)

  const marginByService: Array<{ service_id: string; service_name: string; revenue: number; cost: number; margin: number; margin_percent: number }> = []
  for (const s of servicesWithMargin ?? []) {
    const sAny = s as any
    const serviceRevenue = revenueByCategory[sAny.category] ?? 0
    const cost = sAny.cost_price_ht ?? 0
    const margin = serviceRevenue - cost
    const marginPercent = serviceRevenue > 0 ? (margin / serviceRevenue) * 100 : 0
    marginByService.push({
      service_id: s.id,
      service_name: s.name,
      revenue: serviceRevenue,
      cost,
      margin: Math.round(margin * 100) / 100,
      margin_percent: Math.round(marginPercent * 100) / 100
    })
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-gray-100 text-gray-600',
  }

  return (
    <>
      <Header title={t('title')} />
      <main className="p-6 space-y-6">
        <OnboardingChecklist businessId={business.id} enabledModules={business.enabled_modules ?? ['bookings', 'pos', 'crm', 'inventory', 'notifications']} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue card — custom render for sparkline */}
          <Link href="/pos/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(revenueToday, business.currency)}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.revenueToday')}</div>
                {/* Sparkline */}
                <div className="flex items-end gap-[2px] mt-2 h-6">
                  {sparklineValues.map((val, i) => {
                    const isToday = i === 6
                    const barH = Math.max(4, Math.round((val / sparklineMax) * 24))
                    return (
                      <div
                        key={i}
                        style={{
                          width: 6,
                          height: barH,
                          backgroundColor: isToday ? '#16a34a' : '#86efac',
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Bookings today card — custom render for breakdown */}
          <Link href="/booking">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{apptTodayCount}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.appointmentsToday')}</div>
                {breakdownParts.length > 0 && (
                  <div className="mt-1 text-gray-400 truncate" style={{ fontSize: 11 }}>
                    {breakdownParts.join(' · ')}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Clients card */}
          <Link href="/crm">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{String(clientCount ?? 0)}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.totalClients')}</div>
              </CardContent>
            </Card>
          </Link>

          {/* Low stock card */}
          <Link href="/inventory">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${lowStock > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <Package className={`w-4 h-4 ${lowStock > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{lowStock > 0 ? String(lowStock) : t('stats.lowStockOk')}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.lowStock')}</div>
              </CardContent>
            </Card>
          </Link>

          {/* CA Encaissé card */}
          <Link href="/pos/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(caEncaisseeTTC, business.currency)}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.revenueToday')}</div>
                <div className="text-xs text-gray-400 mt-1">CA Encaissé TTC</div>
              </CardContent>
            </Card>
          </Link>

          {/* CA Facturé HT card */}
          <Link href="/pos/history">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(caFactureHT, business.currency)}</div>
                <div className="text-sm text-gray-500 mt-0.5">{t('stats.revenueToday')}</div>
                <div className="text-xs text-gray-400 mt-1">CA Facturé HT</div>
              </CardContent>
            </Card>
          </Link>

          {/* Bénéfice Net card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(beneficeNet, business.currency)}</div>
              <div className="text-sm text-gray-500 mt-0.5">Bénéfice Net</div>
              {breakEvenProgress > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, breakEvenProgress)}%`,
                      backgroundColor: breakEvenProgress >= 100 ? '#22c55e' : breakEvenProgress >= 80 ? '#eab308' : '#f97316'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rentabilité Section */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Charges (HT)</div>
                <div className="text-xl font-semibold">{formatCurrency(chargesTotalHT, business.currency)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Seuil de rentabilité</div>
                <div className="text-xl font-semibold">{formatCurrency(breakEvenPoint, business.currency)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Impayés</div>
                <div className="text-xl font-semibold text-red-600">{impayesCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                {t('upcomingAppointments.heading')}
                <Link href="/booking" className="text-sm font-normal text-blue-600 hover:underline">{t('upcomingAppointments.viewAll')}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments?.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">
                  {t('upcomingAppointments.empty')}{' '}
                  <Link href="/booking" className="text-blue-600 hover:underline">{t('upcomingAppointments.addOne')}</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments?.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 pl-3 relative">
                      {/* Status stripe */}
                      <span
                        className="absolute left-0 top-1 bottom-1"
                        style={{ width: 3, borderRadius: 2, backgroundColor: STATUS_STRIPE[a.status] ?? STATUS_STRIPE.pending }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {(a.clients as { name: string } | null)?.name ?? t('upcomingAppointments.walkIn')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(a.services as { name: string } | null)?.name} · {formatInBusinessTimezone(a.starts_at, business.timezone)}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.status]}`}>
                        {t(`appointmentStatus.${a.status}` as any)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                {t('recentSales.heading')}
                <Link href="/pos/history" className="text-sm font-normal text-blue-600 hover:underline">{t('recentSales.viewAll')}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions?.length === 0 ? (
                <div className="text-sm text-gray-500 py-4 text-center">
                  {t('recentSales.empty')}{' '}
                  <Link href="/pos" className="text-blue-600 hover:underline">{t('recentSales.makeFirst')}</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {(tx.clients as { name: string } | null)?.name ?? t('recentSales.walkIn')}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {tx.payment_method} · {formatInBusinessTimezone(tx.created_at, business.timezone)}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(tx.amount, business.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
