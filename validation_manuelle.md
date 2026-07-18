# Validation manuelle — Phase V4-2 (Rendu du planning)

Branche : `v4` — Date : 2026-07-19

Objectif de la phase : P1 (case de planning colorée), P2 (case à cocher) et P3 (tâches du
jour terminées conservées). Les validations V4-1 restent acquises et ne sont pas à repasser.

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## P1 — Case de planning colorée

- [x] 1.1 — Créer une tâche planifiée : sa case entière est teintée dans le Planning, avec le nom
      de la tâche directement dans la case. Aucun chip interne distinct ne subsiste.
- [x] 1.2 — Cliquer la case colorée ouvre toujours le dialogue de déplacement. Fermer le dialogue
      ne déplace pas la tâche.

## P2 — Case à cocher sur les tâches planifiées

- [x] 2.1 — Sur le Planning, une tâche planifiée non terminée affiche une case à cocher vide et une
      teinte claire.
- [x] 2.2 — Cocher la tâche : elle reste visible, la case devient cochée et la teinte devient plus
      intense.
- [x] 2.3 — Sur le Dashboard, dans « Planning du jour », la même tâche affiche la même case cochée
      et la même teinte intense. Le bouton « Terminer » n'est plus présent.
- [x] 2.4 — Recliquer la coche, dans le Planning puis sur le Dashboard : elle redevient vide, la teinte
      redevient claire et la tâche n'est plus terminée.

## P3 — Tâches du jour terminées conservées

- [x] 3.1 — Créer une tâche « Tâche du jour », puis la terminer depuis l'écran « Aujourd'hui » : elle
      reste affichée avec une teinte intense et le texte barré.
- [x] 3.2 — Revenir à l'accueil : cette tâche terminée reste visible dans « Tâche du jour », avec la
      même teinte intense et le texte barré.
- [x] 3.3 — Recharger l'application : la tâche terminée aujourd'hui reste affichée sur « Aujourd'hui »
      et sur l'accueil.

---

## Résultat

- [x] Tous les points passés → phase V4-2 validée.
- [x] Écarts constatés : aucun.
