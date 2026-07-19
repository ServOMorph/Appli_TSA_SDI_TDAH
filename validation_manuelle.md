# Validation manuelle — Phase V4-5 (Sous-tâches planifiables)

Branche : `v4` — Date : 2026-07-19

Objectif de la phase : E9a (une sous-tâche peut se planifier à son propre créneau, rattachée à sa
tâche parente sans devenir une tâche indépendante), E9b (affichage hiérarchique dans le planning,
l'accueil et le report), E9c (point d'entrée « Planifier » depuis l'écran de décomposition et le
détail de tâche). Périmètre étendu sur demande explicite de l'utilisateur : parité complète
d'interactions avec les tâches (E1 glisser, E6 menu déplacer/renommer/supprimer, E8 reporter).

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## E9a/E9c — Planifier une sous-tâche

- [x] 1.1 — Depuis Todo ou Tâche du jour, ouvrir une tâche ayant au moins une sous-étape (ou en
      créer une via « Décomposer »). Chaque sous-étape affiche un bouton « Planifier » à côté de
      « Supprimer ».
- [x] 1.2 — Taper « Planifier » sur une sous-étape ouvre le Planning avec le bandeau
      « "X" est en cours de planification. » (même mécanique que planifier une tâche).
- [x] 1.3 — Taper une case vide place la sous-étape à ce créneau ; la tâche parente n'est ni
      supprimée ni transformée — elle reste visible avec ses autres sous-étapes dans Décomposer.
- [x] 1.4 — Le même point d'entrée « Planifier » est disponible depuis l'écran de détail de tâche
      (pas seulement depuis Décomposer).
- [ ] 1.5 — Depuis l'écran de détail de tâche (E22), chaque sous-étape a un bouton « Renommer » qui
      ouvre une modale pré-remplie ; enregistrer met à jour le titre affiché.

## E9b — Affichage hiérarchique

- [x] 2.1 — Sur le Planning, la case occupée par la sous-étape affiche le titre de la tâche parente
      en taille normale, puis le titre de la sous-étape en dessous, plus petit, précédé d'un tiret.
- [x] 2.2 — Sur l'accueil, la carte « Planning du jour » affiche la sous-étape planifiée du jour
      avec la même hiérarchie (parent normal / sous-étape plus petite en dessous).
- [x] 2.3 — Cocher la case d'une sous-étape planifiée la marque terminée (teinte intensifiée), à la
      fois sur le Planning et sur l'accueil ; décocher la réactive.

## E1/E6/E8 — Parité d'interactions

- [x] 3.1 — Taper sur une sous-étape déjà placée ouvre le même menu Déplacer/Renommer/Supprimer que
      pour une tâche.
- [x] 3.2 — « Renommer » ne change que le titre de la sous-étape (le titre du parent reste inchangé
      à l'affichage).
- [x] 3.3 — « Supprimer » retire la sous-étape (et sa planification) sans toucher à la tâche parente
      ni aux autres sous-étapes.
- [x] 3.4 — Appui long + glisser fonctionne sur une sous-étape planifiée exactement comme sur une
      tâche (bascule de jour par zones de bord incluse).
- [x] 3.5 — En mode surcharge, le bouton « Reporter » apparaît sur une sous-étape planifiée non
      terminée et déclenche le même bandeau de déplacement basculé sur le lendemain.
- [x] 3.6 — Une sous-étape planifiée et une tâche planifiée ne peuvent pas occuper le même créneau
      (conflit détecté dans les deux sens).

---

## Résultat

- [ ] Tous les points passés → phase V4-5 validée.
- [ ] Écarts constatés :
