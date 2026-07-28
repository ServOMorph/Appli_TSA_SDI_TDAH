# Roadmap — V5.0 (refonte accueil + modèle « outils »)

Version : 5.0 — créée 2026-07-28. Succède à `roadmap_v4.1.md` (V4.1 close). Branche : `v5.0`.
Source : `constats_2026-07-28.md` et `captures_2026-07-28.md` (dossier `Note de réunion/2026-07-28/`). Ne couvre que les évolutions issues de cette visio.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Arbitrages du 2026-07-28 (post-cadrage)

Tranchés avec l'utilisateur après production des constats. Ils priment sur la lettre de la demande de Marie ; les écarts assumés sont listés plus bas.

- **Q7 — Périmètre** : V5.0 = socle seul, phases V5-0 à V5-3. Les cinq outils spécialisés (Sentiments, Liste comptage, Comptes refondus, Routine, Tableau prévisions) partent en V5.1+. Motif : Marie n'a pas testé la V4.1, livrer sept phases sans retour d'usage reproduit le problème actuel en plus gros.
- **Q8 — Accueil et planning** : un seul écran à deux états. `E10Dashboard` absorbe `E40Planning`. Replié : planning à l'heure courante + bloc widgets. Déplié : planning entier scrollable, widgets masqués.
- **Q5 — Budget V4.1** : rebranché tel quel comme outil de type « tableau comptage » v1, posé sur l'accueil. Aucune refonte du modèle de données en V5.0 ; les colonnes configurables décrites par Marie (`E32`) sont traitées en V5.1 avec son retour d'usage.
- **Q9 — Arborescence** : un seul niveau de dossier (racine → dossier → outils). Pas de sous-dossier. Motif : la maquette de Marie (`C27`, `F1`, `C29`) contient huit outils tous à la racine et aucun dossier ; son seul exemple de sous-dossier est verbal et hypothétique.
- **Q10 — Grille du planning** : cases et lignes supprimées au repos, repères horaires révélés en fond léger **pendant un drag**, effacés au relâchement. Motif : Marie a arbitré un rendu en regardant une application de référence qui n'a pas de drag-and-drop (`C5` : l'heure s'y change par la fiche) ; elle a donc arbitré un geste sans le savoir.
- **Q11 — Récurrence** : modèle Google Agenda complet. Toute modification d'une occurrence pose la question « cette occurrence » / « toutes les occurrences ». Implique une entité d'exception.
- **Q12 — Bouton « + »** : crée directement une tâche, sans écran de choix. La saisie de dépense passe par le widget Comptes de l'accueil, en un tap. Motif : la phase V4.1-5 vient de supprimer exactement cette étape intermédiaire, et Marie a elle-même identifié que la profondeur d'accès tue l'usage (`E38`, l.1112-1113).
- **Q1 — Énergie** : sans objet. `energyRules.ts` implémente déjà la sémantique décrite par Marie (`EnergyEntry.value` = énergie disponible du jour, `plannedCost` = somme des coûts planifiés, `isOverloaded` quand le second dépasse le premier). Reste à afficher les deux nombres côte à côte.

### Écarts assumés à signaler à Marie

- Un seul niveau de dossier au lieu d'une arborescence libre (`Q9`).
- Le « + » ne propose pas « ajouter une dépense » (`Q12`).
- La grille réapparaît pendant le drag alors qu'elle l'a supprimée (`Q10`) — à lui **montrer**, pas à lui demander.
- Le budget qu'elle va découvrir n'a pas les colonnes configurables qu'elle a dessinées (`Q5`).

## Ordre & dépendances

```
V5-0 Refacto socle ──► V5-1 Nav + accueil fusionné ──► V5-2 Planning & tâches
                                                                │
                                                                └──► V5-3 Outils, dossiers,
                                                                          listes, budget rebranché
```

V5-2 avant V5-3 : `E29` (réveil sur un item de liste) réutilise le flux récurrente/ponctuelle produit par `E25`.

---

## Phase V5-0 — Refacto du socle de navigation et d'état [TODO]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Aucun changement de comportement visible.

- [ ] Découper `AppContext.tsx` (961 l., ~85 propriétés exposées) en contextes par domaine — tâches, listes, énergie, budget, outils (`src/app/AppContext.tsx`, nouveaux `src/app/contexts/*`)
- [ ] Remplacer l'union plate `Screen` (23 valeurs) par une route porteuse de paramètres et une pile de navigation ; nécessaire dès un niveau de dossier et pour le retour contextuel généralisé (`src/app/AppContext.tsx` l.31-53, `src/App.tsx`)
- [ ] Supprimer les retours codés en dur `taskCreateOrigin` / `listDetailOrigin` au profit de la pile (`src/app/AppContext.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/screens/lists/E61ListDetail.tsx`)
- [ ] Extraire de `E40Planning.tsx` (1049 l.) la logique de drag-and-drop et de calcul de créneaux, prérequis de la fusion `Q8` et de la grille révélée `Q10` (`src/ui/screens/planning/E40Planning.tsx`, nouveau `src/domain/rules/planningDragRules.ts`)
- [ ] Suite existante (474 tests) verte sans modification des assertions métier

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : application strictement iso-fonctionnelle, navigation à pile en place, aucun module d'état au-dessus de 300 lignes

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-1 — Navigation et écran d'accueil fusionné [TODO]

