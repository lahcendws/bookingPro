'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { ArrowLeft, Plus, Minus, CheckCircle2, AlertCircle, Car, User, FileText, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { STANDARD_BODY_TYPES } from '@/lib/qlyo-types'

interface Service {
  id: string
  name: string
  price: number
  duration_min: number
  category: string | null
}

interface BodyType {
  id: string
  code: string
  label: string
}

interface Vehicle {
  id: string
  brand: string
  model: string
  plate_number: string
  body_type_id?: string
  size_class?: string
  client_id?: string
  clients?: { id: string; name: string; email: string; phone: string } | null
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface QuoteLine {
  service_id: string
  body_type_id?: string
  quantity: number
  unit_price: number
  total_price: number
  service_name: string
  body_type_label?: string
}

export function NewQuoteClient({
  businessId,
  vehicle,
  client,
  services,
  bodyTypes
}: {
  businessId: string
  vehicle: Vehicle | null
  client: Client | null
  services: Service[]
  bodyTypes: BodyType[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('quotes')

  const [lines, setLines] = useState<QuoteLine[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [selectedClientId, setSelectedClientId] = useState(client?.id || '')
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle?.id || '')
  const [showClientSelect, setShowClientSelect] = useState(false)
  const [showVehicleSelect, setShowVehicleSelect] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [selectedBodyTypeId, setSelectedBodyTypeId] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Load clients and vehicles on mount
  useEffect(() => {
    async function loadData() {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('business_id', businessId)
        .order('name')
      if (clientsData) setClients(clientsData)

      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, brand, model, plate_number, body_type_id, size_class, client_id')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      if (vehiclesData) setVehicles(vehiclesData)
    }
    loadData()
  }, [businessId])

  // Pre-select vehicle if from URL
  useEffect(() => {
    const vehicleId = searchParams.get('vehicle_id')
    if (vehicleId && !selectedVehicleId) {
      setSelectedVehicleId(vehicleId)
      const v = vehicles.find(v => v.id === vehicleId)
      if (v?.client_id) setSelectedClientId(v.client_id)
    }
    const clientId = searchParams.get('client_id')
    if (clientId && !selectedClientId) {
      setSelectedClientId(clientId)
    }
  }, [searchParams, selectedVehicleId, selectedClientId, vehicles])

  // Auto-set body type from vehicle
  useEffect(() => {
    if (selectedVehicleId) {
      const v = vehicles.find(v => v.id === selectedVehicleId)
      if (v?.body_type_id) {
        setSelectedBodyTypeId(v.body_type_id)
      }
    }
  }, [selectedVehicleId, vehicles])

  function addLine() {
    if (!selectedServiceId) return
    const service = services.find(s => s.id === selectedServiceId)
    if (!service) return

    const basePrice = service.price
    const newLine: QuoteLine = {
      service_id: service.id,
      body_type_id: selectedBodyTypeId || undefined,
      quantity,
      unit_price: basePrice,
      total_price: basePrice * quantity,
      service_name: service.name,
      body_type_label: selectedBodyTypeId ? bodyTypes.find(b => b.id === selectedBodyTypeId)?.label : undefined
    }
    setLines([...lines, newLine])
    setSelectedServiceId('')
    setSelectedBodyTypeId('')
    setQuantity(1)
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index))
  }

  function updateLineQuantity(index: number, newQuantity: number) {
    if (newQuantity < 1) return
    const newLines = [...lines]
    newLines[index] = {
      ...newLines[index],
      quantity: newQuantity,
      total_price: newLines[index].unit_price * newQuantity
    }
    setLines(newLines)
  }

  function updateLinePrice(index: number, newPrice: number) {
    if (newPrice < 0) return
    const newLines = [...lines]
    newLines[index] = {
      ...newLines[index],
      unit_price: newPrice,
      total_price: newPrice * newLines[index].quantity
    }
    setLines(newLines)
  }

  const subtotal = lines.reduce((sum, l) => sum + l.total_price, 0)
  const tax = subtotal * 0.2 // 20% TVA
  const total = subtotal + tax

  async function handleCreate() {
    if (!selectedClientId) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (lines.length === 0) {
      setError('Veuillez ajouter au moins une ligne au devis')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // First create the quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          business_id: businessId,
          client_id: selectedClientId,
          vehicle_id: selectedVehicleId || null,
          status: 'brouillon',
          valid_until: validUntil,
          total_amount: total,
          notes
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      // Then create quote lines
      const quoteLines = lines.map(line => ({
        quote_id: quote.id,
        service_id: line.service_id,
        body_type_id: line.body_type_id || null,
        description: line.service_name,
        quantity: line.quantity,
        unit_price: line.unit_price,
        total_price: line.total_price,
        material_estimated_m: 0
      }))

      const { error: linesError } = await supabase
        .from('quote_lines')
        .insert(quoteLines)

      if (linesError) throw linesError

      setMessage('Devis créé avec succès !')
      setTimeout(() => {
        router.push('/quotes')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError('Erreur: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header
        title="Nouveau Devis"
        actions={
          <Link href="/quotes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Client & Vehicle Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Client & Véhicule
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.email || 'Pas d\'email'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Véhicule</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un véhicule..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.filter(v => !selectedClientId || v.client_id === selectedClientId).map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.plate_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Add Line Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Ajouter une prestation
          </h2>
          <div className="grid sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <Label className="block text-xs font-medium text-gray-700 mb-1">Prestation *</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une prestation..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(s.price)} — {s.duration_min} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Gabarit</Label>
              <Select value={selectedBodyTypeId} onValueChange={setSelectedBodyTypeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optionnel..." />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map(bt => (
                    <SelectItem key={bt.id} value={bt.id}>{bt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Quantité</Label>
              <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} max={99} className="mt-1" />
            </div>
            <div className="sm:col-span-4">
              <Button onClick={addLine} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Plus className="w-4 h-4 mr-1.5" /> Ajouter la ligne
              </Button>
            </div>
          </div>
        </div>

        {/* Quote Lines Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {lines.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucune ligne ajoutée</div>
              <p className="text-xs text-gray-400 mt-1">Ajoutez des prestations ci-dessus pour composer votre devis</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <th className="text-left px-4 py-3 font-medium">Prestation</th>
                  <th className="text-center px-4 py-3 font-medium">Gabarit</th>
                  <th className="text-center px-4 py-3 font-medium">Qté</th>
                  <th className="text-right px-4 py-3 font-medium">Prix unitaire</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={`${line.service_id}-${index}`} className="border-b hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{line.service_name}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {line.body_type_label || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Input
                        type="number"
                        value={line.quantity}
                        onChange={e => updateLineQuantity(index, Number(e.target.value))}
                        min={1}
                        max={99}
                        className="w-16 text-center text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={line.unit_price}
                        onChange={e => updateLinePrice(index, Number(e.target.value))}
                        min={0}
                        className="w-24 text-right text-sm font-medium"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatCurrency(line.total_price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => removeLine(index)} className="text-red-600 hover:text-red-800">
                        <Minus className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t font-semibold">
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>Sous-total HT</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(subtotal)}</td>
                  <td></td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>TVA (20%)</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(tax)}</td>
                  <td></td>
                </tr>
                <tr className="bg-blue-50 border-t font-bold text-lg">
                  <td className="px-4 py-3 text-blue-900" colSpan={4}>Total TTC</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-900">{formatCurrency(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Notes & Valid Until */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Validité jusqu'au *</Label>
              <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="block text-xs font-medium text-gray-700 mb-1">Notes</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Notes internes ou conditions particulières..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4 border-t border-gray-200">
          <Link href="/quotes">
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button onClick={handleCreate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
            {loading ? 'Création...' : 'Créer le devis'}
          </Button>
        </div>
      </main>
    </>
  )
}