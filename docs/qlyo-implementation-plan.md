# Plan d'implémentation Qlyo pour BookingPro

**Source de vérité :** `docs/qlyo-features-analysis.md`  
**Méthode :** ECC (Explore → Create → Check) + Tests Chrome DevTools  
**Objectif :** Implémenter TOUTES les fonctionnalités décrites, sans en oublier aucune

---

## 📋 Suivi global des fonctionnalités

| # | Module | Phase | Statut | Fichiers créés/modifiés | Tests |
|---|--------|-------|--------|------------------------|-------|
| 1 | **Véhicules & Gabarits** | 1 MVP | ⬜ À faire | | |
| 2 | **Tarifs par gabarit** | 1 MVP | ⬜ À faire | | |
| 3 | **Rentabilité avancée** | 2 Core | ⬜ À faire | | |
| 4 | **Photos Preuve & Signature** | 3 Terrain | ⬜ À faire | | |
| 5 | **WhatsApp Natif** | 6 Comm | ⬜ À faire | | |
| 6 | **Rôles Cloisonnés BDD** | 5 Équipe | ⬜ À faire | | |
| 7 | **Facturation FR Conforme** | 4 Compliance | ⬜ À faire | | |
| 8 | **Tarifs Négociés Client (Pro)** | 7 Pro | ⬜ À faire | | |
| 9 | **Export/Portabilité** | 8 Portabilité | ⬜ À faire | | |
| 10 | **17 Prestations pré-paramétrées** | 1 MVP | ⬜ À faire | | |
| 11 | **Calendrier intelligent** | 1 MVP | ⬜ À faire | | |

---

## 🎯 Phase 1 - MVP : Véhicules, Gabarits, Tarifs par gabarit

### 1.1 Nouvelles tables BDD (Migration)
- [ ] `vehicle_body_types` - 10 gabarits de référence
- [ ] `vehicles` - Étendre table existante (ajouter size_class, body_type_id, etc.)
- [ ] `service_body_type_prices` - Tarifs par gabarit par prestation
- [ ] `client_negotiated_prices` - Tarifs négociés par client (Pro)
- [ ] Indexes et RLS

### 1.2 Backend API
- [ ] CRUD Véhicules (API routes)
- [ ] CRUD Gabarits
- [ ] API tarifs par gabarit
- [ ] API tarifs négociés client

### 1.3 Frontend - Module Véhicules
- [ ] Page liste véhicules dans CRM (onglet Véhicules)
- [ ] Création/édition véhicule avec sélection gabarit
- [ ] Immatriculation unique par business (validation)
- [ ] Liaison client ↔ véhicules
- [ ] Pré-remplissage à la prise de RDV

### 1.4 Frontend - Tarifs par gabarit
- [ ] Interface grille tarifaire par prestation × gabarit
- [ ] 10 gabarits : Moto, Citadine, Berline, Break, SUV/4x4, Monospace, Utilitaire, Camping-car, Poids lourd, Autre
- [ ] Auto-remplissage prix selon véhicule choisi au RDV

### 1.5 17 Prestations pré-paramétrées
- [ ] Seed data à l'onboarding
- [ ] Céramique 9H (3h), Décontamination+Lustrage (3h), Sièges injection/extraction (2h), Forfait flotte ×4 (3h), Polissage 1 passe, Lavage complet int./ext., Rénovation optiques, + 10 autres

---

## 🎯 Phase 2 - Core : Rentabilité Réelle

### 2.1 Dashboard étendu
- [ ] **CA Facturé HT** (séparé du CA Encaissé)
- [ ] **CA Encaissé TTC**
- [ ] **Charges** (fixes + ponctuelles avec justificatifs photo)
- [ ] **Bénéfice Net** temps réel
- [ ] **Interventions** (volume)
- [ ] **Impayés** (alertes)

### 2.2 Analyses avancées
- [ ] **Seuil de rentabilité** avec jauge visuelle + alertes + prévisionnel 30j
- [ ] **Graphiques 12 mois glissants** (Recharts/chart.js)
- [ ] **Revenus par catégorie prestation** ET **par gabarit**
- [ ] **Top clients** + valeur client 12 mois
- [ ] **Marge brute prévisionnelle par prestation** (coût consommable → marge)

