# Signals — sync-marie

## Contexte chaud
- Périmètre exclusif : authentification sécurisée, Supabase et synchronisation. Aucun déploiement, test Marie, `CHANGELOG.md` ou `WHATS_NEW` sur cette branche.
- `main` a 8 commits absents de `sync-marie` : planifier une intégration contrôlée avant toute fusion ou tout déploiement.
- Le CLI Supabase `2.115.0` est disponible localement via `npx supabase`.

## Questions ouvertes
- [P1] Activer le backend réel : exécuter `supabase/schema.sql`, renseigner `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env`, puis vérifier la lecture par `scripts/read_device_snapshots.py`. — fait quand : le script renvoie une ligne de snapshot réelle — réf : `roadmap_sync_marie.md`, `supabase/schema.sql`, `scripts/read_device_snapshots.py`
- [P1] Tester une synchronisation réelle depuis l'appareil de Marie et confirmer l'affichage de `SyncStatusCard`. — fait quand : `synced_at` récent pour l'appareil de Marie et statut visible côté application — réf : `roadmap_sync_marie.md` Phase 4, `src/ui/components/SyncStatusCard.tsx`
- [P2] Confirmer si les variables Supabase publiques sont aussi configurées sur le site Netlify de test. — fait quand : configuration confirmée ou jugée non nécessaire — réf : `roadmap_sync_marie.md` Prérequis externe

## Dernière session (2026-08-25 — préparation du CLI et corrections de dépendances)

## Décisions prises
- Le CLI Supabase est installé localement et s'utilise avec `npx supabase`.
- Les correctifs de dépendances compatibles ont été appliqués ; la vulnérabilité faible restante d'esbuild ne doit pas être forcée hors de la compatibilité Vite.

## Livrables produits ou modifiés
- `package.json`, `package-lock.json` : CLI Supabase ajouté, Vite mis à jour en 8.2.2 et dépendances indirectes corrigées.
- `_docs/manip branches.txt` : procédure novice ajoutée avant changement de branche.

## Hypothèses validées / invalidées
- VALIDE : le build de production réussit avec Vite 8.2.2.
- EN ATTENTE : exécution du schéma, accès de lecture avec clé service et validation sur l'appareil de Marie.

## Prochaine étape exacte
Exécuter `supabase/schema.sql` dans le projet Supabase, puis ajouter `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` à `.env`.
Lancer ensuite `python scripts/read_device_snapshots.py` et effectuer une synchronisation réelle depuis l'appareil de Marie.

## Question bloquante pour la session suivante
Le schéma Supabase est-il exécuté et les deux variables serveur sont-elles configurées localement ?
