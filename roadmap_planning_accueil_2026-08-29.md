# Roadmap — Planning de l'accueil (demandes Marie 18-22)

- Source : Google Doc « Modifications » de Marie
  `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`
- Date de modification du Doc analysée : 2026-08-28 23:28
- Date d'analyse : 2026-08-29 (`/analyser_googledoc`)
- Registre de suivi : `_contexte/marie_modifications_suivi.md` (lignes 18-22)

## Périmètre

Les 5 demandes du Doc sont toutes dans la catégorie « Accueil / Planning ». Les autres
catégories (Tâches, Budget, Listes, Autres, Énergie, Paramètres/Profil) sont vides dans cette
version du Doc. Aucune demande n'est déjà livrée : ce sont toutes des évolutions de la vue
planning de l'accueil.

## Analyse du Google Doc

| N° | Catégorie | Demande (résumé) | État actuel dans le code | Classement | Phase |
| --- | --- | --- | --- | --- | --- |
| 18 | Accueil / Planning | Fond des cases de tâches coloré sur toute la hauteur ; sous-tâches dépliées dans la case colorée | La teinte (`plannedTaskTintStyle`) est posée sur un `<div>` interne à hauteur du contenu seulement (`PlanningBoard.tsx:473`), pas sur la hauteur de `rowStyle` (44-160 px ∝ durée). Le bloc sous-tâches déplié (`PlanningBoard.tsx:518-535`) est rendu **hors** du div teinté, sans fond. | Évolution à concevoir | 2 |
| 19 | Accueil / Planning | Fond de la case des jours de la semaine pleinement coloré de la couleur choisie (pas seulement le contour) | `dateStripStyle` (`PlanningBoard.tsx:57-66`) ne colore que la bordure (`border: 2px solid ambianceColor`). `dayCellStyle` (`:68-83`) n'a un fond que pour le jour sélectionné, et via `--color-primary`, pas la couleur d'ambiance. | Évolution à concevoir | 3 |
| 20 | Accueil / Planning | Retirer le plier/déplier et le trait gris ; hauteur du planning fixe, à mi-chemin pile entre replié et déplié | Poignée grise `handleBarStyle` + logique plier/déplier et drag (`E10Dashboard.tsx:30-36, 105-148`). Hauteurs `PLANNING_MIN_HEIGHT_PX = 190` / `PLANNING_MAX_HEIGHT_PX = 460`. Route `planning` = état « déplié » du dashboard. | Évolution à concevoir | 1 |
| 21 | Accueil / Planning | Au glissement des jours, seul l'intérieur (les jours) défile par rapport au fond de la case ; effet de grossissement du jour qui passe au sélecteur | Tout le bandeau (`<div>` bordure + cellules) subit `transform: translateX(dragOffset)` (`PlanningBoard.tsx:430-438`). Aucun effet d'échelle sur le jour centré. | Évolution à concevoir | 4 |
| 22 | Accueil / Planning | Logo planning cliquable à gauche du mois → planning complet en pleine page : vue semaine, plannings de chaque jour en cases-logos, même navigation que l'accueil | Aucune vue planning pleine page semaine. La route `planning` ne fait qu'agrandir le bandeau du jour courant dans le dashboard. La barre du mois (`PlanningBoard.tsx:411-429`) contient déjà une icône calendrier sur le bouton mois, mais pas de bouton distinct à gauche. | Évolution à concevoir (bloc le plus lourd) | 5 |

### Écarts avec des décisions/livraisons antérieures