### 2.3 Modèle de données
- [ ] Table `expenses` (charges fixes/ponctuelles)
- [ ] Table `expense_receipts` (photos justificatifs)
- [ ] Champs `cost_price` sur services (coût consommable)
- [ ] Vues matérialisées ou fonctions SQL pour calculs

---

## 🎯 Phase 3 - Terrain : Photos Preuve & Signature

### 3.1 Upload & Compression photos
- [ ] Upload multiple (drag & drop + camera mobile)
- [ ] Compression auto WebP 1600px < 400Ko (canvas API)
- [ ] Purge EXIF (confidentialité)
- [ ] 3 envois simultanés (Promise.all)
- [ ] Stockage Supabase Storage avec bucket privé

### 3.2 Comparateur avant/après
- [ ] Slider (poignée glissante) pour comparer 2 images
- [ ] Composant réutilisable `BeforeAfterSlider`

### 3.3 Signature tactile
- [ ] Canvas signature au doigt/stylet
- [ ] Export PNG/DataURL
- [ ] Intégration dans bon d'intervention PDF

### 3.4 Bon d'intervention PDF
- [ ] Génération PDF côté client (jsPDF/pdf-lib)
- [ ] Photos avant/après + signature
- [ ] Lien de partage photos (URL signée durée limitée)
- [ ] Téléchargement/partage

### 3.5 Fiche intervention terrain
- [ ] Statuts : En cours / Confirmé / À venir / Terminé (1 clic)
- [ ] Durée pré-remplie depuis prestation
- [ ] Sync Planning ↔ Interventions

---

## 🎯 Phase 4 - Compliance : Facturation FR Conforme

### 4.1 Numérotation légale
- [ ] Numéro attribué **à l'émission** (pas à la création)
- [ ] Séquence sans trous (brouillon abandonné = pas de trou)
- [ ] Format : `FAC-YYYY-NNNNN` / `AV-YYYY-NNNNN`

### 4.2 Facture verrouillée + Avoir
- [ ] Facture `issued` = immuable (montants, n°, client, date)
- [ ] Correction **uniquement par avoir** (credit_note)
- [ ] Avoir référence facture d'origine

### 4.3 Mentions légales figées
- [ ] Figées à l'émission (conformes même si entreprise déménage)
- [ ] TVA détaillée par taux
- [ ] Mention "article 293 B du CGI" si franchise TVA
- [ ] Paiements partiels → solde recalculé auto

### 4.4 Livre des recettes & Exports
- [ ] Export CSV livre des recettes (format comptable)
- [ ] Export CSV par entité (factures, clients, véhicules, etc.)
- [ ] Archivage réversible (ne modifie pas les chiffres)

---

## 🎯 Phase 5 - Équipe : Rôles Cloisonnés BDD

### 5.1 3 Rôles stricts
| Rôle | Accès Planning | Accès Clients | Accès Devis/Factures | Accès Dépenses | Dashboard |
|------|----------------|---------------|---------------------|----------------|-----------|
| Owner | ✅ Tout | ✅ Tout | ✅ Tout | ✅ Tout | ✅ Tout |
| Admin | ✅ Tout | ✅ Tout | ✅ Tout | ✅ Tout | ✅ Tout |
| Technicien | ✅ Ses créneaux | ✅ Lecture seule | ❌ | ❌ | ❌ |

### 5.2 RLS (Row Level Security) BDD
- [ ] Politiques strictes par rôle sur CHAQUE table
- [ ] Technicien = liste vide sur factures/devis/dépenses/dashboard même via API
- [ ] Fonction `current_user_role()` pour RLS

### 5.3 Invitations & Quotas
- [ ] Invitations par lien token (JWT/signé)
- [ ] Quota sièges appliqué côté serveur
- [ ] Page gestion équipe avec rôles visuels

---

## 🎯 Phase 6 - Communication : WhatsApp Natif

