import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, clients(name, phone), vehicles(brand, model, plate_number), quote_lines(*)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Devis & Chiffrage Express"
        actions={
          <Link href="/vehicles">
            <button className="inline-flex items-center justify-center rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4 mr-1.5" /> Créer un devis (via Véhicules)
            </button>
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {!quotes || quotes.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucun devis enregistré</div>
              <p className="text-xs text-gray-400 mt-1">Rendez-vous dans la section Véhicules pour générer un devis express en moins de 2 minutes.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <th className="text-left px-4 py-3 font-medium">Référence</th>
                  <th className="text-left px-4 py-3 font-medium">Client / Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Validité</th>
                  <th className="text-right px-4 py-3 font-medium">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q: any) => (
                  <tr key={q.id} className="border-b hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      #{q.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{q.clients?.name || 'Client inconnu'}</div>
                      <div className="text-xs text-gray-500">
                        {q.vehicles ? `${q.vehicles.brand} ${q.vehicles.model} (${q.vehicles.plate_number})` : 'Aucun véhicule'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {q.total_amount} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}