- [ ] `N1` (cf. C26, C27) — nav basse à 4 éléments : Boîte de réception, Accueil, Paramètres, bouton « + » ; retrait des onglets Dashboard / Outils / Planning / Listes (`src/ui/components/BottomNav.tsx`, `src/App.tsx`)
- [ ] `E19` + `Q8` (cf. C27, C31, C32) — fusion de `E40Planning` dans `E10Dashboard` : état replié planning à l'heure courante + bloc widgets, état déplié planning entier scrollable (`src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/planning/E40Planning.tsx`)
- [ ] `E18` (cf. C30, C31) — geste de dépliement par poignée, symétrique au repli (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [ ] **V4.1-6** — auto-scroll vertical de la grille pendant un drag actif, dette reprise de la roadmap V4.1 et devenue bloquante : sans elle le planning déplié n'est pas manipulable au doigt (`src/domain/rules/planningDragRules.ts`)
- [ ] `E14` + `Q1` (cf. C28) — affichage des deux valeurs d'énergie côte à côte (planifié | disponible) et pastille mode surcharge en tête d'accueil (`src/ui/components/EnergyDisplay.tsx`, `src/ui/components/BatteryIcon.tsx`)
- [ ] `E21` — pastille de surcharge claire quand inactive, intensifiée quand active, cliquable vers l'écran de récupération existant (`src/ui/screens/overload/E90OverloadRecovery.tsx`)
- [ ] `E24` (cf. C27, C29) — zone de widgets d'outils sur l'accueil, alimentée en V5-3 et vide à ce stade (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [ ] `E15` (cf. C24, C25) — boîte de réception repositionnée en entrée de nav, comportement inchangé (`src/ui/screens/tasks/E20Inbox.tsx`)
- [ ] `Q12` — le « + » conserve la création directe de tâche héritée de V4.1-5, sans écran de choix (`src/App.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`)
- [ ] Tests de nav, de dépliement, d'auto-scroll pendant drag, et de non-régression des points d'entrée existants

Gate : [ ] tests verts · [ ] test manuel (appareil tactile) · [ ] doc · [ ] sortie : un seul écran d'accueil déplie et replie le planning, une tâche se déplace au doigt jusqu'à n'importe quel créneau, aucun écran existant n'est devenu inatteignable

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-2 — Planning et tâches refondus [TODO]

- [ ] `D5` + `Q10` (cf. C14, C37) — suppression des cases et lignes horaires au repos ; repères horaires révélés en fond léger pendant un drag, effacés au relâchement (`src/ui/screens/dashboard/E10Dashboard.tsx`, `src/domain/rules/planningDragRules.ts`)
- [ ] `E1`, `D6` (cf. C1, C21) — ligne de tâche : logo, plage horaire, nom, coût en énergie, pastille de complétion à droite
- [ ] `D1`, `D2` (cf. C3, C4) — bandeau de dates avec jour réel souligné, point indiquant le jour affiché, navigation par appui et glissement
- [ ] `D4` — tâche cochée barrée et conservée (comportement déjà acté, à préserver) (`src/domain/rules/taskRulesV2.ts`)
- [ ] `E4` (cf. C7) — champ `icon` sur `TaskV2` et bibliothèque d'icônes restreinte (`src/domain/entities/taskV2.ts`, `src/data/db.ts` migration v7)
- [ ] `E3` (cf. C6) — champ `color` libre par tâche avec sélecteur de couleur complet (`src/domain/entities/taskV2.ts`)
- [ ] `E9` (cf. C34, C35) — écran de création : logo, nom, **sous-tâches puis description**, énergie, obligatoire ; `TaskV2.essential` couvre déjà « obligatoire », ne pas le renommer (`src/ui/screens/tasks/E21CreateTaskV2.tsx`, champ `description`)
- [ ] `E2` (cf. C2, C18, C22) — énergie saisie manuellement de 1 à 12, aucun calcul automatique par durée ; `ENERGY_MIN`/`ENERGY_MAX` existants déjà conformes (`src/domain/rules/energyRules.ts`)
- [ ] `E8`, `E11` (cf. C12, C13, C15) — saisie de durée par trois rouleaux jour / heure / minute, sur le même écran que l'heure de début, sans préréglages (`src/ui/screens/tasks/E21CreateTaskV2.tsx`)
- [ ] `E25` + `Q11` (cf. C36, C37) — choix tâche récurrente ou ponctuelle à la création ; récurrence sur le modèle Google Agenda (`src/domain/entities/taskV2.ts` champ `recurrence`, `src/domain/rules/taskRulesV2.ts`)
- [ ] `Q11` — entité d'exception d'occurrence et boîte de dialogue « cette occurrence » / « toutes les occurrences » à chaque modification d'une tâche récurrente, drag compris (`src/domain/entities/taskException.ts`, `src/data/db.ts`)
- [ ] `E5`, `E13` (cf. C5, C17, C39) — fiche tâche au clic avec dupliquer, supprimer, déplacer ; la duplication rouvre la création préremplie sur l'étape de planification (`src/ui/screens/tasks/E22TaskDetail.tsx`)
- [ ] `E10`, `E22` (cf. C19, C23) — sous-tâches avec compteur `n/N` dépliable et cochable depuis le planning (`src/domain/rules/subTaskRules.ts`)
- [ ] `E7` — vérifier qu'aucune donnée n'est préremplie à l'installation (`src/ui/screens/onboarding/*`)
- [ ] `E12` — retirer toute notion d'alerte du périmètre courant
- [ ] Migration Dexie v7 (`icon`, `color`, `description`, `recurrence`, exceptions) et tests de bords de récurrence

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : une tâche récurrente se crée, se déplace au doigt en choisissant occurrence ou série, et s'affiche avec logo et couleur sans quadrillage au repos

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-3 — Outils, dossiers, listes et budget rebranché [TODO]

- [ ] `E20` + `Q9` (cf. C27, C29, C39) — entité `Folder` à **un seul niveau** et entité `Tool` typée ; le « + » du bloc outils ajoute un outil ou un dossier (`src/domain/entities/folder.ts`, `src/domain/entities/tool.ts`, `src/data/db.ts` migration v8)
- [ ] `E26` (cf. C41, C42) — types d'outils déclarés ; seuls `liste` et `tableau comptage` sont implémentés en V5.0, les trois autres apparaissent grisés (`src/domain/entities/tool.ts`, `src/ui/screens/tools/E70Tools.tsx`)
- [ ] `E27` (cf. C43, C44) — outil Liste : coche qui s'intensifie, croix de suppression, items cochés relégués sous les non cochés ; champ `checked` sur `ListItem` (`src/domain/entities/listItem.ts`, `src/ui/screens/lists/E61ListDetail.tsx`)
- [ ] `E28` (cf. C43) — rubriques optionnelles regroupant les items d'une liste (`src/domain/entities/listItem.ts` champ `section`)
- [ ] `E29` (cf. C46) — icône réveil sur chaque item de liste ouvrant le seul choix récurrente / ponctuelle, en réutilisant le flux de V5-2 (`src/ui/screens/lists/E61ListDetail.tsx`)
- [ ] `E30` — To Do ramené à une liste créée d'office ; retirer le traitement spécial et le flag `pinned_to_tools` hérités de V4.1 (`src/ui/screens/tools/E70Tools.tsx`, `src/domain/entities/list.ts`)
- [ ] `Q5` — rebrancher `E71Budget` comme outil de type « tableau comptage », sans toucher à son modèle de données ni à ses règles (`src/ui/screens/tools/E71Budget.tsx`, `src/domain/entities/tool.ts`)
- [ ] `Q12` — widget Comptes sur l'accueil ouvrant la saisie de dépense en un tap (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [ ] `E24` — rendu effectif des widgets d'outils sur l'accueil, la zone posée en V5-1 étant désormais alimentée (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [ ] Tests de dossiers (création, rangement, suppression en cascade), de tri des items cochés, et de non-régression du budget V4.1 (e2e `08-tools-budget.spec.ts`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : un dossier contenant une liste se crée, la liste se coche, se trie et planifie un item ; le budget V4.1 reste intégralement accessible et fonctionnel depuis l'accueil

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Q à trancher

- `Q2` — nom définitif de l'outil Sentiments. Reporté avec l'outil en V5.1.
- `Q3` — renommage de l'outil de comptage (« joint » est ambigu). Reporté avec l'outil en V5.1.
- `Q4` — date des lignes de dépense, stockée ou non. Reporté avec la refonte des comptes en V5.1.
- `Q6` — liste comptage, un incrément par jour ou horodatage complet. Reporté avec l'outil en V5.1.

Aucune question ouverte ne bloque le démarrage de V5-0.

## Reporté en V5.1+

- `E23` — outil Sentiments (cf. C43, C47, C48).
- `E31`, `E31b`, `E38` — outil Liste comptage, raccourci d'incrément et vue statistique hebdomadaire (cf. C51, C52, C54, C58).
- `E32`, `E33`, `E34`, `E17` — refonte des comptes en tableaux à colonnes configurables, revenu en tête, livrets reliés, saisie de dépense depuis le « + » (cf. C50).
- `E35` — outil Routine (cf. C55).
- `E36`, `E36b`, `E37` — outil Tableau prévisions (cf. C56, C57, C58).

## Reporté hors V5

- `E6` — vue mois du planning.
- `E16` — boîte de réception en widget système.
- `E39` — anniversaires.
- `E40` — amis et cercles de proximité.
