# Roadmap — V5.0 (refonte accueil + modèle « outils »)

Version : 5.0 — créée 2026-07-28. Succède à `roadmap_v4.1.md` (V4.1 close). Branche : `v5.0`.
**Close le 2026-08-07 — V5-0 à V5-3 `[FAIT]`. Successeur : `roadmap_v5.1.md`**, qui reprend le backlog outils et les Q non tranchées listés en fin de fichier.
Source : `constats_2026-07-28.md` et `captures_2026-07-28.md` (dossier `COMMUNICATION/Note de réunion/2026-07-28/`). Ne couvre que les évolutions issues de cette visio.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Arbitrages du 2026-07-28 (post-cadrage)

Tranchés avec l'utilisateur après production des constats. Ils priment sur la lettre de la demande de Marie ; les écarts assumés sont listés plus bas.

- **Q7 — Périmètre** : V5.0 = socle seul, phases V5-0 à V5-3. Les cinq outils spécialisés (Sentiments, Liste comptage, Comptes refondus, Routine, Tableau prévisions) partent en V5.1+. Motif : Marie n'a pas testé la V4.1, livrer sept phases sans retour d'usage reproduit le problème actuel en plus gros.
- **Q8 — Accueil et planning** : un seul écran à deux états. `E10Dashboard` absorbe `E40Planning`. Replié : planning à l'heure courante + bloc widgets. Déplié : planning entier scrollable, widgets masqués.
- **Q5 — Budget V4.1** : rebranché tel quel comme outil de type « tableau comptage » v1, posé sur l'accueil. Aucune refonte du modèle de données en V5.0 ; les colonnes configurables décrites par Marie (`E32`) sont traitées en V5.1 avec son retour d'usage.
- **Q9 — Arborescence** : un seul niveau de dossier (racine → dossier → outils). Pas de sous-dossier. Motif : la maquette de Marie (`C27`, `F1`, `C29`) contient huit outils tous à la racine et aucun dossier ; son seul exemple de sous-dossier est verbal et hypothétique.
- **Q10 — Grille du planning et modification d'une tâche** : révisé le 2026-07-28 (post-communication) — pas de glisser-déposer. Cases et lignes supprimées définitivement, comme dans l'application de référence. Une tâche se modifie en cliquant dessus pour ouvrir sa fiche, où chaque champ (date, horaire, alerte, énergie...) est cliquable et ouvre son propre sélecteur — cf. `COMMUNICATION/Note de réunion/2026-07-28/Capture pendant la visio/Capture d'écran 2026-07-28 160841.png`. Tranché directement avec l'utilisateur.
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

## Phase V5-2b — Planning et tâches refondus [FAIT]

Note : les références de ce checklist à `taskV2.ts`/`taskRulesV2.ts`/`subTaskRules.ts`/migration
« v7 » datent d'avant la fusion V5-2a et sont obsolètes — l'entité unique est `task.ts` /
`taskRules.ts`, et la migration réelle est **v9** (v7/v8 déjà consommées par V5-2a).

