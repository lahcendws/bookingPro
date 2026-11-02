'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Download, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function GDPRSection() {
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [consentType, setConsentType] = useState('terms_privacy')
  const [consentSaving, setConsentSaving] = useState(false)
  const [consentSuccess, setConsentSuccess] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/gdpr/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookingpro-gdpr-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'exportation des données.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/gdpr/delete', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deletion failed')
      setDeleteSuccess(`Compte programmé pour suppression. Rétention jusqu'au : ${new Date(data.retentionExpiresAt).toLocaleDateString()}`)
      setDeleteModalOpen(false)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleConsent() {
    setConsentSaving(true)
    setConsentSuccess(false)
    try {
      const res = await fetch('/api/gdpr/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType, version: '1.0' }),
      })
      if (!res.ok) throw new Error('Consent save failed')
      setConsentSuccess(true)
      setTimeout(() => setConsentSuccess(false), 3000)
    } catch {
      alert('Erreur lors de l\'enregistrement du consentement.')
    } finally {
      setConsentSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Conformité RGPD & Vie Privée</h2>
            <p className="text-sm text-gray-500">Gérez vos données personnelles, exportations et consentements conformément au RGPD.</p>
          </div>
        </div>

        {/* 6.1 Data Export */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">6.1 Export de données</h3>
          <p className="text-xs text-gray-500 mb-3">Téléchargez une archive JSON complète contenant vos données professionnelles, profil, clients, rendez-vous et transactions.</p>
          <Button onClick={handleExport} disabled={exporting} variant="outline" className="gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exporter mes données (JSON)
          </Button>
        </div>

        {/* 6.4 Consent */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">6.4 Gestion du consentement</h3>
          <p className="text-xs text-gray-500 mb-3">Enregistrez ou renouvelez votre consentement pour le traitement des données et conditions d'utilisation.</p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={consentType}
              onChange={(e) => setConsentType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="terms_privacy">Conditions générales & Politique de confidentialité</option>
              <option value="marketing">Communications marketing & newsletters</option>
              <option value="data_processing">Traitement des données de santé / services</option>
            </select>
            <Button onClick={handleConsent} disabled={consentSaving} className="gap-2">
              {consentSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enregistrer le consentement
            </Button>
          </div>
          {consentSuccess && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Consentement enregistré avec succès (avec hachage IP auditable).
            </p>
          )}
        </div>

        {/* 6.2 Account Deletion */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-red-600 mb-1">6.2 Suppression de compte (Soft Delete & Rétention)</h3>
          <p className="text-xs text-gray-500 mb-3">La suppression de compte active une période de rétention de 30 jours (soft delete) avant la suppression définitive (hard delete).</p>
          <Button onClick={() => setDeleteModalOpen(true)} variant="destructive" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </Button>
          {deleteSuccess && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {deleteSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-gray-950">Confirmer la suppression du compte</h3>
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer votre compte BookingPro ? Vos données passeront en période de rétention de 30 jours avant suppression définitive.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer la suppression'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
