# Validation manuelle — Phase V4-1 (Quick wins UI)

Branche : `v4` — Date : 2026-07-18

Objectif de la phase : D2 (libellés « maintenant »), E7 (indicateur surcharge permanent),
D4 (pas de « Planifier » à l'ajout depuis Todo). B1 (couleur d'ambiance sur les boutons) déjà
validé séparément.

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## D2 — « aujourd'hui » → « maintenant »

- [ ] 1.1 — Check-in énergie (accueil → « Renseigner mon énergie ») : titre « Mon énergie
      maintenant », question « Combien d'énergie avez-vous maintenant ? ».
- [ ] 1.2 — Onboarding (base vierge) : même écran, titre « Votre énergie maintenant ».
- [ ] 1.3 — Écran « Mon énergie » (résumé) après un check-in rempli : le libellé sous le score
      affiche « énergie maintenant » (plus « aujourd'hui »).
- [ ] 1.4 — Sur ce même écran, les messages « Aucun check-in aujourd'hui » et « Énergie ignorée
      pour aujourd'hui » restent inchangés (ils décrivent le statut du jour, pas la question).

## E7 — Indicateur mode surcharge permanent

- [ ] 2.1 — Hors surcharge : le bouton « Mode surcharge » est visible dans la TopBar, grisé
      (fond neutre, texte atténué).
- [ ] 2.2 — Clic dessus hors surcharge : affiche une explication générique du déclenchement du
      mode (pas de chiffres d'énergie planifiée/disponible).
- [ ] 2.3 — Provoquer une surcharge (planifier plus que l'énergie disponible) : le bouton devient
      coloré (« Mode surcharge actif »).
- [ ] 2.4 — Clic dessus en surcharge : affiche l'explication chiffrée (« X énergie planifiée pour
      Y disponible aujourd'hui »).
- [ ] 2.5 — Hors surcharge, les icônes Ressources et Paramètres restent visibles à côté du bouton.
- [ ] 2.6 — En surcharge, seul le bouton « Mode surcharge actif » est visible (Ressources/Paramètres
      masqués, comportement V3 inchangé).

## D4 — Pas de « Planifier » à l'ajout depuis Todo

- [ ] 3.1 — Onglet Todo → « Ajouter une tâche » : l'écran de création propose seulement Todo,
      Tâche du jour, Mettre dans une liste. Pas de « Planifier ».
- [ ] 3.2 — Onglet Tâche du jour → « Ajouter une tâche » : les 4 destinations sont proposées,
      « Planifier » inclus.
- [ ] 3.3 — Bouton d'ajout de la navigation basse (accessible depuis le Dashboard) : les 4
      destinations sont proposées, « Planifier » inclus.
- [ ] 3.4 — Depuis Todo, ajouter une tâche puis revenir sur Todo et ajouter une seconde tâche :
      « Planifier » reste absent (pas de fuite d'état après un premier passage).

## Non-régression générale

- [ ] 4.1 — Navigation basse (4 onglets) toujours présente hors onboarding/check-in.
- [ ] 4.2 — Boutons primaires toujours sur la couleur d'ambiance (B1, non affecté par cette phase).
- [ ] 4.3 — Aucune erreur console au chargement des écrans touchés (Dashboard, Todo, Tâche du jour,
      création de tâche, check-in, résumé énergie).

---

## Résultat

- [ ] Tous les points passés → phase V4-1 validée, à marquer [FAIT] au `/close`.
- [ ] Écarts constatés : _(à remplir)_
