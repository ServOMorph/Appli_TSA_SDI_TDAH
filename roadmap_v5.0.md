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
- **Q10 — Grille du planning et modification d'une tâche** : révisé le 2026-07-28 (post-communication) — pas de glisser-déposer. Cases et lignes supprimées définitivement, comme dans l'application de référence. Une tâche se modifie en cliquant dessus pour ouvrir sa fiche, où chaque champ (date, horaire, alerte, énergie...) est cliquable et ouvre son propre sélecteur — cf. `Note de réunion/2026-07-28/Capture pendant la visio/Capture d'écran 2026-07-28 160841.png`. Tranché directement avec l'utilisateur.
- **Q11 — Récurrence** : modèle Google Agenda complet. Toute modification d'une occurrence pose la question « cette occurrence » / « toutes les occurrences ». Implique une entité d'exception.
- **Q12 — Bouton « + »** : crée directement une tâche, sans écran de choix. La saisie de dépense passe par le widget Comptes de l'accueil, en un tap. Motif : la phase V4.1-5 vient de supprimer exactement cette étape intermédiaire, et Marie a elle-même identifié que la profondeur d'accès tue l'usage (`E38`, l.1112-1113).
- **Q1 — Énergie** : sans objet. `energyRules.ts` implémente déjà la sémantique décrite par Marie (`EnergyEntry.value` = énergie disponible du jour, `plannedCost` = somme des coûts planifiés, `isOverloaded` quand le second dépasse le premier). Reste à afficher les deux nombres côte à côte.

### Écarts assumés à signaler à Marie

- Un seul niveau de dossier au lieu d'une arborescence libre (`Q9`).
- Le « + » ne propose pas « ajouter une dépense » (`Q12`).
- Aucun glisser-déposer sur le planning : toute modification (y compris la date) passe par la fiche de la tâche (`Q10`).
- Le budget qu'elle va découvrir n'a pas les colonnes configurables qu'elle a dessinées (`Q5`).

## Ordre & dépendances

```
V5-0 Refacto socle ──► V5-1 Nav + accueil fusionné ──► V5-2a Refacto modèle de tâches
                                                                │
                                                                └──► V5-2b Planning & tâches
                                                                          │
                                                                          └──► V5-3 Outils, dossiers,
                                                                                    listes, budget rebranché
```

V5-2a avant V5-2b : les sous-étapes sur une tâche planifiée (`E9`, `E10`, `E22`) supposent un modèle de tâche unique.
V5-2b avant V5-3 : `E29` (réveil sur un item de liste) réutilise le flux récurrente/ponctuelle produit par `E25`.

---

## Phase V5-0 — Refacto du socle de navigation et d'état [FAIT]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Aucun changement de comportement visible.

