# Signals — sync-marie

## Contexte chaud
- Périmètre exclusif : authentification sécurisée, Supabase et synchronisation. Aucun déploiement, test Marie, `CHANGELOG.md` ou `WHATS_NEW` sur cette branche.
- Les branches ont divergé : `main` a 50 commits absents de `sync-marie` et `sync-marie` en a 27 absents de `main`. L'intégration doit partir de `main`, par report sélectif du socle Supabase ; aucune fusion ou rebase automatique.
- Le CLI Supabase `2.115.0` est disponible localement via `npx supabase`.

## Questions ouvertes
- [P1] Intégrer sélectivement le socle Supabase dans une branche créée depuis `main`, puis valider les tests et le build. — fait quand : la branche d'intégration contient uniquement le périmètre Phase 4 et `npm test` ainsi que `npm run build` réussissent — réf : `roadmap_sync_marie.md` Phase 4
- [P1] Activer le backend réel : exécuter `supabase/schema.sql`, configurer les variables navigateur et serveur selon leur rôle, puis vérifier la lecture par `scripts/read_device_snapshots.py`. — fait quand : le script renvoie une ligne de snapshot réelle — réf : `roadmap_sync_marie.md` Phase 4, `supabase/schema.sql`, `scripts/read_device_snapshots.py`
- [P1] Tester une synchronisation réelle depuis l'appareil de Marie et confirmer l'affichage de `SyncStatusCard`. — fait quand : `synced_at` récent pour l'appareil de Marie et statut visible côté application — réf : `roadmap_sync_marie.md` Phase 4, `src/ui/components/SyncStatusCard.tsx`

## Dernière session (2026-08-29 — stratégie d'intégration Supabase)

## Décisions prises
- La suite de la roadmap sera intégrée et terminée sur `main`, pas sur `sync-marie`.
- Le socle Supabase sera reporté sélectivement depuis une branche d'intégration créée sur `main` ; aucun cherry-pick ou merge intégral de `sync-marie`.
- Les clés Supabase navigateur et la clé serveur sont séparées explicitement dans la roadmap.

## Livrables produits ou modifiés
- `roadmap_sync_marie.md` : Phase 4 recentrée sur l'intégration et validation dans `main` ; Phase 5 ajoutée pour le retrait du flux manuel.
- `_contexte/branches/sync-marie/` : état de divergence et actions ouvertes actualisés.

## Hypothèses validées / invalidées
- VALIDE : le socle de synchronisation est identifiable et peut être reporté sans reprendre les travaux hors périmètre de `sync-marie`.
- INVALIDE : poursuivre la roadmap directement sur `sync-marie` est sûr compte tenu de la divergence avec `main` -> pivot vers une branche d'intégration issue de `main`.
- EN ATTENTE : intégration, exécution du schéma et validation réelle avec Marie.

## Prochaine étape exacte
Depuis `main`, créer une branche d'intégration et y reporter le périmètre défini en Phase 4.
Configurer ensuite Supabase, lancer les tests et valider une synchronisation réelle avant fusion dans `main`.

## Question bloquante pour la session suivante
L'intégration sélective doit-elle être démarrée maintenant depuis `main` ?
