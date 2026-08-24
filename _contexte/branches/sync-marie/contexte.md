# Contexte — sync-marie

## Objectif
Développer la connexion sécurisée à Supabase et la synchronisation automatique des données de Marie, sans modifier le flux produit ou de déploiement de `main`.

## État actuel
`sync-marie` contient `main` au 2026-08-24 et les Phases 1 à 3 de `roadmap_sync_marie.md` sont terminées. Le snapshot Supabase v3.5 couvre les données applicatives, dont les revenus Budget. La Phase 4 attend le schéma exécuté sur Supabase, les clés développeur et une synchronisation réelle depuis l'appareil de Marie. Cette branche ne déploie pas.

## Décisions structurantes
- 2026-08-24 : les contextes de session sont séparés par branche ; `main` gère le produit et les releases, `sync-marie` Supabase et la synchronisation uniquement.
