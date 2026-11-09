import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Clock, Wrench, ShieldCheck, Car, User } from 'lucide-react'

export async function generateMetadata() {
  return { title: 'Suivi de Chantier — BookingPro' }
}

export default async function TrackJobPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params
  const { token } = params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs' as any)
    .select('*, clients(name), vehicles(brand, model, plate), job_inspections(*)')
    .eq('tracking_token', token)
    .single()

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center max-w-md w-full space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">!</div>
          <h1 className="text-lg font-bold text-gray-900">Chantier introuvable</h1>
          <p className="text-xs text-gray-500">Le lien de suivi est invalide ou a expiré.</p>
        </div>
      </div>
    )
  }

  const stages = [
    { key: 'reception', label: 'Réception & État des lieux' },
    { key: 'en_cours', label: 'Intervention en cours' },
    { key: 'controle', label: 'Contrôle qualité' },
    { key: 'livre', label: 'Prêt / Livré' },
  ]

  const currentStageIdx = stages.findIndex((s) => s.key === job.status)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Suivi de votre véhicule</h1>
          <p className="text-xs text-gray-500">Consultez en temps réel l&apos;avancement des travaux dans notre atelier.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-6">
            <div>
              <span className="text-xs text-gray-400 block font-medium">Véhicule</span>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mt-0.5">
                <Car className="w-4 h-4 text-blue-600" /> {job.vehicles?.brand} {job.vehicles?.model} ({job.vehicles?.plate})
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Client</span>
              <span className="text-sm font-bold text-gray-800">{job.clients?.name}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Avancement du chantier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stages.map((st, idx) => {
                const isPassed = idx <= currentStageIdx
                const isCurrent = st.key === job.status
                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-semibold'
                        : isPassed
                        ? 'bg-blue-50 text-blue-800 border-blue-200 font-medium'
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    <div className="text-xs">{st.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {job.job_inspections && job.job_inspections.length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">États des lieux & Rapports</h3>
              <div className="space-y-3">
                {job.job_inspections.map((insp: any) => (
                  <div key={insp.id} className="border rounded-2xl p-4 bg-gray-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${insp.type === 'reception' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {insp.type === 'reception' ? 'État des lieux initial' : 'Contrôle de livraison'}
                      </span>
                      <span className="text-[10px] text-gray-400">{new Date(insp.created_at).toLocaleDateString()}</span>
                    </div>

                    {insp.signature_data && (
                      <div className="pt-2">
                        <span className="text-[10px] text-gray-400 block mb-1">Signature validée</span>
                        <img src={insp.signature_data} alt="Signature" className="h-10 border rounded bg-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
