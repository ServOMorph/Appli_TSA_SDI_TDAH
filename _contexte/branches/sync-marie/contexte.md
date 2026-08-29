# Contexte — sync-marie

## Objectif
Développer la connexion sécurisée à Supabase et la synchronisation automatique des données de Marie, sans modifier le flux produit ou de déploiement de `main`.

## État actuel
Les Phases 1 à 3 de `roadmap_sync_marie.md` sont terminées et le snapshot Supabase v3.5 couvre les données applicatives, dont les revenus Budget.
La Phase 4 consiste désormais à reporter sélectivement ce socle sur une branche créée depuis `main`, puis à le valider.
`main` a 50 commits absents de `sync-marie` ; `sync-marie` en a 27 absents de `main`. Aucune fusion ou rebase automatique n'est autorisée.
Le schéma SQL, les variables séparées navigateur/serveur et une synchronisation réelle depuis l'appareil de Marie restent à valider.
Cette branche ne déploie pas.

## Décisions structurantes
- 2026-08-24 : les contextes de session sont séparés par branche ; `main` gère le produit et les releases, `sync-marie` Supabase et la synchronisation uniquement.
- 2026-08-25 : le CLI Supabase est une dépendance de développement locale, utilisée via `npx supabase`.
- 2026-08-29 : la suite de la roadmap est intégrée et finalisée sur `main` par report sélectif du socle Supabase, sans fusion intégrale de `sync-marie`.
