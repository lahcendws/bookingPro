export const MODULES = {
  bookings: {
    label: 'Réservations',
    description: 'Rendez-vous, planning et affectation employés',
  },
  crm: {
    label: 'Clients',
    description: 'Fiches clients, historique et notes',
  },
  pos: {
    label: 'Paiements',
    description: 'Factures, acomptes et liens de paiement',
  },
  inventory: {
    label: 'Produits',
    description: 'Stock, inventaire et alertes',
  },
  notifications: {
    label: 'Notifications',
    description: 'WhatsApp et rappels par email',
  },
} as const

export type ModuleKey = keyof typeof MODULES

export function isModuleEnabled(enabledModules: string[], module: ModuleKey): boolean {
  return enabledModules.includes(module)
}