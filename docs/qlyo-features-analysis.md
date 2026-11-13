# Analyse des Fonctionnalités Qlyo - Pour Implémentation Future

**Source :** https://www.qlyo.fr/#fonctionnalites  
**Date d'extraction :** 2026-11-13  
**Outil :** Firecrawl MCP

---

## Positionnement Produit

> **QLYO réunit votre planning, vos clients, vos véhicules, vos devis et vos factures dans un seul outil pensé pour le terrain. Et surtout : il calcule ce que chaque voiture vous rapporte réellement — ce qu'aucun agenda ne fait.**

**Cible :** Professionnels du nettoyage et detailing automobile (indépendants, équipes 2-5 techniciens, centres de lavage)
**Philosophie :** Mobile-first, pensée pour ceux qui travaillent debout, dehors, mains mouillées

---

## 1. PLANNING & INTERVENTIONS (Le quotidien terrain)

### 1.1 Calendrier Intelligent
- **Vues** : Mois, Semaine, Jour, Agenda
- **Glisser-déposer** et redimensionnement avec **retour arrière automatique** si le serveur refuse
- **Détection de conflit par technicien** (pas seulement par créneau)
- **Proposition du prochain créneau libre** intelligent
- **Cibles tactiles ≥ 44px** (accessibilité mobile)
- **Export .ics RFC 5545** vers agenda personnel
- **Synchronisation garantie par la base de données**

### 1.2 Fiches Intervention Terrain
- **Statut modifiable en un appui** (En cours / Confirmé / À venir / Terminé)
- **Durée pré-remplie** depuis la prestation choisie
- **Synchronisation garantie** Planning ↔ Interventions
- **Export .ics** conforme

### 1.3 Exemples de prestations pré-paramétrées (17 au total)
- Céramique 9H (3h)
- Décontamination + Lustrage (3h)
- Sièges — Injection/Extraction (2h)
- Forfait flotte × 4 véhicules (3h)
- Polissage 1 passe
- Lavage complet int./ext.
- Rénovation optiques
- Et 10 autres...

---

## 2. DEVIS & FACTURES CONFORMES (Comptabilité française)

### 2.1 Numérotation Légale
- **Attribuée à l'émission** (jamais à la création) → aucun trou dans la séquence
- **Facture émise = verrouillée** : montants, numéro, client, date immodifiables
- **Correction par avoir** obligatoire (conformité française)

### 2.2 Conformité Détaillée
- **Mentions légales figées à l'émission** (conformes même si entreprise déménage)
- **TVA détaillée par taux**
- **Mention "article 293 B du CGI"** si non assujetti
- **Paiements partiels** avec solde et statut recalculés en base
- **Devis accepté → Intervention + Facture sans ressaisie**
- **Facturation groupée multi-interventions** (offre Pro)
- **Export CSV livre des recettes**
- **Archivage réversible** (ne modifie aucun chiffre)

---

## 3. FICHES CLIENTS & VÉHICULES

### 3.1 Clients
- **Particuliers & Professionnels** (SIRET, TVA)
- **Marquage "flotte"** pour comptes pros
- **Historique complet** passages + documents
- **Recherche instantanée**, archivage réversible

### 3.2 Véhicules
- **Rattachés au client**, pré-remplis à la prise de RDV
- **Immatriculation normalisée** et **unique par entreprise** (anti-doublon)
- **10 gabarits** : Moto → Poids lourd (citadine, berline, break, SUV/4x4, monospace, utilitaire, camping-car, etc.)
- **Tarif auto-rempli** selon gabarit choisi

---

## 4. PHOTOS AVANT/APRÈS & SIGNATURE (Preuve & Relation Client)

### 4.1 Gestion Photos
- **Compression 1600px WebP < 400Ko** automatique
- **Purge données EXIF** (confidentialité)
- **3 envois simultanés** même en 4G moyenne
- **Comparateur à poignée glissante** (slider avant/après)

### 4.2 Signature & Documents
- **Signature client au doigt** sur téléphone
- **Bon d'intervention PDF** avec photos + signature
- **Lien de partage photos** à envoyer au client
- **Preuve horodatée** en cas de contestation

