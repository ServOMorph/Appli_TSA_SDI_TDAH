# Roadmap — V3 (post-visio Marie 2026-07-06)

Version : 3.0 — créée 2026-07-06
Source : `constats_2026-07-06.md`, `analyse_code_2026-07-06.md`, `plan_implementation_2026-07-06.md` (dossier `Note de réunion/2026-06-07/`)
Succède à `roadmap_v2.md` (V2-10 close). Ne couvre que les évolutions issues de cette visio.

## Légende statut
- `[ ]` non démarrée · `[~]` en cours · `[x]` terminée (gate validé)

## Gate commun (à cocher pour chaque phase)
1. `[ ]` Livrables fonctionnels
2. `[ ]` Tests créés (≥ 85 % du code ajouté) **et lancés au vert**
3. `[ ]` Refacto de fin de phase (dead code, duplication)
4. `[ ]` Doc à jour
5. `[ ]` Test manuel du parcours de la phase
6. `[ ]` Critère de sortie atteint
7. `[ ]` Aucun écran antérieur n'a perdu son point d'entrée navigable

> Chaque phase ci-dessous réplique ce gate. Cocher au fil de l'implémentation.

---

## Phase V3-0 — Refacto préalable (bases saines)

Aucune fonctionnalité nouvelle, aucun changement de comportement visible. Réf : `analyse_code_2026-07-06.md` §4.

- [ ] R1 — Constantes d'échelle d'énergie (`ENERGY_MIN=1`, `ENERGY_MAX=12`) + helper de barème, dans le domaine
- [ ] R2 — Schéma Dexie v3 : `TaskV2.energy_cost: number | null`, `Settings.ambiance_color?`, `Settings.energy_max?` (défaut 12). Migration additive, valeurs par défaut
- [ ] R3 — Composant `EnergyDisplay` réutilisable (dé-duplique le rendu énergie de `E10Dashboard`), neutre visuellement
- [ ] R4 — Extraction d'un layout/nav partagé (`AppShell` + `BottomNav`) depuis la nav locale du dashboard, sans le rendre encore persistant
- [ ] R5 — Sélecteur pur `isOverloaded(energieDuJour, tachesPlanifiees)` + tests, non branché à l'UI
- [ ] Confirmer la stratégie de reset/migration des données V2 existantes de Marie

### Gate V3-0
- [ ] 1 Livrables · [ ] 2 Tests verts (aucune régression) · [ ] 3 Refacto · [ ] 4 Doc · [ ] 5 Test manuel (comportement identique V2) · [ ] 6 Sortie : `tsc -b` clean, schéma v3 en place · [ ] 7 Nav préservée

---

## Phase V3-1 — Bugs + nettoyage UI (indépendants, faible risque)

