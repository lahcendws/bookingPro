# Spécification Technique : Règles Métier Postes et Réservations (Phase 3)

**Date :** 2026-11-09  
**Branche :** `feat/phase3-workstations-audit`  
**Objectif :** Formaliser et implémenter rigoureusement les contraintes métier pour les postes de travail, les rendez-vous multi-jours, le calcul des horaires ouvrés, la gestion des statuts, et la retenue temporaire d'acompte (15 minutes).

---

## 1. Modèle de Données et Contraintes Dures (Postes)

### Contrainte de non-chevauchement (Overlap Prevention)
Un poste de travail (`workstation_id`) ne peut pas avoir deux rendez-vous simultanés dont les périodes `[starts_at, ends_at]` se chevauchent, quel que soit le moment (y compris la nuit, le véhicule restant garé/immobilisé sur le poste du dépôt à la livraison).

- **Implémentation PostgreSQL :** Utilisation de l'extension `btree_gist` pour créer une contrainte d'exclusion (`EXCLUDE USING gist`) sur la table `appointments` :
  ```sql
  create extension if not exists btree_gist;
  
  alter table public.appointments
    add constraint prevent_workstation_overlap
    exclude using gist (
      workstation_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    );
  ```
  *(Note : les rendez-vous avec `workstation_id IS NULL` ou `status = 'annule'` sont exclus de cette règle).*

---

## 2. Calcul des Horaires Ouvrés & Durée de Prestation

- **Heures ouvrées de l'atelier :** Configurées dans `businesses` (ex: `opening_time: '09:00'`, `closing_time: '18:00'`).
- **Calcul de la fin du rendez-vous (`ends_at`) :**
  - Si une prestation dure $N$ heures (ex: 20h de PPF) et que l'atelier est ouvert de 9h à 18h (9 heures par jour) :
    - Jour 1 : 9h de travail (fin de journée à 18h).
    - Jour 2 : 9h de travail (fin de journée à 18h).
    - Jour 3 : 2h restantes (fin à 11h le 3ème jour).
  - Le poste est occupé en continu 24h/24 entre `starts_at` (début jour 1) et `ends_at` (fin jour 3), empêchant tout autre véhicule d'occuper ce poste entre ces des dates.

---

## 3. Gestion des Statuts et Retenue Temporaire (15 minutes)

### Statuts des rendez-vous
Les valeurs admises pour `status` dans `appointments` sont :
1. `demande` (Réservation publique en attente de validation)
2. `en_attente_acompte` (En attente du paiement Stripe de l'acompte de 30%)
3. `confirme` (Acompte payé ou validé par le pro)
4. `en_cours` (Véhicule en cours d'intervention sur le poste)
5. `termine` (Prestation achevée, véhicule restitué)
6. `annule` (Rendez-vous annulé)
7. `absent` (Client non présenté)

### Retenue Temporaire (Hold / TTL)
- Lorsqu'un client réserve en ligne avec acompte, le rendez-vous est créé avec `status = 'en_attente_acompte'` et un champ `expires_at = now() + interval '15 minutes'`.
- Un cron job ou une vérification à la volée libère (passe en `annule` ou supprime) les réservations dont le `expires_at` est dépassé et dont l'acompte n'a pas été payé.

---

## 4. Gestion des Employés (Avertissements Non Bloquants)
- L'assignation d'un employé (`staff_id`) à un rendez-vous vérifie s'il a déjà une intervention aux mêmes horaires.
- En cas de double affectation, l'API renvoie un avertissement (`warning: 'staff_conflict'`) mais **n'empêche pas** l'enregistrement (règle métier : l'employé peut superviser en parallèle, contrairement au poste qui est une ressource physique exclusive).
