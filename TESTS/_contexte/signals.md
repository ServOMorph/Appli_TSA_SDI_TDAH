# Signals — TESTS

## Actions ouvertes

- [P1] Appliquer `supabase/feedback.sql` dans un environnement contrôlé, puis valider le parcours complet (capture, annotation, synchro serveur) sur téléphone réel.
  - fait quand: la migration est appliquée hors production et le parcours avec synchro est validé sur téléphone.
  - réf: TESTS/RETOURS/_contexte/signals.md, supabase/feedback.sql
- [P1] Organiser la répétition à blanc avec un testeur pilote réel et/ou faire relire `parcours_accueil.md` par une personne extérieure.
  - fait quand: les deux gates de sortie d'ONBOARD (Phase 2 et Phase 4) sont satisfaits.
  - réf: TESTS/ONBOARD/_contexte/statut.md, TESTS/ONBOARD/parcours_accueil.md
- [P2] Transmettre `demandes_evolution.md` (D1-D6, ONBOARD) à la zone produit pour chiffrage.
  - fait quand: les 6 demandes sont chiffrées ou explicitement refusées.
  - réf: TESTS/ONBOARD/demandes_evolution.md
- [P2] Ajouter au catalogue Marie (`manualTestsCatalog.ts`) les parcours du flux retours annotés (création avec image, annotation, collage, hors ligne, relance réseau, badge écran).
  - fait quand: le flux est validé avec synchro serveur (dépend de l'action SQL ci-dessus).
  - réf: TESTS/RETOURS/_contexte/statut.md § Points à valider

## Dernière session (2026-09-05)

- Flux de retours annotés (`agent/retours`, commit `bdff457`) relu, tests rejoués (tsc -b, lint, Vitest 773/773 OK) et fusionné dans `main` (commit `f6f5e78`), après validation explicite de l'utilisateur. Conflits résolus : `src/App.tsx` (imports lazy combinés), `src/data/db.ts` (version Dexie 19 combinant `taskCategories` et `feedbackReports`).
- `supabase/feedback.sql` non appliqué : le flux reste local (sans synchro serveur) pour ce test dev.
- Une autre session travaille en parallèle sur `main` (refactor `E24EditTask` → `E21CreateTaskV2`/`E22TaskDetail`, `DevResetButton.tsx`) : son travail est stashé (`stash@{0}` sur le poste de dev), non touché par cette session.