### 4.3 Relances WhatsApp (8 modèles éditables)
| Modèle | Usage |
|--------|-------|
| Confirmation RDV | À la prise de rendez-vous |
| Rappel la veille | Automatisé groupe |
| "J'arrive dans 15min" | Sur le terrain |
| Prestation terminée + lien photos | Livraison |
| Demande avis Google | Post-intervention |
| Envoi devis | Commercial |
| Relance impayé | Recouvrement |
| Réactivation client inactif | Fidélisation |

- **Coût variable nul** : QLYO ouvre WhatsApp, n'envoie rien lui-même
- **Repli** : SMS, Email, Presse-papiers

---

## 5. RENTABILITÉ RÉELLE (Le chiffre que personne d'autre ne donne)

### 5.1 6 Indicateurs Clés avec Variation Mensuelle
1. **CA Facturé HT** (jamais mélangé avec encaissé)
2. **CA Encaissé TTC**
3. **Charges** (fixes + ponctuelles)
4. **Bénéfice Net** (temps réel)
5. **Interventions** (volume)
6. **Impayés** (alerte)

### 5.2 Analyses Avancées
- **Seuil de rentabilité** avec jauge, alertes, prévisionnel 30 jours
- **Graphiques 12 mois glissants**
- **Revenus par catégorie prestation** ET **par gabarit**
- **Dépenses** : justificatifs photographiés et compressés
- **Top clients** + valeur client sur 12 mois
- **Marge brute prévisionnelle par prestation** (coût consommable → marge)

### 5.3 Tarification par Gabarit
- **10 gabarits** avec tarifs propres
- **Tarifs négociés par client** (offre Pro) → priment sur la grille
- **Utile pour comptes flotte**

---

## 6. ÉQUIPE, SÉCURITÉ & PORTABILITÉ

### 6.1 Rôles Cloisonnés (3 niveaux)
| Rôle | Accès |
|------|-------|
| **Propriétaire** | Tout |
| **Administrateur** | Planning, Clients, Devis, Factures, Dashboard |
| **Technicien** | **Uniquement** : Planning (ses créneaux), Interventions, Photos, Clients (lecture) |

**⚠️ Cloisonnement en BASE de données** (pas seulement UI) : même via API, technicien reçoit liste vide pour factures/devis/dépenses/dashboard

### 6.2 Invitations & Quotas
- **Invitations par lien à jeton** (token)
- **Quota sièges appliqué côté serveur** (pas contournable)

### 6.3 Sécurité & Données
- **HTTPS forcé**, en-têtes de sécurité
- **Aucun traceur publicitaire**
- **Fichiers privés** accessibles par lien signé à durée limitée
- **Chaque entreprise = données cloisonnées** (multi-tenant strict)

### 6.4 Export & Portabilité (Garantis à vie)
- **Export CSV** par entité (clients, véhicules, interventions, factures, dépenses...)
- **Sauvegarde complète JSON**
- **Export possible même APRÈS expiration abonnement** (lecture seule)
- **Alertes stockage** : prévenu à 80%, bloqué à 110% (marge sécurité)

---

## 7. OFFRES TARIFAIRES

### Starter — 29,99 € HT/mois (35,99 € TTC)
- **3 sièges** inclus
- **10 Go** stockage photos/documents
- Planning, interventions, photos avant/après
- Devis/factures conformes, avoirs, livre des recettes
- Clients, véhicules, grille tarifaire par gabarit
- Tableau de bord, seuil de rentabilité
- Modèles WhatsApp, relances
- Gestion équipe, personnalisation PDF
- Exports CSV, sauvegarde complète
- **Tarifs négociés par client** ✓
- **Facturation groupée** ✓
- Support prioritaire ✓

### Pro — 49,99 € HT/mois (59,99 € TTC)
- **10 sièges** inclus, extensibles à **7,99 € HT/siège**
- **50 Go** stockage
- Tout Starter +
- **Tarifs négociés par client** (priment sur grille)
- **Facturation groupée** multi-interventions
- Support prioritaire

### Conditions Communes
- **14 jours essai gratuit** sans carte bancaire
- **Mensuel sans engagement**
- **Fin essai → Lecture seule** (pas de suppression, export possible)
- **Rien n'est pris en otage**

