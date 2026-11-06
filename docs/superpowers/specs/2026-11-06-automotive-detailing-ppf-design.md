# Spécification Technique — Spécialisation BookingPro : Automotive Styling, PPF & Detailing

## 1. Vue d'ensemble & Objectif
Transformer **BookingPro** en une solution verticale de pointe dédiée aux ateliers de **Covering, PPF (Paint Protection Film), Detailing et Vitrage Automobile**. 
La valeur ajoutée majeure repose sur la **rentabilité par chantier** et la protection juridique de l'atelier : lier chaque intervention au véhicule, aux consommables/rouleaux de films utilisés, aux photos d'état des lieux avant/après, aux certificats de garantie, et au suivi de l'avancement client.

---

## 2. Modules et Fonctionnalités Clés

### A. Fiche Véhicule & État des Lieux Numérique (Protection Juridique)
- **Fiche Véhicule Complète** : Immatriculation, marque, modèle, année, couleur, VIN, historique des poses.
- **État des Lieux Avant/Après & Signature** : Photos horodatées et géolocalisées des éventuels impacts/rayures préexistantes, avec **signature numérique du client** pour protéger l'atelier en cas de litige.

### B. Devis Rapide & Personnalisé par Véhicule
- **Devis par Gabarit & Prestation** : Adaptation selon la catégorie (Citadine, Berline, SUV, Utilitaire), la surface (ex: capot, face avant complète, full PPF) et les options.
- **Acomptes & Paiements en Ligne** : Sécurisation immédiate des créneaux de pose par acompte ou paiement par lien.

### C. Gestion des Rouleaux (Mètres Linéaires) & Rentabilité par Chantier
- **Suivi des Rouleaux PPF / Films** : Métrage initial et métrage restant en temps réel. Déduction automatique du métrage consommé à chaque intervention.
- **Rentabilité par Chantier (Formule Minimale)** : 
  $$\text{Marge Brute} = \text{Prix de Vente} - \text{Coût Matière (linéaire consommé)} - \text{Temps Passé / Main-d'œuvre}$$

### D. Planning Avancé par Poste & Durée d'Intervention
- **Gestion par Baie / Poste de Travail** : Différenciation des durées (un covering ou un PPF mobilise un poste plusieurs jours, un detailing ou un teintage quelques heures).

### E. Certificats de Garantie & Suivi Client (Portail & WhatsApp)
- **Certificat PDF de Garantie** : Génération d'un PDF officiel incluant QR code, numéro de lot du film, produit posé et durée de garantie (essentiel pour le PPF et la céramique).
- **Portail de Suivi Client** : Statut d'avancement du chantier en direct et photos de l'intervention pour rassurer le client final.
- **Rappels d’Entretien Automatiques (WhatsApp)** : Relances programmées pour l'entretien de la céramique ou le contrôle annuel du PPF (génération de CA récurrent).
- **Pack « Vitrine »** : Page de réservation publique couplée à une galerie avant/après partageable sur Instagram ou Google.

---

## 3. Modèle de Données (Supabase / PostgreSQL)

1. **`vehicles`**
   - `id` (uuid, PK), `client_id` (uuid, FK), `business_id` (uuid, FK)
   - `plate_number`, `brand`, `model`, `year`, `color`, `vin`, `notes`

2. **`inventory_rolls` (Rouleaux & Films)**
   - `id` (uuid, PK), `business_id` (uuid)
   - `name` (text — ex: XPEL Ultimate Plus 60")
   - `total_length_m` (numeric), `remaining_length_m` (numeric), `cost_per_m` (numeric), `min_threshold_m` (numeric)

3. **`inspection_checklists` (État des lieux)**
   - `id` (uuid, PK), `appointment_id` (uuid, FK), `vehicle_id` (uuid, FK)
   - `photos_before` (jsonb), `photos_after` (jsonb), `client_signature_url` (text), `created_at`

4. **`warranties` (Certificats de garantie)**
   - `id` (uuid, PK), `business_id` (uuid), `client_id` (uuid), `vehicle_id` (uuid)
   - `roll_id` (uuid, FK, nullable), `product_name` (text), `lot_number` (text), `duration_months` (int), `qr_code_token` (text), `pdf_url` (text)

---

## 4. Plan d'Implémentation & Validation
1. **Migration SQL** : Création des tables `vehicles`, `inventory_rolls`, `inspection_checklists`, `warranties`.
2. **Interface Atelier & État des Lieux** : Intégration de la prise de photos et de la signature client tactile/numérique.
3. **Métrage & Calcul de Marge** : Logique de déduction des rouleaux et affichage de la rentabilité par chantier.
4. **Génération PDF & WhatsApp** : Certificats de garantie avec QR code et automatisation des rappels d'entretien.
