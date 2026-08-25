# Contexte — sync-marie

## Objectif
Développer la connexion sécurisée à Supabase et la synchronisation automatique des données de Marie, sans modifier le flux produit ou de déploiement de `main`.

## État actuel
Les Phases 1 à 3 de `roadmap_sync_marie.md` sont terminées et le snapshot Supabase v3.5 couvre les données applicatives, dont les revenus Budget. Le CLI Supabase est disponible localement via `npx supabase`. La Phase 4 attend l'exécution du schéma, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et une synchronisation réelle depuis l'appareil de Marie. `main` a 8 commits absents de cette branche. Cette branche ne déploie pas.

## Décisions structurantes
- 2026-08-24 : les contextes de session sont séparés par branche ; `main` gère le produit et les releases, `sync-marie` Supabase et la synchronisation uniquement.
- 2026-08-25 : le CLI Supabase est une dépendance de développement locale, utilisée via `npx supabase`.
