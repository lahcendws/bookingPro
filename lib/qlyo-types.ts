/**
 * Types pour les nouvelles fonctionnalités Qlyo
 * Correspond aux migrations 062_vehicles_bodytypes_pricing.sql
 */

// 1. Vehicle Body Types (10 gabarits standards Qlyo)
export interface VehicleBodyType {
  id: string
  code: string              // 'moto', 'citadine', 'berline', 'break', 'suv', 'monospace', 'utilitaire', 'camping_car', 'poids_lourd', 'autre'
  label: string             // Label affiché
  display_order: number
  created_at: string
}

// 2. Service Body Type Prices (Grille tarifaire par gabarit)
export interface ServiceBodyTypePrice {
  id: string
  service_id: string
  body_type_id: string
  price_ht: number
  duration_min?: number
  created_at: string
  updated_at: string
  // Relations
  body_type?: VehicleBodyType
  service?: {
    id: string
    name: string
    price: number
    duration_min: number
  }
}

// 3. Client Negotiated Prices (Tarifs négociés par client - Offre Pro)
export interface ClientNegotiatedPrice {
  id: string
  business_id: string
  client_id: string
  service_id: string
  body_type_id?: string
  price_ht: number
  valid_from: string
  valid_to?: string
  created_at: string
  updated_at: string
  // Relations
  client?: { id: string; name: string }
  service?: { id: string; name: string }
  body_type?: VehicleBodyType
}

// 4. Expenses (Charges pour rentabilité)
export interface Expense {
  id: string
  business_id: string
  category: 'fixed' | 'variable' | 'consumable'
  description: string
  amount_ht: number
  tax_rate: number
  tax_amount: number        // generated
  total_ttc: number         // generated
  expense_date: string
  is_recurring: boolean
  recurrence_rule?: string  // rrule string
  receipt_url?: string
  receipt_file_name?: string
  receipt_size_bytes?: number
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  // Relations
  receipts?: ExpenseReceipt[]
}

export interface ExpenseReceipt {
  id: string
  expense_id: string
  url: string
  file_name: string
  file_size_bytes: number
  mime_type: string
  width?: number
  height?: number
  exif_purged: boolean
  uploaded_at: string
}

// 5. Intervention Photos & Signature (inspection_checklists extension)
export interface InterventionPhoto {
  url: string
  width: number
  height: number
  size_bytes: number
  uploaded_at: string
  exif_purged: boolean
}

export interface InterventionSignature {
  data_url: string          // base64 PNG
  signed_at: string
  signed_by_client: boolean
}

export interface InterventionChecklist {
  id: string
  appointment_id: string
  vehicle_id: string
  photos_before: InterventionPhoto[]
  photos_after: InterventionPhoto[]
  client_signature_data_url?: string
  client_signed_at?: string
  intervention_pdf_url?: string
  share_token?: string
  share_expires_at?: string
  created_at: string
}

// 6. WhatsApp Templates (8 modèles éditables)
export interface WhatsAppTemplate {
  id: string
  business_id: string
  key: string               // 'booking_confirmation', 'reminder_day_before', etc.
  label: string             // 'Confirmation RDV', 'Rappel veille', etc.
  content_template: string  // Template avec variables {{client}}, {{date}}, etc.
  variables_json: string[]  // Liste variables disponibles
  is_active: boolean
  created_at: string
  updated_at: string
}

// Clés des 8 modèles WhatsApp standards Qlyo
export const WHATSAPP_TEMPLATE_KEYS = [
  'booking_confirmation',
  'reminder_day_before',
  'arriving_soon',
  'job_completed',
  'google_review',
  'quote_sent',
  'payment_reminder',
  'reactivation'
] as const

export type WhatsAppTemplateKey = typeof WHATSAPP_TEMPLATE_KEYS[number]

// Variables disponibles par template
export const WHATSAPP_TEMPLATE_VARIABLES: Record<WhatsAppTemplateKey, string[]> = {
  booking_confirmation: ['{{client}}', '{{date}}', '{{heure}}', '{{prestation}}', '{{adresse}}', '{{vehicule}}'],
  reminder_day_before: ['{{client}}', '{{date}}', '{{heure}}', '{{adresse}}', '{{prestation}}', '{{vehicule}}'],
  arriving_soon: ['{{client}}', '{{adresse}}', '{{vehicule}}'],
  job_completed: ['{{client}}', '{{lien_photos}}', '{{prestation}}', '{{vehicule}}'],
  google_review: ['{{client}}', '{{lien_google}}', '{{vehicule}}'],
  quote_sent: ['{{client}}', '{{lien_devis}}', '{{montant}}', '{{vehicule}}'],
  payment_reminder: ['{{client}}', '{{montant}}', '{{lien_paiement}}', '{{facture}}'],
  reactivation: ['{{client}}', '{{derniere_visite}}', '{{vehicule}}'],
}

// 7. Data Exports (Portabilité)
export interface DataExport {
  id: string
  business_id: string
  entity: string            // 'clients', 'vehicles', 'appointments', 'invoices', 'expenses', 'services', 'full_backup'
  format: 'csv' | 'json' | 'xlsx'
  file_url?: string
  file_size_bytes?: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requested_by: string
  error_message?: string
  created_at: string
  completed_at?: string
}

