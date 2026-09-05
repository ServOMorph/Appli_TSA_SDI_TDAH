# Signals — RETOURS

## Actions ouvertes

- [P1] Appliquer `supabase/feedback.sql` dans un environnement contrôlé, puis valider le parcours sur téléphone réel avec synchro serveur.
  - fait quand: la migration est appliquée hors production et le parcours complet (capture, annotation, synchro) est validé sur téléphone.
  - réf: statut.md, ../roadmap_retours_annotes.md, ../../../../supabase/feedback.sql

## Dernière session (2026-09-05 — fusion dans main par TESTS)

## Décisions prises
- Fusion de `agent/retours` (bdff457) dans `main`, après rejeu de `tsc -b`, lint et Vitest
  (748/748) — tous passants. `bundle:check` et Playwright non rejoués.
- Conflits résolus : `src/App.tsx` (imports lazy Settings + Feedback combinés),
  `src/data/db.ts` (version 19 Dexie combinant `taskCategories` et `feedbackReports`).

## Hypothèses validées / invalidées
- Le flux fonctionne en local (Dexie) sans synchro serveur tant que `supabase/feedback.sql`
  n'est pas appliqué — comportement attendu, pas un bug.

## Prochaine étape exacte
Déploiement dev pour test sur téléphone réel (sans synchro serveur pour l'instant).

## Question bloquante pour la session suivante
Aucune.