### 6.1 8 Modèles éditables
| Clé | Libellé | Variables |
|-----|---------|-----------|
| `booking_confirmation` | Confirmation RDV | {{client}}, {{date}}, {{heure}}, {{prestation}} |
| `reminder_day_before` | Rappel veille | {{client}}, {{date}}, {{heure}}, {{adresse}} |
| `arriving_soon` | "J'arrive dans 15min" | {{client}}, {{adresse}} |
| `job_completed` | Prestation terminée + photos | {{client}}, {{lien_photos}} |
| `google_review` | Demande avis Google | {{client}}, {{lien_google}} |
| `quote_sent` | Envoi devis | {{client}}, {{lien_devis}} |
| `payment_reminder` | Relance impayé | {{client}}, {{montant}}, {{lien_paiement}} |
| `reactivation` | Réactivation client inactif | {{client}}, {{derniere_visite}} |

### 6.2 Mécanisme "Ouvre WhatsApp"
- [ ] `window.open('whatsapp://send?text=' + encodeURIComponent(message))`
- [ ] Fallback Web WhatsApp si app absente
- [ ] Pas d'API payante, pas de coût/message

### 6.3 Repli multi-canal
- [ ] SMS (via Twilio/autre si configuré)
- [ ] Email (templates existants)
- [ ] Presse-papiers (copier message)

### 6.4 Envoi groupé rappels veille
- [ ] Bouton "Envoyer tous les rappels de demain"
- [ ] Sélection multiple + envoi séquentiel

---

## 🎯 Phase 7 - Pro : Tarifs Négociés & Facturation Groupée

### 7.1 Tarifs négociés par client
- [ ] Table `client_negotiated_prices` (prime sur grille gabarit)
- [ ] Interface gestion tarifs client (Admin/Pro)
- [ ] Priorité : tarif négocié > tarif gabarit > tarif base

### 7.2 Facturation groupée multi-interventions
- [ ] Sélection plusieurs interventions → 1 facture
- [ ] Regroupement par client
- [ ] Ligne récapitulative par intervention

---

## 🎯 Phase 8 - Portabilité : Export & Données

### 8.1 Export CSV par entité
- [ ] Clients, Véhicules, Interventions, Factures, Dépenses, Services
- [ ] Format standardisé (UTF-8, ; séparateur FR)
- [ ] Bouton export sur chaque page liste

### 8.2 Sauvegarde complète JSON
- [ ] Export tout le business en un fichier JSON
- [ ] Structure documentée pour réimport

### 8.3 Export post-abonnement (Lecture seule)
- [ ] Middleware : si plan expiré → écriture bloquée, lecture OK
- [ ] Export possible même en lecture seule
- [ ] Alertes stockage : 80% (warning), 110% (blocage upload)

---

## 🔧 Tests & Validation (Chrome DevTools)

### Pour CHAQUE fonctionnalité :
- [ ] Parcours nominal (happy path)
- [ ] Cas limites (champs vides, conflits, permissions)
- [ ] Gestion erreurs (réseau, validation, permissions)
- [ ] Responsive mobile (44px cibles tactiles)
- [ ] Console propre (pas d'erreurs JS)
- [ ] Réseau : requêtes optimisées, pas de N+1

### Suite de tests automatisés
- [ ] Tests unitaires (Vitest) - logique métier critique
- [ ] Tests E2E (Playwright) - parcours utilisateurs clés
- [ ] Tests RLS (vérifier cloisonnement technicien)

---

## 📝 Notes d'implémentation

### Stack existant à réutiliser
- **Next.js 16.3** (App Router, Turbopack)
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **React 19** + Radix UI + Tailwind CSS
- **next-intl** (i18n FR/EN/ES/NL/IT/PT)
- **@dnd-kit** (drag & drop planning)
- **date-fns** (dates/timezones)
- **xlsx** (exports Excel/CSV)
- **resend** (emails)
- **Vitest** + **Playwright** (tests)

### Conventions à respecter
- Server Components par défaut, Client Components seulement si nécessaire
- RLS sur toutes les tables (multi-tenant strict)
- Types TypeScript stricts (pas de `any`)
- Composants UI dans `/components/ui/`
- Utils dans `/lib/utils.ts`
- Messages i18n dans `/messages/{locale}.json`

---

## 🚀 Prochaine action immédiate

**Démarrer Phase 1.1** : Créer la migration BDD pour véhicules, gabarits et tarifs par gabarit.

---
*Plan créé le 2026-11-13. Mis à jour à chaque étape terminée.*