---

## 8. SPÉCIFICITÉS TECHNIQUES MOBILE-FIRST

- **PWA** : fonctionne dans navigateur, rien à installer
- **169 Ko** au premier écran (ultra-léger)
- **Cibles tactiles 44px+** (accessibilité)
- **Photos compressées** avant envoi (ménage forfait mobile)
- **PDF générés dans navigateur** (pas serveur intermédiaire)
- **Mises à jour continues** (pas de version à gérer)
- **Fait par et pour des detailers** (connaissance métier)

---

## 9. PARCOURS UTILISATEUR TYPE (1 min démo)

1. **Création compte** : Email + mot de passe → email confirmation → démarrage
2. **5 étapes guidées** : Activité → TVA/numérotation → Logo → Prestations (tarifs par gabarit) → Facturation électronique
3. **Dashboard** : CA, encaissements, charges, **bénéfice net temps réel**
4. **Clients/Véhicules** : Historique complet
5. **Planning** : Glisser-déposer, rappels WhatsApp groupés veille
6. **Terrain** : Photos avant/après, signature doigt, bon intervention PDF
7. **Facturation** : Devis → Facture auto, facturation électronique auto

---

## 10. FONCTIONNALITÉS DIFFÉRENCIANTES (vs Agenda/CRM classiques)

| Fonctionnalité | Qlyo | Agenda/CRM Standard |
|----------------|------|---------------------|
| Rentabilité par véhicule | ✅ Calculée auto | ❌ |
| Tarifs par gabarit | ✅ 10 gabarits | ❌ |
| Facture verrouillée + avoir | ✅ Conforme loi | ⚠️ Rare |
| Photos compressées WebP | ✅ Auto | ❌ |
| Signature téléphone + PDF | ✅ | ❌ |
| WhatsApp sans coût/message | ✅ Ouvre app | ❌ |
| Cloisonnement en BDD | ✅ API aussi | ❌ UI seulement |
| Export post-résiliation | ✅ Garanti | ❌ Souvent bloqué |
| Numérotation à l'émission | ✅ Sans trous | ⚠️ Souvent à la création |

---

## 11. PISTES D'IMPLÉMENTATION POUR BOOKINGPRO

### Modules à ajouter/étendre

#### 1. **Module Véhicules & Gabarits** (Nouveau)
- Entité `vehicles` rattachée à `clients`
- 10 gabarits prédéfinis avec mapping tarifaire
- Unicité immatriculation par business

#### 2. **Module Rentabilité Avancée** (Étendre `dashboard`)
- Séparation CA Facturé / CA Encaissé
- Seuil de rentabilité avec jauge
- Marge par prestation (coût consommable)
- Revenus par catégorie + par gabarit
- Prévisionnel 30 jours

#### 3. **Module Photos Preuve** (Nouveau)
- Upload multiple → compression WebP 1600px
- Purge EXIF
- Comparateur slider avant/après
- Signature tactile → PDF bon intervention
- Lien partage client

#### 4. **Module WhatsApp Natif** (Étendre `notifications`)
- 8 modèles éditables avec variables
- Envoi groupé rappels veille
- "Ouvre WhatsApp" (pas API payante)
- Fallback SMS/Email/Presse-papiers

#### 5. **Module Rôles Cloisonnés BDD** (Renforcer `permissions`)
- 3 rôles : Owner / Admin / Technician
- RLS (Row Level Security) strict par rôle
- Technicien = 0 accès factures/devis/charges/dashboard
- Invitations par token + quota sièges serveur

#### 6. **Module Facturation Conforme FR** (Étendre `invoices`)
- Numérotation à l'émission (pas création)
- Facture verrouillée + avoir obligatoire
- Mentions légales figées à l'émission
- TVA par taux + article 293B CGI
- Livre des recettes CSV export

#### 7. **Module Tarifs Négociés Client** (Offre Pro)
- Grille tarifaire par gabarit (base)
- Surcharge tarifs négociés par client (prime sur grille)
- Facturation groupée multi-interventions

#### 8. **Module Export/Portabilité** (Nouveau)
- Export CSV par entité
- Backup complet JSON
- Export possible en lecture seule post-abonnement
- Alertes stockage (80%/110%)