- #20 et #21 remplacent le comportement de glissement/dépliage continu du planning livré
  précédemment (parcours catalogue `glisser-pour-ouvrir-le-planning`,
  `encadrement-et-glissement-du-planning` = demande #2 pour ce dernier point de bandeau).
  Ces parcours deviennent obsolètes et sont à retirer/réécrire dans les phases concernées.
  Marie est propriétaire du produit : ce revirement est assumé, pas un conflit bloquant.

## Décisions produit non tranchées

À confirmer avec Marie (ou trancher en implémentation + validation manuelle). Ne pas coder
avant arbitrage sur les points marqués « bloquant ».

1. **#19 — portée exacte du fond coloré** (non bloquant, défaut proposé) : « la case des jours »
   au singulier désigne le conteneur du bandeau, qui n'a aujourd'hui qu'une bordure colorée.
   Défaut retenu : remplir le fond du conteneur d'un aplat clair de la couleur d'ambiance, et
   garder une mise en évidence distincte du jour affiché. À valider visuellement par Marie.
2. **#19 — couleur de référence** (non bloquant) : « la couleur choisie » = couleur d'ambiance
   (réglable dans Paramètres > Accessibilité). Confirmé par cohérence avec la demande #2.
3. **#21 — intensité du grossissement** (non bloquant) : facteur d'échelle et courbe de
   l'effet à régler à l'œil pendant l'implémentation, gate = test manuel Marie.
4. **#22 — granularité de navigation** (TRANCHÉ 2026-08-31, Marie) : le glissement fait
   défiler **d'une semaine** (±1 semaine), à condition que les 7 jours de la semaine tiennent
   à l'écran — ce qui est l'objectif même de #22 (« vue d'ensemble de la semaine », cases en
   logos). Réponse de Marie : « si tu peux mettre toute la semaine dans l'écran : semaine ;
   si tu ne peux pas : jour ». Repli sur navigation jour par jour uniquement si l'affichage
   des 7 jours s'avère illisible en implémentation ; gate = test manuel Marie.
   Cf. `COMMUNICATION/Marie/historique_whatsapp.md`.
5. **#22 — devenir de la route `planning` actuelle** (TRANCHÉ 2026-08-30, côté dév) : choix
   d'implémentation interne, hors périmètre Marie. La route `planning` existante est
   **réaffectée** à la vue pleine page semaine de la Phase 5 (cohérent avec la Phase 1 qui l'a
   explicitement conservée comme emplacement de cette vue). Pas de route `planning-week`
   distincte. Impacte `navigation.ts`, `App.tsx`, `DevResetButton.tsx` au moment de la Phase 5.
6. **#22 — « cases en logos »** (non bloquant) : les cellules de tâche de la vue semaine
   n'affichent que l'icône de la tâche (pas de titre, pas d'horaire). Défaut retenu.

## Ordre et dépendances

```
Phase 1 — #20 : hauteur fixe, retrait plier/déplier + trait gris   (socle)
Phase 2 — #18 : fond de case coloré pleine hauteur + sous-tâches
Phase 3 — #19 : fond de la case des jours pleinement coloré
Phase 4 — #21 : glissement interne des jours + grossissement        (dépend de 1 et 3)
Phase 5 — #22 : écran planning pleine page vue semaine              (dépend de 1)
```

Phases 2 et 3 sont indépendantes l'une de l'autre et de la 1 (mais la 1 simplifie le terrain).
Phase 4 dépend de la 1 (plus de drag externe du bandeau) et de la 3 (style de la case des jours).
Phase 5 dépend de la 1 (réaffectation de la route `planning`).

## Phase 1 — #20 : hauteur fixe du planning, retrait du plier/déplier [FAIT]

- [x] Retirer la poignée (`handle`, `handleStyle`, `handleBarStyle`) et toute la logique de
  drag/expansion dans `E10Dashboard.tsx` (`dragStartY`, `dragDeltaY`, `handleHandle*`,
  `clampPlanningHeight`, constantes `PLANNING_MIN/MAX_HEIGHT_PX`).
- [x] Fixer la hauteur du conteneur du planning à 325 px (moitié pile de 190 et 460) —
  `PLANNING_HEIGHT_PX` exporté par `E10Dashboard.tsx`.
- [x] Route `planning` — décision 5 tranchée : **conservée**. Elle ne pilote plus d'état
  « déplié » (le dashboard n'a plus qu'un seul état) mais sert d'`originScreen` à la création
  de tâche (`E21CreateTaskV2.tsx`) et reste l'emplacement de la vue pleine page de la Phase 5.
  `navigation.ts`, `App.tsx`, `DevResetButton.tsx` inchangés.
- [x] `PlanningBoard` : prop `collapsed`, `COLLAPSED_ROW_LIMIT` et `effectiveDate` supprimés ;
  le planning affiche toujours le jour sélectionné, seule la liste des tâches défile
  (`flex: 1; min-height: 0; overflow-y: auto`), mois et bandeau de jours fixes.
- [x] Parcours catalogue `glisser-pour-ouvrir-le-planning` retiré, remplacé par
  `planning-hauteur-fixe` (`docRefs: [20]`).
- [x] Fichiers touchés : `E10Dashboard.tsx`(`.test.tsx`), `PlanningBoard.tsx`(`.test.tsx`),
  `App.test.tsx`, `manualTestsCatalog.ts`, `E01Welcome.tsx`.
- [x] Tests automatisés : absence de poignée / bouton replier-déplier, hauteur fixe sur les
  deux routes, défilement interne de la liste.
- [x] Test manuel Marie : parcours « Planning à hauteur fixe ».
- [x] Entrée `WHATS_NEW`.

Critère de sortie : sur l'accueil, le planning occupe une hauteur constante (325 px), sans
trait gris ni possibilité de le plier/déplier ; on fait défiler la liste des tâches à
l'intérieur. Suite complète, `tsc -b` et lint verts. **Atteint** (621 tests à la clôture de
la phase, `tsc -b` et lint verts). Non vérifié : rendu visuel des 325 px sur appareil réel.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — #18 : fond de case coloré sur toute la hauteur, sous-tâches incluses [FAIT]

