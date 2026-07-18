# Validation manuelle — Phase V4-0 (refacto préalable)

Branche : `v4` — Date : 2026-07-18

Objectif de la phase : **aucun changement de comportement ni d'apparence**. Tout écart constaté
par rapport à la V3 est une régression à signaler.

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## R1 — Occupation du planning par plage

- [ ] 1.1 — Ouvrir le Planning. Les 48 créneaux s'affichent, hauteur et espacement identiques à la V3.
- [ ] 1.2 — Créer une tâche sur un créneau vide (flux modale 3 étapes : nom → énergie → obligatoire).
      La tâche apparaît sur **un seul** créneau, celui choisi.
- [ ] 1.3 — Cliquer sur le créneau juste en dessous de la tâche créée : la modale de création s'ouvre
      normalement (le créneau n'est pas considéré comme occupé).
- [ ] 1.4 — Créer une seconde tâche sur ce créneau voisin : les deux tâches coexistent, chacune sur sa ligne.
- [ ] 1.5 — Cliquer sur une tâche planifiée → picker de déplacement. Le créneau de l'autre tâche
      **n'apparaît pas** dans la liste des créneaux proposés ; tous les autres créneaux y sont.
- [ ] 1.6 — Déplacer la tâche vers un créneau libre : elle s'affiche au nouveau créneau, l'ancien
      redevient vide et cliquable.
- [ ] 1.7 — Depuis Todo, mettre une tâche « en main » (pendingPlanTask) puis taper un créneau
      **déjà occupé** : le message « Ce créneau est déjà occupé par une autre tâche » s'affiche.
- [ ] 1.8 — Les créneaux vides gardent la même hauteur que les créneaux occupés (pas d'affaissement
      ni de décalage vertical).
- [ ] 1.9 — Marquer une tâche planifiée comme terminée (bouton « Terminer ») : comportement V3 inchangé.

## R2 — Variable CSS `--color-accent`

- [ ] 2.1 — Boutons primaires (« Ajouter une tâche », « Nouvelle liste », boutons de modale) :
      couleur **identique à la V3** — la couleur d'ambiance ne doit **pas** encore les affecter.
- [ ] 2.2 — Réglages → Accessibilité → changer la couleur d'ambiance. Les cartes pastel du Planning
      et de l'accueil changent de teinte comme en V3 ; les boutons primaires restent inchangés.
- [ ] 2.3 — Activer le mode sombre : les boutons primaires prennent la teinte sombre habituelle
      (pas de couleur figée du thème clair).
- [ ] 2.4 — Recharger l'application (F5) : aucun flash de couleur anormal au démarrage sur les boutons.

## Non-régression générale

- [ ] 3.1 — Onboarding complet sur base vierge (accueil → profil → énergie) : aucun blocage.
- [ ] 3.2 — Check-in énergie quotidien : s'affiche une fois, puis Dashboard.
- [ ] 3.3 — Dashboard : section « Planning du jour » et section tâches du jour affichées normalement.
- [ ] 3.4 — Navigation basse (4 onglets) présente sur tous les écrans hors onboarding/check-in.
- [ ] 3.5 — Bouton « Répéter demain » : toujours fonctionnel (son retrait est prévu en V4-3, pas ici).
- [ ] 3.6 — Mode surcharge : se déclenche automatiquement comme en V3, badge « Reporter » présent.
- [ ] 3.7 — Listes : vue globale et détail d'une liste inchangés.

---

## Résultat

- [ ] Tous les points passés → phase V4-0 validée, à marquer [FAIT] au `/close`.
- [ ] Écarts constatés : _(à remplir)_