- [x] `D5` + `Q10` (cf. C14, C37) — suppression définitive des cases et lignes horaires, planning épuré comme l'application de référence (`src/ui/screens/dashboard/PlanningBoard.tsx`) — codé et testé (unitaires + e2e), validation manuelle en cours
- [x] `E1`, `D6` (cf. C1, C21) — ligne de tâche : icône, horaire, nom, coût en énergie, pastille de complétion à droite (`PlanningBoard.tsx`)
- [x] `D1`, `D2` (cf. C3, C4) — bandeau de dates avec jour réel souligné, point indiquant le jour affiché, navigation par appui, glissement tactile et sélecteur de date pour le déplacement rapide (`PlanningBoard.tsx`, `planningSlotRules.ts`)
- [x] `D4` — tâche cochée barrée et conservée (comportement préservé au rendu sans quadrillage)
- [x] `E4` (cf. C7) — champ `icon` restreint (`Task.icon`, `src/domain/rules/taskAppearance.ts` : 15 icônes SVG internes, `src/ui/components/IconPicker.tsx`)
- [x] `E3` (cf. C6) — champ `color` libre par tâche avec sélecteur complet (`Task.color`, `src/ui/components/ColorPicker.tsx`, `<input type="color">`)
- [x] `E9` (cf. C34, C35) — écran de création redessiné : logo, nom, sous-tâches puis description, énergie, obligatoire (`src/ui/screens/tasks/E21CreateTaskV2.tsx`)
- [x] `E2` (cf. C2, C18, C22) — énergie manuelle 1-12, aucun calcul automatique (déjà conforme, `energyRules.ts`, inchangé)
- [x] `E8`, `E11` (cf. C12, C13, C15) — durée par trois rouleaux jour/heure/minute sur le même écran que l'heure de début, sans préréglages (`src/ui/components/DurationRoller.tsx`, `E21CreateTaskV2.tsx`)
- [x] `E25` + `Q11` (cf. C36, C37) — choix récurrente/ponctuelle à la création, récurrence type Google Agenda (quotidien/hebdo/mensuel/annuel, intervalle, fin par date ou nombre) — `src/domain/entities/taskRecurrence.ts`, `src/domain/rules/taskRecurrenceRules.ts`, `src/ui/components/RecurrenceEditor.tsx`, matérialisation des occurrences sur 90 jours (`usePlanningState.createDetailedTask`)
- [x] `Q11` — boîte de dialogue « cette occurrence » / « toutes les occurrences » à chaque modification/suppression d'une tâche récurrente depuis sa fiche (`E22TaskDetail.tsx`, `usePlanningState.updateTaskFields`/`deleteTaskScoped`). Simplification assumée : l'entité `TaskException` (`src/domain/entities/taskException.ts`) existe en base mais n'est pas encore utilisée par cette UI — la détection « cette occurrence » repose sur `Task.recurrence_exception`, suffisant tant que les occurrences sont toutes matérialisées à l'avance (pas de régénération différée)
- [x] `E5`, `E13`, `Q10` (cf. C5, C17, C39) — fiche tâche au clic, **seul** point de modification (pas de glisser-déposer) : champs titre/icône/couleur/date/horaire/énergie cliquables, actions dupliquer/supprimer (`E22TaskDetail.tsx`) ; flux tap-based du planning (menu Déplacer/Renommer/Supprimer) entièrement retiré, tap sur une ligne planning ouvre directement la fiche. `E12` retire la notion d'alerte du périmètre (pas de champ alerte dans la fiche, conforme).
- [x] `E10`, `E22` (cf. C19, C23) — sous-tâches avec compteur `n/N` dépliable et cochable depuis le planning (`PlanningBoard.tsx`) ; une sous-tâche conserve la possibilité d'un horaire propre, réglable depuis la fiche parente (`E22TaskDetail.tsx`, `E23Decompose.tsx`)
- [x] `E7` — vérifié qu'aucune donnée n'est préremplie à l'installation (`src/ui/screens/onboarding/*`, `useSettingsState.ts`, `db.ts`) — **M6 clos**
- [x] `E12` — aucune notion d'alerte dans la fiche tâche ni dans la création (hors périmètre, conforme)
- [x] Migration Dexie **v9** (`icon`, `color`, `description`, `duration_minutes`, `recurrence_id`, `is_recurrence_root`, `recurrence_exception`, tables `taskRecurrences`/`taskExceptions`) et tests de bords de récurrence (`taskRecurrenceRules.test.ts`, 18 tests : intervalles, fins par date/nombre, mois courts)

Gate : [x] tests verts (488/488 unitaires, `tsc -b`/lint clean) · [x] test manuel (point 3.2 validé le 2026-08-06, `tests_manuels.md` purgé) · [x] doc (`CHANGELOG.md`) · [x] sortie — planning épuré sans grille en place, un seul modèle de tâche, récurrence Google Agenda fonctionnelle, aucune donnée préremplie à l'installation (M6)

Phase close le 2026-08-06.