- [x] Rendu d'une ligne restructuré : le `<div>` teinté interne (hauteur du contenu) est
  supprimé ; la teinte passe sur le conteneur de la ligne (`rowContainerStyle`), le `<button>`
  porte `rowStyle(duration_minutes)` — la couleur remplit donc toute la hauteur ∝ durée
  (44-160 px).
- [x] Le bloc des sous-tâches dépliées est passé **à l'intérieur** du conteneur teinté et hérite
  de `tint.color` : case + sous-tâches forment un seul aplat continu. `subTaskListStyle`
  re-padé (`0 12px 10px 54px`) pour aligner les sous-étapes et fermer l'aplat en bas.
- [x] Lisibilité des sous-tâches : `pastelBackground` reste un mélange clair à 22 %, texte en
  `--color-text` ; barré per-sous-étape conservé. Contraste raisonné, pas mesuré → test Marie.
- [x] Cas « terminé » conservé : fond plein `flashyBackground`, `color` blanc et
  `textDecoration: line-through` reportés sur le `<button>`.
- [x] Liste des tâches passée en `flex column` avec `gap: 6px` (les aplats se touchaient
  sinon, le padding du bouton ne les séparant plus).
- [x] Fichiers touchés : `PlanningBoard.tsx`(`.test.tsx`), `manualTestsCatalog.ts`,
  `E01Welcome.tsx`. `ambiance.ts` non modifié.
- [x] Tests automatisés : teinte sur le conteneur avec `minHeight` 80 px sur le bouton pour
  60 min et aucun fond sur le bouton ; sous-étapes dépliées contenues dans l'élément teinté ;
  cas terminé (fond non-`color-mix`, texte blanc, barré).
- [x] Test manuel Marie : parcours « Case de tâche colorée en entier » (`docRefs: [18]`).
- [x] Entrée `WHATS_NEW`.

Critère de sortie : chaque case de tâche du planning est colorée sur toute sa hauteur ; quand
on déplie ses sous-tâches, elles sont dans le même bloc coloré. Suite complète, `tsc -b` et
lint verts. **Atteint** (624 tests, `tsc -b` et lint verts). Non vérifié : contraste réel du
texte des sous-étapes sur couleur saturée. Dette pré-existante notée : bouton « Reporter »
imbriqué dans le bouton de ligne (HTML invalide, avertissement jsdom), hors périmètre #18.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — #19 : fond de la case des jours pleinement coloré [EN COURS]

- [ ] Donner au conteneur du bandeau de dates (`dateStripStyle`) un fond plein d'un aplat de
  la couleur d'ambiance (au lieu de la seule bordure). Ajuster l'opacité/mélange pour garder
  la lisibilité des libellés de jours.
- [ ] Revoir `dayCellStyle` : mise en évidence du jour affiché qui reste distincte sur ce
  nouveau fond (contraste, pastille), sans réintroduire une couleur qui jure.
- [ ] Aligner sur la décision 1 (fond du conteneur) et la décision 2 (couleur d'ambiance).
- [ ] Fichiers pressentis : `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`),
  `src/domain/data/manualTestsCatalog.ts`.
- [ ] Tests automatisés : le bandeau de dates a un fond non transparent dérivé de la couleur
  d'ambiance ; le jour affiché reste identifiable.