---

## 12. PRIORITÉS SUGGÉRÉES (MVP → Complet)

| Phase | Modules | Effort | Valeur Métier |
|-------|---------|--------|---------------|
| **1. MVP** | Véhicules/Gabarits + Tarifs par gabarit | 🟡 Moyen | Différenciateur #1 |
| **2. Core** | Rentabilité (CA facturé/encaissé, seuil) | 🟡 Moyen | Valeur unique Qlyo |
| **3. Terrain** | Photos + Signature + PDF intervention | 🟢 Faible | Usage quotidien mobile |
| **4. Compliance** | Facturation FR conforme (numérotation, avoirs) | 🟡 Moyen | Obligation légale |
| **5. Équipe** | Rôles cloisonnés BDD + invitations token | 🟢 Faible | Sécurité pro |
| **6. Communication** | WhatsApp 8 modèles + fallback | 🟢 Faible | Automatisation relances |
| **7. Pro** | Tarifs négociés + facturation groupée | 🟡 Moyen | Comptes flotte |
| **8. Portabilité** | Export CSV/JSON + lecture seule post-sub | 🟢 Faible | Confiance client |

---

## 13. NOTES TECHNIQUES IMPLEMENTATION

### Base de Données (Nouvelles tables)
```sql
-- Véhicules
vehicles: id, business_id, client_id, license_plate, brand, model, 
          body_type (gabarit), color, notes, created_at

-- Gabarits (référence)
vehicle_body_types: id, code, label, display_order

-- Tarifs par gabarit
service_body_type_prices: service_id, body_type_id, price_ht

-- Tarifs négociés client (Pro)
client_negotiated_prices: client_id, service_id, price_ht, valid_from, valid_to

-- Photos intervention
intervention_photos: id, appointment_id, kind (before/after), 
                     url_webp, width, height, size_bytes, 
                     exif_purged, uploaded_at

-- Signatures
intervention_signatures: id, appointment_id, signature_data_url, 
                         signed_by_client, signed_at, pdf_url

-- WhatsApp templates
whatsapp_templates: id, business_id, key, label, content_template, 
                    variables_json, is_active

-- Export logs
data_exports: id, business_id, entity, format, file_url, 
              requested_by, status, created_at
```

### Permissions RLS (Exemple Technicien)
```sql
-- Technicien ne voit que SES rendez-vous
CREATE POLICY "tech_appointments" ON appointments
  FOR SELECT TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ));

-- Technicien = 0 accès factures
CREATE POLICY "tech_no_invoices" ON invoices
  FOR SELECT TO authenticated
  USING (false); -- Bloqué au niveau BDD
```

---

## 14. LIENS UTILES QLYO (Pour référence continue)

| Page | URL |
|------|-----|
| Tarifs prestations detailing | https://www.qlyo.fr/tarifs-prestations-detailing |
| Logiciel detailer indépendant | https://www.qlyo.fr/logiciel-detailing |
| Logiciel centre lavage | https://www.qlyo.fr/logiciel-centre-lavage-auto |
| Logiciel flottes | https://www.qlyo.fr/logiciel-preparation-esthetique-automobile |
| Facturation électronique | https://www.qlyo.fr/facturation-electronique-detailing |
| Ouvrir activité detailing | https://www.qlyo.fr/ouvrir-activite-detailing |
| Démo interactive | https://app.qlyo.fr/demo?source=vitrine |
| Contact | contact@vvsmedia.fr |

---

## 15. MÉTRIQUES CLÉS QLYO (Pour benchmarking)

- **17 prestations** pré-paramétrées à l'inscription
- **10 gabarits** véhicules
- **8 modèles** WhatsApp
- **3 rôles** cloisonnés
- **6 indicateurs** rentabilité
- **29,99 € HT** Starter / **49,99 € HT** Pro
- **14 jours** essai sans CB
- **169 Ko** premier écran
- **3 sièges** Starter / **10 sièges** Pro
- **10 Go** / **50 Go** stockage
- **7,99 € HT** siège supplémentaire Pro

---

*Document généré pour guider l'implémentation progressive des fonctionnalités Qlyo dans BookingPro. Chaque module peut être développé indépendamment selon la roadmap définie.*