M5 close côté code le 2026-08-05 : planning épuré sans quadrillage (liste par tâche, bandeau de dates avec navigation par appui/glissement/sélecteur de date), sous-tâches dépliables avec compteur n/N, flux tap-based entièrement retiré au profit de la fiche. Écran « Aujourd'hui » (`E24Today`) retiré (décidé avec l'utilisateur — redondant avec la section « Tâche du jour » déjà sur l'accueil). Bug trouvé et corrigé en validation manuelle : sur une occurrence déjà détachée d'une série (`recurrence_exception: true`), la modifier à nouveau en choisissant « Toutes les occurrences » ne la mettait pas à jour elle-même (`usePlanningState.ts`, filtre de ciblage excluait à tort l'occurrence cliquée) — corrigé, testé automatiquement, retest manuel confirmé sans défaut le 2026-08-06.

Session 2026-08-06 (retours de tests manuels traités) : bandeau du planning revu (mois affiché en permanence et cliquable ouvrant le sélecteur de date natif, bouton « Aujourd'hui », contour parasite des lignes retiré, date affichée préservée à la navigation vers la fiche tâche, dates au format français), icône Paramètres du TopBar retirée. Deux bugs fonctionnels signalés en test manuel (suppression d'une tâche récurrente sans effet, ajout de sous-tâche impossible depuis une tâche existante) sont finalement **clos comme non reproductibles** : ni par lecture de code, ni par tests automatisés Playwright, ni par un second test manuel de l'utilisateur (mauvaise manipulation lors du premier signalement) — aucun correctif appliqué. Point 3.2 (sous-tâches dépliables, tactile réel) validé le même jour, `tests_manuels.md` purgé intégralement. M5 clos côté validation manuelle.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V5-3 — Outils, dossiers, listes et budget rebranché [FAIT]

- [x] `E20` + `Q9` (cf. C27, C29, C39) — entité `Folder` à **un seul niveau** et entité `Tool` typée ; le « + » du bloc outils ajoute un outil ou un dossier (`src/domain/entities/folder.ts`, `src/domain/entities/tool.ts`, `src/data/db.ts` migration **v10**)
- [x] `E26` (cf. C41, C42) — types d'outils déclarés ; seuls `liste` et `tableau comptage` sont implémentés en V5.0, les trois autres apparaissent grisés (`src/domain/entities/tool.ts`, `src/ui/components/ToolCreateModal.tsx`)
- [x] `E27` (cf. C43, C44) — outil Liste : coche qui s'intensifie, croix de suppression, items cochés relégués sous les non cochés ; champ `checked` sur `ListItem` (`src/domain/entities/listItem.ts`, `src/domain/rules/listItemSortRules.ts`, `src/ui/screens/lists/E61ListDetail.tsx`)
- [x] `E28` (cf. C43) — rubriques optionnelles regroupant les items d'une liste (`ListItem.section`, `groupListItemsBySection` dans `listItemSortRules.ts`)
- [x] `E29` (cf. C46) — icône réveil sur chaque item de liste ouvrant le choix récurrente / ponctuelle (date + heure requises), en réutilisant `createDetailedTask` de V5-2 (`src/ui/screens/lists/E61ListDetail.tsx`)
- [x] `E30` — To Do ramenée à une liste comme les autres, créée d'office (migration v10 et, pour une installation neuve où l'upgrade ne s'exécute pas, `useSettingsState.seedDefaultToolsIfMissing`) ; `pinned_to_tools` et `E60Lists.tsx` retirés, remplacés par le modèle dossiers/outils (`E70Tools.tsx`, `E72FolderDetail.tsx`)
- [x] `Q5` — `E71Budget` rebranché comme outil de type « tableau comptage », code interne inchangé, atteint via une carte outil au lieu du bouton codé en dur (`src/ui/screens/tools/E71Budget.tsx` non modifié, `src/ui/screens/tools/E70Tools.tsx`)
- [x] `Q12` — widget Comptes sur l'accueil ouvrant la saisie de dépense en un tap (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [x] `E24` — rendu effectif des widgets d'outils (dossiers + outils racine) sur l'accueil, la zone posée en V5-1 étant désormais alimentée (`src/ui/screens/dashboard/E10Dashboard.tsx`)
- [x] Tests de dossiers (création, rangement, suppression en cascade), de tri/rubriques des items, de la migration v10 (seed) et de non-régression du budget (unitaires + e2e `08-tools-budget.spec.ts` inchangé côté comportement + nouveau `09-tools-folders-lists.spec.ts`)

Gate : [x] tests verts (501/501 unitaires, 57/57 e2e, `tsc -b`/lint/build clean) · [x] test manuel (6 points de `tests_manuels.md` validés, fichier purgé) · [x] doc (`CHANGELOG.md`) · [x] sortie — outils/dossiers/listes/budget en place, aucun écran ne perd son point d'entrée

Phase close le 2026-08-07.

Décision architecturale prise en cours de phase : le checklist V5-3 ne citait plus `E60Lists.tsx` ni la route `lists`, cohérent avec E20 (les listes ne s'ajoutent plus que via le « + » du bloc outils). `E60Lists.tsx` et la route `lists` ont été supprimés ; la carte « Listes » du dashboard a fusionné dans les widgets d'outils génériques. Décision validée avec l'utilisateur avant codage (mode plan).

Défaut trouvé et corrigé en cours de route : le réveil d'un item (E29) ne fixait pas d'heure de début (`startTime: null`) ; or `scheduleTask` n'assigne `scheduled_date` que si une heure est fournie, rendant la tâche créée invisible sur le planning. Champ « Heure » ajouté à la mini-modale, requis pour planifier.

Session 2026-08-06 (suite 3, bugs trouvés en validation manuelle réelle) : blocage bloquant à l'ouverture trouvé et corrigé — la migration Dexie v10 appelait `crypto.randomUUID()` directement (`src/data/db.ts`), API indisponible hors contexte sécurisé ; testé en HTTP sur l'IP réseau (`run.py` → `npm run dev -- --host`), l'exception non interceptée dans `AppContext.tsx` (`init()` sans `try/catch`) laissait l'app bloquée indéfiniment sur « Chargement... ». Corrigé par un repli local identique à celui de `newId()` (`repositories.ts`) ; `try/catch/finally` ajouté autour de `init()` pour qu'une erreur future ne bloque plus jamais silencieusement l'écran de chargement. Trois défauts UI trouvés lors du test manuel du point 1-2 (`tests_manuels.md`) et corrigés : carte « Outils » redondante sur l'accueil retirée (doublon avec le titre de section) ; outil de type liste affichait le libellé générique « Liste » au lieu du nom réel (« To Do »), source de la confusion rapportée ; bouton « + » de création déplacé de l'écran Outils (`E70Tools.tsx`) vers l'accueil (`E10Dashboard.tsx`), zone Outils passée en grille 3 colonnes. Bug de navigation retour trouvé et corrigé : `E71Budget.tsx` forçait `goTo('tools')` au lieu de dépiler la pile réelle — remplacé par `back('dashboard')`. Clarification actée avec l'utilisateur après relecture de `constats_2026-07-28.md` : le widget « Comptes » de l'accueil reste inchangé, correctement rattaché au domaine budget (E33/E34) et distinct de l'outil « Comptage » (E31, reporté V5.1) — non renommé. 500/500 tests unitaires, `tsc -b`/lint clean. Points 1-2 de `tests_manuels.md` restent à revalider par l'utilisateur sur les écrans corrigés ; points 3-6 non encore testés.

Session 2026-08-07 (validation manuelle des 6 points de `tests_manuels.md`) : 5 points sur 6 validés sans défaut. Point 5 (widget « Comptes ») en échec — le bouton était `disabled` tant qu'aucune catégorie budgétaire de type « dépense » n'existait, sans aucun retour visuel, confirmé par l'utilisateur (fonctionnement rétabli après création d'une catégorie). Corrigé : bouton toujours actif, un clic sans catégorie de dépense ouvre un message dédié invitant à en créer une dans le Budget (`E10Dashboard.tsx`), test dédié ajouté. 501/501 tests unitaires, `tsc -b` clean. Point 5 revalidé par l'utilisateur avec le correctif le même jour, `tests_manuels.md` vidé intégralement. Phase V5-3 close, roadmap V5.0 (V5-0 à V5-3) intégralement terminée.

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

- Résolu le 2026-08-05 : le bug d'export non déchiffré présupposait à tort que le chiffrement local pouvait être actif. Constat élargi en session — `local_encryption` n'était accessible depuis aucun écran et les repositories ne recevaient jamais de mot de passe en production : le chiffrement n'a jamais été fonctionnel. Décidé avec l'utilisateur : retiré entièrement (`src/crypto/`, paramètres `password` des repositories, champ `Settings.local_encryption`) plutôt qu'implémenté. `exportData()` n'a plus besoin de correctif.
