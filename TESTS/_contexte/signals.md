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

## Dernière session (2026-09-05, suite)

- Session précédente (fusion `agent/retours`, déploiement dev) close et poussée (`739aab3`). Ce
  tour : message envoyé (presse-papier) à l'orchestrateur résumant la fusion et signalant le
  stash laissé de côté — aucun changement de code dans ce tour.
- Depuis, l'orchestrateur a committé et déployé en prod (v5.92) plusieurs évolutions (refonte
  fiche de tâche #37, défilement bandeau #38) : le flux retours annotés (`E122FeedbackCapture`,
  `E123FeedbackList`, `feedbackReports`) reste intact et présent dans `src/App.tsx` / `src/data/db.ts`
  après ces commits — vérifié.
- `stash@{0}` ("wip avant fusion agent/retours (TESTS)") est **toujours présent**, non récupéré :
  soit l'orchestrateur n'a pas vu le message, soit le refactor `E24EditTask` a été refait
  autrement (commit `40d1474`) et ce stash est obsolète — à trancher par l'orchestrateur, pas par
  cette session.
- `supabase/feedback.sql` toujours non appliqué : le flux reste local (sans synchro serveur).
