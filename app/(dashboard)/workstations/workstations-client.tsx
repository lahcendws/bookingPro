'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Layers, Plus, Trash2, CheckCircle2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WorkstationsClient({ initialWorkstations }: { initialWorkstations: any[] }) {
  const [workstations, setWorkstations] = useState(initialWorkstations)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/workstations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })
      const text = await res.text()
      let data: any = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (parseErr) {
        throw new Error('Réponse serveur invalide (non-JSON)')
      }

      if (res.ok) {
        setWorkstations([data, ...workstations])
        setName('')
        setDescription('')
        setMessage('Poste de travail créé avec succès !')
      } else {
        alert('Erreur: ' + (data.error || 'Impossible de créer le poste'))
      }
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce poste de travail ?')) return
    try {
      const res = await fetch(`/api/workstations?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setWorkstations(workstations.filter((w: any) => w.id !== id))
        setMessage('Poste supprimé.')
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    }
  }

  return (
    <>
      <Header
        title="Postes de Travail"
        actions={
          <div className="text-xs text-gray-500">
            Gestion des postes techniques & cabines
          </div>
        }
      />
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Create Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" /> Ajouter un nouveau poste
          </h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nom du poste</label>
              <input
                type="text"
                placeholder="Ex: Poste PPF 1, Cabine Peinture"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
              <input
                type="text"
                placeholder="Ex: Équipé découpe laser & éclairage LED"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> {loading ? 'Création...' : 'Créer le poste'}
              </Button>
            </div>
          </form>
        </div>

        {/* Workstations List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-gray-50 font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Postes enregistrés ({workstations.length})
          </div>
          {workstations.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucun poste de travail</div>
              <p className="text-xs text-gray-400 mt-1">Créez votre premier poste ci-dessus pour planifier vos interventions.</p>
            </div>
          ) : (
            <div className="divide-y">
              {workstations.map((w: any) => (
                <div key={w.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{w.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{w.description || 'Aucune description'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Actif
                    </span>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(w.id)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 px-2.5">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
