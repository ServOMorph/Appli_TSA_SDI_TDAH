# Validation manuelle — Phase V4-3 (Multi-créneaux et récurrence)

Branche : `v4` — Date : 2026-07-19

Objectif de la phase : E2 (plages de créneaux), E5 (tâche active), D3 (retrait de
« Répéter demain »), B2 (cadre du Dashboard) et D5 (énergie + obligatoire regroupés).

Lancer : `npm run dev` (ou `npm run dev -- --host` pour tester au téléphone).
Repartir d'une base propre via le bouton « Reset DB » (dev) si besoin.

---

## E2 — Multi-créneaux

- [ ] 1.1 — Depuis le Planning, choisir une tâche à planifier. Cliquer un créneau de début puis un
      créneau de fin : toutes les demi-heures couvertes sont colorées en un seul bloc, dont le nom
      n'est affiché qu'une fois.
- [ ] 1.2 — Cliquer deux fois la même case : la tâche occupe exactement une demi-heure.
- [ ] 1.3 — Tenter de sélectionner une plage passant par une case déjà occupée : le placement est
      refusé et aucune tâche existante n'est modifiée.
- [ ] 1.4 — Créer une tâche de coût énergétique 5 sur trois créneaux. Vérifier que son coût n'est
      compté qu'une fois pour le mode surcharge.

## E5 — Tâche active

- [ ] 2.1 — Après le premier placement, le bandeau indique que la tâche est encore en cours de
      planification.
- [ ] 2.2 — Sélectionner une autre plage : la même tâche est déplacée, sans duplication. Changer de
      jour puis la repositionner : elle reste la même tâche.
- [ ] 2.3 — Cliquer « Terminer » dans le bandeau : le mode de planification active s'arrête.

## D3, B2 et D5

- [ ] 3.1 — « Répéter demain » n'est plus affiché ni dans le Planning ni dans « Planning du jour »
      sur l'accueil.
- [ ] 3.2 — Créer une tâche planifiée puis vérifier le cadre « Planning du jour » sur l'accueil :
      aucun bouton ni contenu ne déborde.
- [ ] 3.3 — Dans la modale de création, l'énergie et la case « Obligatoire » sont sur le même écran.
      Le coût est facultatif et une tâche obligatoire peut être créée sans étape supplémentaire.

---

## Résultat

- [ ] Tous les points passés → phase V4-3 validée.
- [ ] Écarts constatés :