- [x] Découper `AppContext.tsx` (961 l., ~85 propriétés exposées) en contextes par domaine — tâches, listes, énergie, budget, outils (`src/app/AppContext.tsx`, nouveaux `src/app/contexts/*`)
- [x] Remplacer l'union plate `Screen` (23 valeurs) par une route porteuse de paramètres et une pile de navigation ; nécessaire dès un niveau de dossier et pour le retour contextuel généralisé (`src/app/AppContext.tsx` l.31-53, `src/App.tsx`)
- [x] Supprimer les retours codés en dur `taskCreateOrigin` / `listDetailOrigin` au profit de la pile (`src/app/AppContext.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/screens/lists/E61ListDetail.tsx`)
- [x] Extraire de `E40Planning.tsx` (1049 l.) la logique de calcul de créneaux, prérequis de la fusion `Q8` (`src/ui/screens/planning/E40Planning.tsx`, nouveau `src/domain/rules/planningSlotRules.ts`)
- [x] Suite existante (474 tests) verte sans modification des assertions métier — 515/516 au run de clôture (+42 tests), seul échec le flaky pré-existant `AppContext.test.tsx` (confirmé identique sur le code d'avant refacto)

Gate : [x] tests verts · [x] test manuel (points 83-100, `tests_manuels.md` purgé) · [x] doc (`CHANGELOG.md`) · [x] sortie : application strictement iso-fonctionnelle (53/53 e2e), navigation à pile en place, aucun module d'état au-dessus de 300 lignes (`AppContext.tsx` 961→169 l., plus gros module `useTasksState.ts` 205 l.)

Bug trouvé et corrigé en validation manuelle : `push()` (`navigation.ts`) remontait à tort vers une occurrence antérieure du même écran dans la pile, tronquant les niveaux intermédiaires quand un écran sans paramètre différenciant (ex. `task-create-v2`) était réutilisé deux fois dans un même flux — cassait le retour contextuel (ex. depuis Aujourd'hui, la destination « Tâche du jour » n'était plus forcée après un second passage par la création). Clause de collapse supprimée ; `push` empile simplement désormais. Régression verrouillée par un test dédié (`navigation.test.ts`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-1 — Navigation et écran d'accueil fusionné [FAIT]

- [x] `N1` (cf. C26, C27) — nav basse à 4 éléments : Boîte de réception, Accueil, Paramètres, bouton « + » ; retrait des onglets Dashboard / Outils / Planning / Listes (`src/ui/components/BottomNav.tsx`, `src/App.tsx`)
- [x] `E19` + `Q8` (cf. C27, C31, C32) — fusion de `E40Planning` dans `E10Dashboard` : état replié planning à l'heure courante + bloc widgets, état déplié planning entier scrollable (`src/ui/screens/dashboard/E10Dashboard.tsx`, nouveau `src/ui/screens/dashboard/PlanningBoard.tsx` ; `src/ui/screens/planning/` supprimé)
- [x] `E18` (cf. C30, C31) — geste de dépliement par poignée, symétrique au repli (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [x] `E14` + `Q1` (cf. C28) — affichage des deux valeurs d'énergie côte à côte (planifié | disponible) et pastille mode surcharge en tête d'accueil (`src/ui/components/EnergyDisplay.tsx`, `getEnergyPairLabel` dans `energyRules.ts`)
- [x] `E21` — pastille de surcharge claire quand inactive, intensifiée quand active, cliquable vers l'écran de récupération existant (`src/ui/components/TopBar.tsx`)
- [x] `E24` (cf. C27, C29) — zone de widgets d'outils sur l'accueil ; en V5-1 porte deux entrées provisoires (Outils, Listes), remplacées par les vrais widgets en V5-3 (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [x] `E15` (cf. C24, C25) — boîte de réception repositionnée en entrée de nav, comportement inchangé (`src/ui/screens/tasks/E20Inbox.tsx`)
- [x] `Q12` — le « + » conserve la création directe de tâche héritée de V4.1-5, sans écran de choix (`src/App.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`)
- [x] Tests de nav, de dépliement et de non-régression des points d'entrée existants (auto-scroll pendant drag sans objet, glisser-déposer supprimé — voir arbitrage ci-dessous)

Gate : [x] tests verts (514/515 unitaires, seul échec le flaky pré-existant `AppContext.test.tsx` reproduit à l'identique sur le code d'avant V5-1 ; 53/53 e2e ; `tsc -b`, lint et build clean) · [x] test manuel (appareil tactile, points 101-109 de `tests_manuels.md`, validés le 2026-08-02) · [x] doc (`CHANGELOG.md`) · [x] sortie technique : un seul écran d'accueil déplie et replie le planning, aucun écran existant n'est devenu inatteignable

Phase close le 2026-08-02. 3 défauts trouvés en validation manuelle et corrigés :
- `E20Inbox.tsx` : titre `<h1>` « Todo » → « Réception » (résidu du renommage nav Todo→Outils de la Phase V4.1-0, jamais corrigé sur cet écran).
- `index.html` : `lang="en"` → `lang="fr"`, cause racine des deux anomalies restantes. La page anglaise déclenchait la traduction automatique de Chrome sur une UI française — celle-ci remplace les nœuds texte du DOM et casse la réconciliation React, d'où « Replier » affiché « Répondeur » et la pastille d'énergie figée jusqu'au changement d'écran (React perd la référence du nœud texte traduit).

Arbitrages pris en cours de phase, au-delà de ceux tranchés au démarrage :
- **Absorption complète de la route `planning`** : elle rend désormais l'accueil fusionné en état déplié plutôt que de conserver un écran séparé. `E40Planning.tsx` supprimé, son corps extrait dans `PlanningBoard.tsx`. Les six flux qui appelaient `goTo('planning')` (inbox, création, fiche tâche, décomposition, report) fonctionnent sans modification.
- **Suppression anticipée du glisser-déposer** (prévu par `Q10` en V5-2) : ~250 lignes retirées pendant la fusion plutôt que portées puis supprimées à la phase suivante. Le déplacement d'une tâche passe par le menu « Déplacer » déjà en place.
- **Pastille de surcharge** : navigue vers le centre de récupération quand active, ouvre la modale explicative quand inactive — préserve le comportement `E7` au lieu de le remplacer.
- **Poignée de dépliement** : placée sous le planning en état replié, au-dessus en état déplié (défaut trouvé en e2e — bannière de planification et nav fixes la recouvraient en bas de page).
- **`outDir`** : `dist/v4.1` → `dist/v5.0`, résidu de version aligné sur la branche active (même correctif que le 2026-07-25 sur v4.1).
- **e2e T44** : réaffecté de « Terminer la tâche depuis le Planning » (sans objet après fusion) à la pastille de surcharge (`E21`). Suite toujours à 53 scénarios.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-2a — Refacto : unification du modèle de tâches [FAIT]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Phase insérée le 2026-08-02, au démarrage de V5-2. Motif : le code portait **deux modèles de tâches parallèles** — `Task`/`SubTask` (réception, journée, `E22TaskDetail`, `E23Decompose`, sans énergie ni obligatoire) et `TaskV2` (planning, avec énergie et obligatoire, sans sous-étapes). Or `E9`, `E10` et `E22` de la phase V5-2 supposent tous qu'une tâche planifiée porte des sous-étapes. Implémenter V5-2 sur ce socle aurait dupliqué le système de sous-étapes au lieu de le poser une fois. Chantier trop large pour être absorbé silencieusement dans la phase fonctionnelle (règle de la section Roadmap du kit), d'où une phase de refacto dédiée. L'ancienne phase V5-2 devient V5-2b.

Aucun changement de comportement visible.

- [x] Entité `Task` unique absorbant `SubTask` et `TaskV2` : `parent_id` (null = tâche principale), `essential`, `energy_cost`, `postponed`, créneau ; `TaskStatus` = `inbox | today | planned | completed` (`src/domain/entities/task.ts`, `subTask.ts` et `taskV2.ts` supprimés)
- [x] `taskRules.ts` : fusion de `taskRulesV2.ts` et `subTaskRules.ts`, suffixes `V2` retirés, ajout de `isCompleted`/`isSubTask`/`getSubTasks`/`getSubTaskCounts`/`uncompleteTask` (`src/domain/rules/taskRules.ts`)
- [x] `TaskRepository` unique remplaçant les trois repositories ; `getByStatus`/`getTodayTasks` excluent les sous-étapes, ajout de `getChildren`/`getRootByDate`/`getChildrenByDate`/`deleteWithChildren` (`src/data/repositories/taskRepository.ts`)
- [x] Migration Dexie v7 (fusion des trois tables, rattachement `parent_id`, conversion de statut, écartement des sous-étapes orphelines) puis v8 (suppression de `subTasks` et `tasksV2`) (`src/data/db.ts`)
- [x] `useTasksState` et `usePlanningState` opèrent sur la collection unique, API du contexte inchangée pour ne pas propager le refacto aux écrans
- [x] Écrans adaptés aux types unifiés, sans changement de rendu (`E20Inbox`, `E22TaskDetail`, `E23Decompose`, `E24Today`, `E10Dashboard`, `PlanningBoard`, `E21CreateTaskV2`)
- [x] Fabriques de tests partagées (`src/test/factories.ts`) remplaçant sept fabriques dupliquées ; test de migration v6 → v8 ; couverture du filtrage racine/sous-étape et du chiffrement au réordonnancement

Gate : [x] tests verts (509/509 unitaires, 53/53 e2e, `tsc -b`/lint/build clean) · [x] test manuel (points 110-117 de `tests_manuels.md`, validés le 2026-08-04, fichier purgé) · [x] doc (`CHANGELOG.md`) · [x] sortie : un seul modèle de tâche en base, `subTasks` et `tasksV2` disparus, application strictement iso-fonctionnelle

Défaut latent trouvé et corrigé en chemin : `TaskRepository.reorder()` réencryptait un titre déjà chiffré (lecture brute en base puis passage par `update()`), corrompant le titre au réordonnancement quand le chiffrement local est actif. Préexistant à cette phase, révélé par l'unification (`SubTaskRepository.reorder()` écrivait correctement en base, pas `TaskRepository`). Verrouillé par un test.

Phase close le 2026-08-04. Point 111 (validation manuelle) a révélé une régression indépendante de la migration : le « + » de l'accueil (`E10Dashboard`, écran `dashboard` depuis la fusion V5-1) rouvrait l'écran de choix de destination au lieu de créer directement la tâche, `FORCED_DESTINATION_BY_ORIGIN` (`E21CreateTaskV2.tsx`) n'ayant pas d'entrée pour l'origine `dashboard` — contraire à `Q12`. Corrigé (`dashboard: 'planned'`), test dédié ajouté, 509/509 unitaires verts. Point 110 (perte apparente de tâches à l'ouverture) : non reproductible, infirmé par l'export (`export-audhd-2026-08-04.json`, toutes les tâches antérieures au 2026-07-31 présentes) — écran d'affichage vide transitoire au chargement, pas une perte de données ; résolu par rechargement complet de l'UI.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-2b — Planning et tâches refondus [TODO]

- [ ] `D5` + `Q10` (cf. C14, C37) — suppression définitive des cases et lignes horaires, planning épuré comme l'application de référence (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [ ] `E1`, `D6` (cf. C1, C21) — ligne de tâche : logo, plage horaire, nom, coût en énergie, pastille de complétion à droite
- [ ] `D1`, `D2` (cf. C3, C4) — bandeau de dates avec jour réel souligné, point indiquant le jour affiché, navigation par appui et glissement
- [ ] `D4` — tâche cochée barrée et conservée (comportement déjà acté, à préserver) (`src/domain/rules/taskRulesV2.ts`)
- [ ] `E4` (cf. C7) — champ `icon` sur `TaskV2` et bibliothèque d'icônes restreinte (`src/domain/entities/taskV2.ts`, `src/data/db.ts` migration v7)
- [ ] `E3` (cf. C6) — champ `color` libre par tâche avec sélecteur de couleur complet (`src/domain/entities/taskV2.ts`)
- [ ] `E9` (cf. C34, C35) — écran de création : logo, nom, **sous-tâches puis description**, énergie, obligatoire ; `TaskV2.essential` couvre déjà « obligatoire », ne pas le renommer (`src/ui/screens/tasks/E21CreateTaskV2.tsx`, champ `description`)
- [ ] `E2` (cf. C2, C18, C22) — énergie saisie manuellement de 1 à 12, aucun calcul automatique par durée ; `ENERGY_MIN`/`ENERGY_MAX` existants déjà conformes (`src/domain/rules/energyRules.ts`)
- [ ] `E8`, `E11` (cf. C12, C13, C15) — saisie de durée par trois rouleaux jour / heure / minute, sur le même écran que l'heure de début, sans préréglages (`src/ui/screens/tasks/E21CreateTaskV2.tsx`)
- [ ] `E25` + `Q11` (cf. C36, C37) — choix tâche récurrente ou ponctuelle à la création ; récurrence sur le modèle Google Agenda (`src/domain/entities/taskV2.ts` champ `recurrence`, `src/domain/rules/taskRulesV2.ts`)
- [ ] `Q11` — entité d'exception d'occurrence et boîte de dialogue « cette occurrence » / « toutes les occurrences » à chaque modification d'une tâche récurrente depuis sa fiche (`src/domain/entities/taskException.ts`, `src/data/db.ts`)
- [ ] `E5`, `E13`, `Q10` (cf. C5, C17, C39) — fiche tâche au clic, seul point de modification (pas de glisser-déposer) : champs date, horaire, alerte, énergie cliquables ouvrant chacun leur sélecteur ; actions dupliquer, supprimer, déplacer ; la duplication rouvre la création préremplie sur l'étape de planification (`src/ui/screens/tasks/E22TaskDetail.tsx`)
- [ ] `E10`, `E22` (cf. C19, C23) — sous-tâches avec compteur `n/N` dépliable et cochable depuis le planning (`src/domain/rules/subTaskRules.ts`)
- [ ] `E7` — vérifier qu'aucune donnée n'est préremplie à l'installation (`src/ui/screens/onboarding/*`)
- [ ] `E12` — retirer toute notion d'alerte du périmètre courant
- [ ] Migration Dexie v7 (`icon`, `color`, `description`, `recurrence`, exceptions) et tests de bords de récurrence

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : une tâche récurrente se crée, se modifie via sa fiche en choisissant occurrence ou série, et s'affiche avec logo et couleur sans quadrillage

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

- `Q2` — résolu le 2026-07-28 : l'outil se nomme « Météo du jour » (au lieu de « Sentiments »). Nom acté, implémentation reportée avec l'outil en V5.1.
- `Q3` — résolu le 2026-07-28 : l'outil se nomme « Comptage » (au lieu de « joint »). Nom acté, implémentation reportée avec l'outil en V5.1.
- `Q4` — date des lignes de dépense, stockée ou non. Reporté avec la refonte des comptes en V5.1.
- `Q6` — liste comptage, un incrément par jour ou horodatage complet. Reporté avec l'outil en V5.1.

Aucune question ouverte ne bloque le démarrage de V5-0.

## Reporté en V5.1+

Ordre de priorité tranché le 2026-07-28 : Comptage en premier.

- `E31`, `E31b`, `E38` — outil **Comptage** (ex-« joint »), raccourci d'incrément et vue statistique hebdomadaire (cf. C51, C52, C54, C58). **Priorité 1.**
- `E23` — outil **Météo du jour** (ex-« Sentiments ») (cf. C43, C47, C48).
- `E32`, `E33`, `E34`, `E17` — refonte des comptes en tableaux à colonnes configurables, revenu en tête, livrets reliés, saisie de dépense depuis le « + » (cf. C50).
- `E35` — outil Routine (cf. C55).
- `E36`, `E36b`, `E37` — outil Tableau prévisions (cf. C56, C57, C58).

## Reporté hors V5

- `E6` — vue mois du planning.
- `E16` — boîte de réception en widget système.
- `E39` — anniversaires.
- `E40` — amis et cercles de proximité.
- Réglage « Réduire les animations » (`E112Accessibility.tsx`) : la mécanique fonctionne (`html.reduce-motion` force les durées à 0ms) mais n'a presque rien à couper — l'interface est construite quasi entièrement en style inline statique, sans animation d'apparition ni transition d'écran. Seuls cas concrets identifiés : fondu d'opacité d'un bouton désactivé (`Button.tsx`, 150ms) et animation de drag lors du réordonnancement de tâches (`dnd-kit`, `E10Dashboard.tsx`/`E23Decompose.tsx`). Angle mort produit constaté lors du test manuel V5-0 (point 97), pas une régression. À retravailler : soit enrichir l'interface d'animations pour lesquelles ce réglage aurait un sens, soit accepter l'état actuel.

## Bugs constatés (hors périmètre V5-0, à corriger séparément)

- `exportData()` (`useSettingsState.ts:66`) lit `db.energyEntries.toArray()` directement au lieu de passer par `EnergyEntryRepository`. La table `energyEntries` stocke `value` en texte, avec chiffrement optionnel selon `local_encryption` (`EnergyEntryRepository.ts:17-21`) ; seul le repository sait le déchiffrer/parser (`decryptValue`). Conséquence : l'export sort la valeur brute stockée — une chaîne numérique lisible si `local_encryption` est désactivé, mais du **texte chiffré illisible** si activé, rendant `energy_entries[].value` inexploitable dans l'export. Constaté lors du test manuel V5-0 (point 98) sur `export-audhd-2026-07-30.json`. Correctif : faire passer `exportData` par `energyRepo` (ou une méthode de listage déchiffrée équivalente) au lieu de la table Dexie brute.