- [ ] B1 — Tâche fantôme du planning : abandonner la planification ne persiste pas une `TaskV2 planned` non schedulée (option retenue : créer la tâche au moment de l'assignation, cf. analyse §3.4) — réf constats B1
- [ ] B2 — Cases du planning visibles en mode clair sur mobile (contraste/bordure) — réf B2
- [ ] B3 — Vérifier/reproduire « ajouter une tâche depuis Todo re-propose de faire la tâche » ; corriger si confirmé — réf B3
- [ ] D1 — Supprimer le bloc « Que faire maintenant ? » du dashboard — réf D1
- [ ] D2 — Supprimer la question « chose la plus importante à faire » à la connexion (localiser `E04FirstTask` / action immédiate) — réf D2
- [ ] D3 — Réordonner : « Tâche du jour » (renommé) au-dessus, « Planning du jour » en dessous ; police du contenu « Tâche du jour » agrandie — réf D3
- [ ] D4 — Supprimer le segment de nav « Aujourd'hui » du dashboard (⚠ après validation Q2) — réf D4
- [ ] P4a — Tâche terminée reste affichée (ne plus la retirer de la liste) — réf P4
- [ ] P5 — Case vide du planning : proposer d'ajouter une tâche (→ planifiée directement) — réf P5

### Gate V3-1
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel (chaque bug + chaque écran nettoyé) · [ ] 6 Sortie : app nettoyée, planning sans état fantôme · [ ] 7

---

## Phase V3-2 — Fondation énergie (domaine)

- [ ] Helpers domaine : coût total planifié restant d'une journée (somme `energy_cost` des `planned` non `completed`)
- [ ] Règle de barème personnel (E3) : validation valeur 1-12, aucune valeur imposée
- [ ] Tests unitaires purs des règles ci-dessus

### Gate V3-2
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 (via tests) · [ ] 6 Sortie : règles énergie prêtes, couvertes · [ ] 7

---

## Phase V3-3 — Saisie coût d'énergie + obligatoire (E1, E2)

- [ ] Fenêtre à deux carrés à la planification : sélecteur d'énergie 1-12 (E1) + case « obligatoire » (E2)
- [ ] Câblage du champ `essential` (réutilise `toggleEssentialV2`, ferme le trou fonctionnel V2-10)
- [ ] Persistance de `energy_cost` sur la `TaskV2`
- [ ] Affichage minimal du coût/obligatoire sur la tâche planifiée (habillage cuillères en V3-6)

### Gate V3-3
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : planifier une tâche, saisir énergie + obligatoire, vérifier persistance · [ ] 6 Sortie : coût et obligatoire saisissables et stockés · [ ] 7

---

## Phase V3-4 — Check-in énergie à chaque connexion (E4)

- [ ] Router le check-in énergie (`E31EnergyCheckIn`, existant) à chaque ouverture via `init()` (`AppContext`)
- [ ] Échelle 1-12, barème personnel (E3)
- [ ] Une entrée du jour garantie ; pas de re-demande si déjà saisie le même jour (à décider : re-saisie autorisée ?)

### Gate V3-4
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : rouvrir l'app → prompt énergie · [ ] 6 Sortie : énergie du jour capturée à chaque connexion · [ ] 7

---

## Phase V3-5 — Mode surcharge automatique (E5, E6)

- [ ] Mode surcharge dérivé : `isOverloaded()` branché sur énergie du jour (V3-4) vs coût planifié restant (V3-2/3-3)
- [ ] Bouton TopBar « Mode surcharge » rendu **informatif** : descriptif au clic, case « Désactivé » (grisée, non activable) / « Activé » (colorée), plus de toggle manuel — réf E5
- [ ] En surcharge : tâches non-obligatoires grisées/atténuées mais visibles, option « Reporter » ; obligatoires en couleur pastel — réf E6
- [ ] Retirer / neutraliser l'ancien `overload_mode` manuel (source de vérité unique, cf. analyse §3.2)

### Gate V3-5
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : énergie basse + tâches coûteuses → surcharge auto ; obligatoires restent en couleur · [ ] 6 Sortie : surcharge pilotée par l'énergie, bouton informatif seul · [ ] 7

---

## Phase V3-6 — Cuillères + couleurs du planning (E7, E8, P1, P2, P3, P4b)

- [ ] Composant « cuillères » réutilisable, sobre/clean (pas d'étoiles, pas enfantin) — réf E7
- [ ] Affichage du coût d'énergie (cuillères) sur les cases du planning — réf E8
- [ ] Texte des cases plus gros et centré — réf P1
- [ ] Case colorée en pastel quand une tâche est placée — réf P2
- [ ] Couleur pastel configurable dans les paramètres (`Settings.ambiance_color`) — réf P3
- [ ] P4b — Tâche terminée : couleur « flashy » (même teinte, plus intense) — réf P4
- [ ] « Planning du jour » du dashboard affiché en cases pastel comme « Tâche du jour » — réf D5

### Gate V3-6
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : planifier, voir cuillères + pastel, terminer → flashy, changer la couleur en paramètres · [ ] 6 Sortie : planning visuellement conforme au retour Marie · [ ] 7

---

## Phase V3-7 — Listes (visuel)

- [ ] L1 — Encadrement des éléments dans une liste plus fin/serré — réf L1
- [ ] L2 — Différencier « toutes les listes » (grosses cases) vs « intérieur d'une liste » (cases fines) — réf L2
- [ ] L3 — Cohérence : encadrement du titre de liste identique à celui des listes en vue globale — réf L3

### Gate V3-7
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : naviguer listes → détail, vérifier la différence visuelle · [ ] 6 Sortie : hiérarchie visuelle des listes lisible · [ ] 7

---

## Phase V3-8 — Planning : récurrences (P6)

- [ ] Rester dans le planning après validation : tant qu'on n'est pas revenu en arrière, cliquer une autre case re-propose la même tâche — réf P6
- [ ] Après avoir posé une tâche, passer automatiquement au jour suivant — réf P6

### Gate V3-8
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : planifier la même tâche sur plusieurs jours sans revenir en arrière · [ ] 6 Sortie : saisie de récurrences fluide · [ ] 7

---

## Phase V3-9 — Navigation persistante (N1) — transversal, en dernier

- [ ] Rendre `BottomNav` (extrait en R4) persistant sur tous les écrans
- [ ] Onglet actif mis en valeur (couleur/tamisé), style cohérent
- [ ] Conserver la pastille rouge sur Todo — réf N1
- [ ] Vérifier qu'aucun écran ne perd son point d'entrée (gate point 7 critique ici)

### Gate V3-9
- [ ] 1 · [ ] 2 · [ ] 3 · [ ] 4 · [ ] 5 Test manuel : parcourir tous les écrans, nav toujours présente et cohérente · [ ] 6 Sortie : navigation unifiée façon app native · [ ] 7

---

## Décisions produit à trancher (à insérer quand tranchées)
- [ ] Q1 — Limite de 3 tâches « aujourd'hui » : garder / augmenter / configurable — réf constats Q1
- [ ] Q2 — Ambiguïté « Aujourd'hui » vs « Tâche du jour » (nav vs création) — **bloque D3/D4/V3-1** — réf Q2
- [ ] Q3 — Choix de couleur proposé aussi à la connexion — réf Q3

## Reporté (hors V3, à confirmer avec Marie)
- [ ] N2 — Swipe/glissement pour changer d'onglet (réserve technique PWA, prototyper d'abord)
- [ ] N3 — Dictée vocale à l'ajout de tâche
- [ ] E9 — Stock de cuillères max configurable dans les paramètres

## Sortie V3
- [ ] V3 stable, couverte par les tests, validée par test manuel
- [ ] Session test suivante avec Marie sur les nouveautés énergie/surcharge
- [ ] V2 toujours restaurable (stratégie de rollback inchangée)