// 8. Rentabilité - Indicateurs clés
export interface ProfitabilityMetrics {
  // 6 indicateurs mensuels
  ca_facture_ht: number
  ca_encaisse_ttc: number
  charges_total: number
  benefice_net: number
  interventions_count: number
  impayes_count: number
  // Variations mensuelles
  ca_facture_ht_variation: number
  ca_encaisse_ttc_variation: number
  charges_variation: number
  benefice_net_variation: number
  interventions_variation: number
  impayes_variation: number
  // Seuil de rentabilité
  break_even_point: number      // En euros
  break_even_progress: number   // 0-100%
  break_even_alert: boolean
  forecast_30_days: number
  // Revenus par catégorie/gabarit
  revenue_by_category: Record<string, number>
  revenue_by_body_type: Record<string, number>
  // Top clients
  top_clients: Array<{
    client_id: string
    client_name: string
    total_revenue: number
    visits_count: number
  }>
  // Marge par prestation
  margin_by_service: Array<{
    service_id: string
    service_name: string
    revenue: number
    cost: number
    margin: number
    margin_percent: number
  }>
}

// 9. Helpers pour calculer le prix selon gabarit
export interface PricingResult {
  price_ht: number
  duration_min: number
  source: 'negotiated' | 'body_type' | 'base'
  negotiated_price?: ClientNegotiatedPrice
  body_type_price?: ServiceBodyTypePrice
}

/**
 * Fonction utilitaire pour obtenir le prix d'une prestation selon :
 * 1. Tarif négocié client (priorité max)
 * 2. Tarif par gabarit du véhicule
 * 3. Prix de base de la prestation
 */
export async function getEffectivePrice(
  supabase: any,
  businessId: string,
  serviceId: string,
  clientId?: string,
  bodyTypeId?: string
): Promise<PricingResult> {
  // 1. Vérifier tarif négocié client
  if (clientId) {
    const today = new Date().toISOString().split('T')[0]
    const { data: negotiated } = await supabase
      .from('client_negotiated_prices')
      .select('*')
      .eq('business_id', businessId)
      .eq('client_id', clientId)
      .eq('service_id', serviceId)
      .lte('valid_from', today)
      .or(`valid_to.is.null,valid_to.gte.${today}`)
      .order('valid_from', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (negotiated) {
      // Si tarif négocié spécifique au gabarit OU global (body_type_id null)
      if (!bodyTypeId || !negotiated.body_type_id || negotiated.body_type_id === bodyTypeId) {
        return {
          price_ht: negotiated.price_ht,
          duration_min: 0, // Durée prise sur le service de base
          source: 'negotiated',
          negotiated_price: negotiated,
        }
      }
    }
  }

  // 2. Tarif par gabarit
  if (bodyTypeId) {
    const { data: bodyTypePrice } = await supabase
      .from('service_body_type_prices')
      .select('*')
      .eq('service_id', serviceId)
      .eq('body_type_id', bodyTypeId)
      .maybeSingle()

    if (bodyTypePrice) {
      return {
        price_ht: bodyTypePrice.price_ht,
        duration_min: bodyTypePrice.duration_min ?? 0,
        source: 'body_type',
        body_type_price: bodyTypePrice,
      }
    }
  }

  // 3. Prix de base
  const { data: service } = await supabase
    .from('services')
    .select('price, duration_min')
    .eq('id', serviceId)
    .single()

  return {
    price_ht: service?.price ?? 0,
    duration_min: service?.duration_min ?? 60,
    source: 'base',
  }
}

/**
 * Format du code gabarit pour l'affichage
 */
export function formatBodyTypeCode(code: string): string {
  const labels: Record<string, string> = {
    moto: 'Moto',
    citadine: 'Citadine',
    berline: 'Berline',
    break: 'Break',
    suv: 'SUV / 4x4',
    monospace: 'Monospace',
    utilitaire: 'Utilitaire',
    camping_car: 'Camping-car',
    poids_lourd: 'Poids lourd',
    autre: 'Autre',
  }
  return labels[code] ?? code
}

/**
 * Liste des 10 gabarits standards dans l'ordre d'affichage
 */
export const STANDARD_BODY_TYPES: Array<{ code: string; label: string; order: number }> = [
  { code: 'moto', label: 'Moto', order: 1 },
  { code: 'citadine', label: 'Citadine', order: 2 },
  { code: 'berline', label: 'Berline', order: 3 },
  { code: 'break', label: 'Break', order: 4 },
  { code: 'suv', label: 'SUV / 4x4', order: 5 },
  { code: 'monospace', label: 'Monospace', order: 6 },
  { code: 'utilitaire', label: 'Utilitaire', order: 7 },
  { code: 'camping_car', label: 'Camping-car', order: 8 },
  { code: 'poids_lourd', label: 'Poids lourd', order: 9 },
  { code: 'autre', label: 'Autre', order: 10 },
]