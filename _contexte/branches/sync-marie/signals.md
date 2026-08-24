# Signals — sync-marie

## Contexte chaud
- Périmètre exclusif : authentification sécurisée, Supabase et synchronisation. Aucun déploiement, test Marie, `CHANGELOG.md` ou `WHATS_NEW` sur cette branche.
- `main` a été intégré le 2026-08-24. Les évolutions produit sont désormais incluses dans `sync-marie` ; le snapshot Supabase est en version 3.5 et inclut les revenus Budget.

## Questions ouvertes
- [P1] Activer le backend réel : exécuter `supabase/schema.sql`, renseigner `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env`, puis vérifier la lecture par `scripts/read_device_snapshots.py`. — fait quand : le script renvoie une ligne de snapshot réelle — réf : `roadmap_sync_marie.md`, `supabase/schema.sql`, `scripts/read_device_snapshots.py`
- [P1] Tester une synchronisation réelle depuis l'appareil de Marie et confirmer l'affichage de `SyncStatusCard`. — fait quand : `synced_at` récent pour l'appareil de Marie et statut visible côté application — réf : `roadmap_sync_marie.md` Phase 4, `src/ui/components/SyncStatusCard.tsx`
- [P2] Confirmer si les variables Supabase publiques sont aussi configurées sur le site Netlify de test. — fait quand : configuration confirmée ou jugée non nécessaire — réf : `roadmap_sync_marie.md` Prérequis externe

## Dernière session (2026-08-24 — intégration de main et consolidation du snapshot)

## Décisions prises
- `main` est intégré dans `sync-marie`; la branche reste réservée à Supabase et à la synchronisation.
- L'export manuel et le snapshot Supabase partagent le schéma 3.5, incluant les revenus Budget.

## Livrables produits ou modifiés
- `buildSnapshot.ts`, `useSettingsState.ts` : snapshot v3.5 complet.
- Commandes `start.md` et `close.md` : contexte et règles distincts par branche.

## Hypothèses validées / invalidées
- VALIDE : l'intégration conserve les fonctions de synchronisation et les évolutions Budget récentes.
- EN ATTENTE : validation sur le backend Supabase réel et sur l'appareil de Marie.

## Prochaine étape exacte
Configurer le backend Supabase réel, puis effectuer une synchronisation depuis l'appareil de Marie.

## Question bloquante pour la session suivante
Aucune.
