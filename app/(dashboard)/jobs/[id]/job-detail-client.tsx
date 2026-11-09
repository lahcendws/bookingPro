'use client'

import { useState, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { ArrowLeft, Camera, ShieldCheck, CheckCircle2, FileText, User, Car, Check } from 'lucide-react'
import Link from 'next/link'

export function JobDetailClient({ job }: { job: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reception' | 'delivery'>('overview')
  const [inspectionType, setInspectionType] = useState<'reception' | 'delivery'>('reception')
  const [zones, setZones] = useState([
    { name: 'Face avant', comments: '', photos: [] },
    { name: 'Flanc droit', comments: '', photos: [] },
    { name: 'Face arrière', comments: '', photos: [] },
    { name: 'Flanc gauche', comments: '', photos: [] },
    { name: 'Toit & Capot', comments: '', photos: [] },
    { name: 'Intérieur / Habitacle', comments: '', photos: [] },
  ])
  const [consentGallery, setConsentGallery] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Canvas signature handlers
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  function stopDrawing() {
    setIsDrawing(false)
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  async function handleSaveInspection(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const signature_data = canvasRef.current ? canvasRef.current.toDataURL() : null
      const res = await fetch(`/api/jobs/${job.id}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inspectionType,
          zones,
          signature_data,
          client_consent_gallery: consentGallery
        })
      })

      if (res.ok) {
        window.location.reload()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header
        title={`Chantier #${job.id.substring(0, 8)}`}
        actions={
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux chantiers
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">{job.clients?.name}</span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                {job.status.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span>{job.vehicles?.brand} {job.vehicles?.model} — {job.vehicles?.plate}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setInspectionType('reception'); setActiveTab('reception') }}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700"
            >
              + Nouvel État des Lieux (Réception)
            </button>
            <button
              onClick={() => { setInspectionType('delivery'); setActiveTab('delivery') }}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700"
            >
              + Checklist de Livraison (Après)
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                <FileText className="w-4 h-4 text-blue-600" /> Historique des États des Lieux
              </h3>
              {job.job_inspections?.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-8">Aucun état des lieux enregistré</div>
              ) : (
                <div className="space-y-3">
                  {job.job_inspections.map((insp: any) => (
                    <div key={insp.id} className="border rounded-xl p-4 bg-gray-50/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${insp.type === 'reception' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {insp.type === 'reception' ? 'État des lieux Réception' : 'Checklist Livraison'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(insp.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Consentement galerie photo: <span className="font-semibold">{insp.client_consent_gallery ? 'Oui' : 'Non'}</span>
                      </div>
                      {insp.signature_data && (
                        <div className="mt-2">
                          <span className="text-[10px] text-gray-400 block mb-1">Signature client:</span>
                          <img src={insp.signature_data} alt="Signature" className="h-12 border rounded bg-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                <ShieldCheck className="w-4 h-4 text-purple-650" /> Lien de Suivi Client
              </h3>
              <p className="text-xs text-gray-600">
                Partagez ce lien sécurisé avec votre client pour qu&apos;il puisse suivre l&apos;avancement des travaux et consulter les photos de son véhicule en temps réel.
              </p>
              <div className="p-3 bg-gray-50 border rounded-xl flex items-center justify-between">
                <span className="text-xs text-gray-600 font-mono truncate mr-2">
                  {typeof window !== 'undefined' ? `${window.location.origin}/track/${job.tracking_token}` : `/track/${job.tracking_token}`}
                </span>
                <Link
                  href={`/track/${job.tracking_token}`}
                  target="_blank"
                  className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg shrink-0"
                >
                  Ouvrir
                </Link>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'reception' || activeTab === 'delivery') && (
          <form onSubmit={handleSaveInspection} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-base font-bold text-gray-900">
                {inspectionType === 'reception' ? 'Nouvel État des Lieux — Réception Véhicule' : 'Checklist de Livraison — Véhicule Prêt'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="text-xs text-gray-500 hover:text-gray-900 font-medium"
              >
                Annuler
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zones.map((zone, idx) => (
                <div key={zone.name} className="border rounded-xl p-4 bg-gray-50/50 space-y-3">
                  <div className="font-semibold text-xs text-gray-900 flex items-center justify-between">
                    <span>Zone {idx + 1}: {zone.name}</span>
                    <span className="text-[10px] text-gray-400">Photos / Dommages</span>
                  </div>
                  <textarea
                    placeholder="Observations ou dommages constatés..."
                    value={zone.comments}
                    onChange={(e) => {
                      const updated = [...zones]
                      updated[idx].comments = e.target.value
                      setZones(updated)
                    }}
                    rows={2}
                    className="w-full text-xs border rounded-lg p-2 bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Signature Client & RGPD</h4>
              <div className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGallery}
                  onChange={(e) => setConsentGallery(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="consent" className="text-xs text-gray-700 font-medium">
                  Le client autorise l&apos;utilisation des photos du véhicule dans la galerie publique (RGPD / respect de la vie privée).
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Signature Numérique du Client</label>
                <div className="border rounded-xl bg-white overflow-hidden inline-block shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="cursor-crosshair bg-white block"
                  />
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    Effacer la signature
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
              >
                Enregistrer l&apos;état des lieux
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  )
}
