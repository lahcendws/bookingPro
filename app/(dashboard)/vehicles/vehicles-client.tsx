'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Pencil, Car, Trash2, DollarSign, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { STANDARD_BODY_TYPES, VehicleBodyType, ServiceBodyTypePrice } from '@/lib/qlyo-types'

interface Vehicle {
  id: string
  license_plate?: string
  plate_number: string
  brand: string
  model: string
  year: number | null
  color: string | null
  vin: string | null
  notes: string | null
  body_type_id?: string
  size_class?: string
  client_id: string
  clients: { name: string; phone: string | null } | null
  body_type?: VehicleBodyType
}

interface Service {
  id: string
  name: string
  price: number
  duration_min: number
  category: string | null
  is_active: boolean
  body_type_prices?: ServiceBodyTypePrice[]
}

interface Client {
  id: string
  name: string
  phone: string | null
}

export function VehiclesClient({
  initialVehicles,
  clients,
  businessId,
  searchParamQuery
}: {
  initialVehicles: Vehicle[];
  clients: Client[];
  businessId: string;
  searchParamQuery?: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const t = useTranslations('vehicles')
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [services, setServices] = useState<Service[]>([])
  const [bodyTypes, setBodyTypes] = useState<VehicleBodyType[]>([])
  const [form, setForm] = useState<Partial<Vehicle> & { client_id?: string }>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(searchParamQuery || '')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'vehicles' | 'pricing'>('vehicles')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [pricingGrid, setPricingGrid] = useState<Record<string, Record<string, number>>>({})
  const [loadingPricing, setLoadingPricing] = useState(false)

  // Charger les gabarits
  useEffect(() => {
    async function loadBodyTypes() {
      const { data } = await supabase.from('vehicle_body_types').select('*').order('display_order')
      setBodyTypes((data as VehicleBodyType[]) || STANDARD_BODY_TYPES)
    }
    loadBodyTypes()
  }, [])

  // Charger les services actifs
  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase
        .from('services')
        .select('*, service_body_type_prices(*)')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name')
      setServices((data as Service[]) || [])
    }
    loadServices()
  }, [businessId])

  // Charger la grille tarifaire complète quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'pricing') {
      loadPricingGrid()
    }
  }, [activeTab])

  async function loadPricingGrid() {
    setLoadingPricing(true)
    const { data: prices } = await supabase
      .from('service_body_type_prices')
      .select('service_id, body_type_id, price_ht')
      .eq('service_id', services.map(s => s.id))

    const grid: Record<string, Record<string, number>> = {}
    prices?.forEach(p => {
      if (!grid[p.service_id]) grid[p.service_id] = {}
      grid[p.service_id][p.body_type_id] = p.price_ht
    })
    setPricingGrid(grid)
    setLoadingPricing(false)
  }

  const filteredVehicles = vehicles.filter(v =>
    v.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    (v.clients?.name && v.clients.name.toLowerCase().includes(search.toLowerCase()))
  )

  async function saveVehicle() {
    if (!form.plate_number || !form.brand || !form.model || (!editingId && !form.client_id)) return
    setSaving(true)

    const payload: any = {
      license_plate: form.plate_number?.toUpperCase().trim(),
      plate_number: form.plate_number?.toUpperCase().trim(), // Compatibilité
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : null,
      color: form.color || null,
      vin: form.vin ? form.vin.toUpperCase().trim() : null,
      body_type_id: form.body_type_id || null,
      size_class: form.size_class || 'berline', // Legacy
      business_id: businessId,
    }
    if (form.client_id) {
      payload.client_id = form.client_id
    }

    try {
      if (editingId) {
        const { data, error } = await (supabase.from('vehicles') as any).update(payload).eq('id', editingId).select('*, clients(name, phone), vehicle_body_types(*)').single()
        if (error) throw error
        if (data) setVehicles(vehicles.map(v => v.id === editingId ? data : v))
      } else {
        const { data, error } = await (supabase.from('vehicles') as any).insert(payload).select('*, clients(name, phone), vehicle_body_types(*)').single()
        if (error) throw error
        if (data) setVehicles([data, ...vehicles])
      }
      setForm({})
      setEditingId(null)
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Supprimer ce véhicule ?')) return
    await supabase.from('vehicles').delete().eq('id', id)
    setVehicles(vehicles.filter(v => v.id !== id))
    router.refresh()
  }

  async function savePricing(serviceId: string, bodyTypeId: string, price: number) {
    const { error } = await supabase
      .from('service_body_type_prices')
      .upsert({ service_id: serviceId, body_type_id: bodyTypeId, price_ht: price }, { onConflict: 'service_id,body_type_id' })
    if (error) {
      alert('Erreur: ' + error.message)
      // Recharger pour annuler la modif optimiste
      loadPricingGrid()
    }
  }

  function getBodyTypeLabel(code?: string) {
    const bt = bodyTypes.find(b => b.code === code)
    return bt?.label || code || '—'
  }

  function getBodyTypeBadge(code?: string) {
    const bt = bodyTypes.find(b => b.code === code)
    return bt ? <Badge variant="secondary" className="text-[10px] font-semibold uppercase">{bt.label}</Badge> : <Badge variant="outline" className="text-[10px]">{code || '—'}</Badge>
  }

  return (
    <>
      <Header
        title={t('title')}
        actions={
          <div className="flex gap-2">
            {activeTab === 'vehicles' && (
              <Button size="sm" onClick={() => { setForm({ size_class: 'berline', body_type_id: 'berline' }); setEditingId(null); setIsOpen(true) }}>
                <Plus className="w-4 h-4 mr-1" /> {t('addVehicle')}
              </Button>
            )}
            {activeTab === 'pricing' && (
              <Button size="sm" variant="outline" onClick={loadPricingGrid} disabled={loadingPricing}>
                <Settings className="w-4 h-4 mr-1" /> {t('refreshPricing')}
              </Button>
            )}
          </div>
        }
      />
      <main className="p-6 space-y-6">
        {/* Onglets */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'vehicles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Car className="w-4 h-4 mr-1 inline" /> {t('vehiclesTab')}
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <DollarSign className="w-4 h-4 mr-1 inline" /> {t('pricingTab')}
          </button>
        </div>

        {/* Recherche */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </div>

        {/* Contenu Véhicules */}
        {activeTab === 'vehicles' && (
          <>
            {/* Modal Nouveau/Modifier Véhicule */}
            {isOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
                  <h3 className="font-semibold text-gray-950">{editingId ? t('editVehicle') : t('addVehicle')}</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('clientLabel')}</Label>
                      <Select value={form.client_id || ''} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder={t('selectClient')} /></SelectTrigger>
                        <SelectContent>
                          {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone || t('noPhone')})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('licensePlate')}</Label>
                      <Input value={form.plate_number || ''} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))} placeholder="AB-123-CD" className="mt-1 uppercase" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('bodyType')}</Label>
                      <Select value={form.body_type_id || 'berline'} onValueChange={v => setForm(f => ({ ...f, body_type_id: v, size_class: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder={t('selectBodyType')} /></SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map(bt => <SelectItem key={bt.code} value={bt.code}>{bt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('brand')}</Label>
                      <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder={t('brandPlaceholder')} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('model')}</Label>
                      <Input value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder={t('modelPlaceholder')} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('year')}</Label>
                      <Input type="number" value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value ? Number(e.target.value) : null }))} placeholder={t('yearPlaceholder')} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">{t('color')}</Label>
                      <Input value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder={t('colorPlaceholder')} className="mt-1" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium text-gray-500">{t('vin')}</Label>
                      <Input value={form.vin || ''} onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))} placeholder={t('vinPlaceholder')} className="mt-1 uppercase font-mono" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-medium text-gray-500">{t('notes')}</Label>
                      <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder={t('notesPlaceholder')} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>{t('cancel')}</Button>
                    <Button onClick={saveVehicle} disabled={saving}>{saving ? t('saving') : t('save')}</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des véhicules */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {filteredVehicles.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <Car className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <div className="font-medium">{t('noVehicles')}</div>
                  <div className="text-sm mt-1">{t('noVehiclesDesc')}</div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                      <th className="text-left px-4 py-3 font-medium">{t('licensePlate')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('vehicleAndType')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('owner')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('color')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map(v => (
                      <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                        <td className="px-4 py-3 font-bold text-gray-900 font-mono uppercase">{v.plate_number || v.license_plate}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {v.brand} {v.model} <span className="text-gray-400 font-normal">({v.year || '—'})</span>
                          <div className="mt-0.5">{getBodyTypeBadge(v.body_type?.code || v.size_class)}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{v.clients?.name || t('unknown')}</td>
                        <td className="px-4 py-3 text-gray-500">{v.color || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => { setForm(v); setEditingId(v.id); setIsOpen(true) }}>
                              <Pencil className="w-3 h-3 mr-1" /> {t('edit')}
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2 text-red-500 border-red-200 hover:bg-red-50" onClick={() => deleteVehicle(v.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> {t('delete')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Contenu Grille Tarifaire */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t('pricingMatrixTitle')}</CardTitle>
                <div className="text-xs text-gray-500">{services.length} {t('services')} × {bodyTypes.length} {t('bodyTypes')}</div>
              </CardHeader>
              <CardContent>
                {loadingPricing ? (
                  <div className="text-center py-8 text-gray-500">{t('loading')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase sticky top-0 z-10">
                          <th className="text-left px-3 py-2 font-medium sticky left-0 z-20 bg-white border-r border-gray-100 w-48">{t('service')}</th>
                          {bodyTypes.map(bt => (
                            <th key={bt.code} className="text-center px-2 py-2 font-medium sticky top-0 bg-white border-r border-gray-100 w-24">{bt.label}</th>
                          ))}
                          <th className="text-center px-3 py-2 font-medium sticky right-0 bg-white w-24">{t('basePrice')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(svc => (
                          <tr key={svc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                            <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100 z-10">{svc.name}</td>
                            {bodyTypes.map(bt => {
                              const price = pricingGrid[svc.id]?.[bt.id]
                              const displayPrice = price ?? svc.price
                              const isCustom = price !== undefined && price !== svc.price
                              return (
                                <td key={bt.id} className="text-center px-2 py-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={displayPrice}
                                    onChange={e => {
                                      const newPrice = parseFloat(e.target.value) || 0
                                      // Optimistic update
                                      setPricingGrid(prev => ({ ...prev, [svc.id]: { ...prev[svc.id], [bt.id]: newPrice } }))
                                      savePricing(svc.id, bt.id, newPrice)
                                    }}
                                    className={`w-full text-center px-1 py-1 text-sm border rounded ${isCustom ? 'bg-blue-50 text-blue-700 font-medium' : 'bg-white text-gray-900'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                  />
                                </td>
                              )
                            })}
                            <td className="text-center px-3 py-2 text-gray-500 font-mono sticky right-0 bg-white z-10">{formatCurrency(svc.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  )
}