- [ ] Test manuel Marie (catalogue in-app) : parcours « Bandeau des jours coloré » — changer
  la couleur d'ambiance et vérifier que le fond du bandeau suit, pas seulement son contour.
- [ ] Entrée `WHATS_NEW`.

Critère de sortie : le bandeau des jours de la semaine a un fond plein à la couleur choisie ;
le jour affiché reste clairement repérable. Suite complète, `tsc -b` et lint verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — #21 : glissement interne des jours + grossissement au sélecteur [TODO]

- [ ] Séparer le bandeau en deux couches : une case fixe (fond + bordure, décision 1/3) et une
  piste interne contenant les jours, seule cette piste recevant la translation au glissement
  (`dragOffset`).
- [ ] Adapter `handleTouch*` et `dragOffset` pour ne transformer que la piste interne, la case
  restant immobile.
- [ ] Ajouter un effet d'échelle progressif sur le jour qui passe sous le sélecteur central
  (le plus proche du centre est le plus grossi), décision 3 pour l'intensité.
- [ ] Vérifier le débordement (overflow) : les jours qui sortent de la case sont masqués
  proprement.
- [ ] Fichiers pressentis : `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`),
  `src/domain/data/manualTestsCatalog.ts`.
- [ ] Tests automatisés (portée limitée, animation testée à la main) : au glissement, la case
  extérieure ne subit pas de `translateX` ; la piste interne oui. Le jour central porte un
  style d'échelle > 1.
- [ ] Test manuel Marie (catalogue in-app) : parcours « Défilement des jours dans la case » —
  glisser les jours et vérifier que la case ne bouge pas, que seuls les jours défilent, et que
  le jour au centre grossit.
- [ ] Entrée `WHATS_NEW`.

Critère de sortie : au glissement, la case des jours reste fixe et seuls les jours défilent à
l'intérieur ; le jour au niveau du sélecteur est visiblement agrandi. Suite complète, `tsc -b`
et lint verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — #22 : écran planning pleine page, vue semaine [TODO]

- [ ] Attendre la réponse de Marie sur les décisions 4 et 5 ; le message de demande a été rédigé le 2026-08-29, sans envoi.
- [ ] Trancher les décisions 4 et 5 (granularité de navigation, route) avant de coder.
- [ ] Ajouter un bouton « logo planning » à gauche du libellé du mois dans la barre du mois
  (`PlanningBoard.tsx:411-429`), cliquable.
- [ ] Créer l'écran pleine page « planning de la semaine » : bandeau des jours en haut
  (comme l'accueil), et sous chaque jour son planning ; les cases de tâche n'affichent que
  l'icône (décision 6).
- [ ] Reprendre la même navigation que l'accueil (glissement, bouton « Aujourd'hui »,
  sélecteur mois/année), selon décision 4.
- [ ] Route + câblage : `src/app/navigation.ts`, `src/App.tsx`,
  `src/ui/components/DevResetButton.tsx`.
- [ ] Extraire si besoin la partie « bandeau des jours » réutilisée entre l'accueil et cette
  vue plutôt que de la dupliquer (opportunité de refacto, à évaluer à ce moment-là).
- [ ] Fichiers pressentis : nouvel écran `src/ui/screens/dashboard/EXXWeekPlanning.tsx`
  (`.test.tsx`), `src/ui/screens/dashboard/PlanningBoard.tsx`, `src/app/navigation.ts`,
  `src/App.tsx`, `src/ui/components/DevResetButton.tsx`,
  `src/domain/data/manualTestsCatalog.ts`.
- [ ] Tests automatisés : le bouton logo ouvre l'écran semaine ; l'écran affiche 7 jours avec
  leurs tâches en icônes ; la navigation change la semaine (ou le jour) affichée.
- [ ] Test manuel Marie (catalogue in-app) : parcours « Vue planning de la semaine » — ouvrir
  la vue semaine par le logo, parcourir la semaine, vérifier que chaque jour montre ses tâches
  en logos.
- [ ] Entrée `WHATS_NEW`.

Critère de sortie : un logo à gauche du mois ouvre une page pleine écran montrant la semaine
entière, chaque jour avec son planning en cases-logos, navigable comme l'accueil. Suite
complète, `tsc -b` et lint verts.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
