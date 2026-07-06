## v3.0 — 2026-07-06

### Contexte
- Bascule vers la roadmap V3 (`roadmap_v3.md`, racine) — succède à `roadmap_v2.md` (archivée dans `Archives/`). Branche git `v3` créée à partir de `v2`.

### Décidé
- Q1 tranché avec Marie : suppression de la limite de 3 tâches/jour.
- Q2 tranché : retirer le segment nav "Aujourd'hui" du dashboard sans remplacement, et renommer l'option de création "Aujourd'hui" en "Tâche du jour".
- Stratégie de reset des données V2 tranchée : Marie accepte le reset, pas de migration nécessaire au bump Dexie v3.

## v2.1 — 2026-07-06

### Modifié
- Commande `/analyse_visio` réécrite : 2 fichiers de sortie (constats + roadmap) au lieu de 4, règle de non-duplication (analyse code portée sur les items de roadmap plutôt qu'en fichier séparé), gate compact en une ligne par phase.
- `roadmap_v3.md` régénérée au nouveau format : 7 phases (V3-0 à V3-6) au lieu de 10, contenu identique.

## v2.0 — 2026-07-06

### Contexte
- Versioning du CHANGELOG réaligné sur la version produit (roadmap) au lieu d'un compteur `v0.x` indépendant qui prêtait à confusion avec V1/V2/V3. Major = numéro de la roadmap active à la racine (`roadmap_v2.md` → major 2) ; minor incrémenté à chaque `/close`, remis à 0 au passage à une roadmap majeure suivante (V3). Les entrées `v0.x` ci-dessous restent inchangées (historique non réécrit).

### Ajouté
- Commande `/analyse_visio <dossier-réunion>` (`.claude/commands/analyse_visio.md`) : automatise l'analyse d'une visio testeur (transcription + captures + code) et génère constats, analyse de code, plan d'implémentation et roadmap versionnée (bump auto du numéro de version, format à cases à cocher).
- Roadmap V3 (`Note de réunion/2026-06-07/roadmap_v3.md`) créée à partir de la visio Marie du 2026-07-06 : refonte énergie (coût par tâche, "cuillères"), tâches obligatoires, surcharge automatique, nettoyage dashboard/planning/listes, navigation persistante. 10 phases, aucune démarrée.

## v0.44 — 2026-07-06

### Corrigé
- Export JSON (RGPD) incomplet — `exportData` omettait les tables V2 (`tasksV2`, `lists`, `listItems`), en contradiction avec la mention "intégralité de vos données". Corrigé, version export passée à `2.0`.

### Modifié
- Planning : granularité des créneaux passée d'1h à 30 min (48 créneaux) ; durée par défaut à l'assignation ramenée à 30 min.
- `vite.config.ts` : `build.outDir` fixé à `dist/v2` (au lieu de sortir dans `dist/` racine).

### Validé
- E2e relancés après les changements onboarding : 45/45, aucune régression.
- Test manuel 11.5 (export des données sur iPhone) validé.

## v0.43 — 2026-07-06

### Ajouté
- Contexte complet de la question énergie consigné pour la prochaine réunion Marie (`Note de réunion/a traiter prochaine reunion.txt`).

### Modifié
- Tests manuels 2.4, 2.6, 6.7, 6.10, 7.3, mode sombre et 11.2 validés (`roadmap_v2.md`).

### Décidé
- Profil (`E111Profile`) : reste en lecture seule, aucune modification à implémenter.
- Énergie : décision non tranchée en interne, remontée à Marie pour retour.

### Supprimé
- Section "Stimulation cognitive" des Paramètres retirée intégralement (écran `E113Stimulation`, entrée menu, champ `Settings.stimulation_mode`, CSS `data-stimulation`).

## v0.42 — 2026-07-06

### Corrigé
- Conflit de créneau dans Planning : le clic sur un créneau déjà occupé ouvrait à tort le déplacement de l'autre tâche au lieu de refuser la tâche en attente ; message de refus affiché en modale plutôt qu'en bannière.
- Libellés du profil (`E111Profile`) : correspondaient à d'anciennes valeurs (`audhd`/`asd`/`adhd`) au lieu des vraies valeurs `ProfileType` (`teenager`/`student`/`adult`), affichant une valeur brute non traduite.

### Ajouté
- Écran détail tâche (`E22TaskDetail`) : actions "Aujourd'hui", "Planifier" et "Liste", cohérentes avec l'écran Todo.
- Navigation directe vers le détail de la liste après y avoir ajouté une tâche (Todo, création de tâche, détail tâche).
- Écran Aujourd'hui : bouton "Ajouter une tâche".
- Dashboard, section "Planning du jour" : bouton "Terminer" par tâche (la tâche terminée sort de la liste).
- Listes : renommage et suppression (avec confirmation).
- Planning : grille horaire étendue à 24h (0h-23h) au lieu de 6h-22h.

### Modifié
- Dashboard : message d'état vide de l'action immédiate remplacé par "Rien à faire aujourd'hui" quand Aujourd'hui est vide.

### Supprimé
- Section "Organisation" des Paramètres et écran `E114Organisation` retirés intégralement.
- Icône Planning de la TopBar retirée (redondante avec la nav segmentée du Dashboard).

---

## v0.41 — 2026-07-06

### Corrigé
- Tri de la section "Planning du jour" (Dashboard) par `scheduled_start`.
- Création de liste depuis le sélecteur "Ajouter à une liste" (Todo et création de tâche) : la tâche est désormais rattachée à la liste nouvellement créée, directement dans la modale.
- Détection de conflit de créneau dans Planning : placement/déplacement d'une tâche sur un créneau déjà occupé refusé avec message explicite (décision produit actée).
- Perte silencieuse des sous-tâches lors de la conversion Todo → Planifier/Liste : avertissement de confirmation ajouté avant la conversion.

### Ajouté
- Roadmap : section "Fonctionnalité reportée" pour la planification indépendante des sous-tâches, décision explicitement différée.

---

## v0.40 — 2026-07-06

### Modifié
- Onboarding : un utilisateur qui quitte l'app avant d'atteindre le dashboard repart de zéro à la prochaine ouverture (`User.onboarding_completed`, `completeOnboarding`) au lieu de reprendre directement sur le dashboard.
- Écran de choix de profil (`E02Profile`) : bouton "Ignorer" retiré, sélection d'un profil désormais obligatoire.

### Ajouté
- Plan de test manuel V2 (`plan_test_manuel_v2.md`) : 13 sections, ~65 cas, basé sur les écrans réellement implémentés.

### Corrigé
- Écarts constatés lors du passage du plan de test consolidés dans `roadmap_v2.md` § "Constats test manuel V2-10" : 4 bugs confirmés (tri "Planning du jour", rattachement de tâche à la création de liste, absence de détection de conflit de créneau, perte de sous-tâches à la conversion Todo→Planifier/Liste), 2 décisions produit à prendre, 4 fonctionnalités manquantes, 2 demandes de nettoyage UI, 10 points à retester.

---

## v0.39 — 2026-07-05

### Modifié
- Mode surcharge du Dashboard rendu minimaliste : masquage des icônes TopBar (Planning/Ressources/Paramètres), du chip énergie, du bouton "Ajouter une tâche", de la nav segmentée et des sections "Planning du jour"/"Tâches du jour" quand le mode surcharge est actif.

### Ajouté
- Bouton "Sortir du mode surcharge" en pied de page du Dashboard, même style que le bouton actif en haut.

### Corrigé
- Filtre mort `essential` sur le planning du jour supprimé (il n'était jamais atteignable, `toggleEssentialV2` n'étant câblée nulle part dans l'UI).

---

## v0.38 — 2026-07-05

### Corrigé
- E2E `05-overload.spec.ts` (T40/T44/T45) : assertions réécrites pour matcher le bandeau surcharge réel (`<p>Mode surcharge actif</p>`) au lieu d'un `heading` inexistant. 45/45 e2e passent désormais, aucune régression sur les changements récents.

### Modifié
- Réorganisation des dossiers de build à la racine : `dist_v1/` fusionné dans `dist/` — `dist/v1/` (versionné, rollback V1) et `dist/v2/` (ignoré Git, régénérable via `npm run build`).

---

## v0.37 — 2026-07-05

### Modifié
- Écran de création de tâche (`E21CreateTaskV2`) : destination "À planifier plus tard" remplacée par "Mettre dans une liste" (ouvre un sélecteur de liste, crée un `ListItem`).

### Ajouté
- Écran de création de tâche : destination "Aujourd'hui" (crée directement une tâche du jour, avec la même règle de remplacement à 3 tâches que sur l'écran Todo).

### Corrigé
- Statut `to_plan` (TaskV2) retiré du domaine — il n'avait plus aucune voie de création après le point ci-dessus, ce qui rendait mort l'écran `E50ToPlanQueue`, la pastille "Tâches à planifier" du dashboard et `moveTaskToLaterV2`. Tout retiré proprement (décision de nettoyage validée).

---

## v0.36 — 2026-07-03

### Corrigé
- Bug racine SubTask : `toggleSubTask` n'était appelée nulle part dans l'UI — aucune sous-tâche ne pouvait jamais être marquée terminée, ce qui bloquait le badge "X/Y" du Dashboard à "0/Y" et empêchait "Prochaine étape" d'avancer. Checkbox fonctionnelle ajoutée dans `E22TaskDetail`/`E23Decompose`.

### Ajouté
- Badge de progression "X/Y" des sous-tâches sur `E20Inbox` (Todo) et `E24Today` (Aujourd'hui), en plus du Dashboard.
- "Prochaine étape : {titre}" affichée sur `E24Today`, comme sur le Dashboard.

### Modifié
- `E24Today` : bouton "Voir le Todo" retiré.

---

## v0.35 — 2026-07-03

### Modifié
- Écran Planning (`E40Planning`) : ajout d'un bouton "Valider" explicite — un clic sur une tâche ne valide plus immédiatement le placement (retour utilisateur : comportement non intuitif).
- Flux "Planifier" (Todo ou création directe) transporte désormais l'id de la tâche créée jusqu'à Planning : taper un créneau vide affiche directement la confirmation de placement de cette tâche, sans lister toutes les tâches non planifiées.
- Bouton "Planifier" de la nav segmentée du dashboard renommé "Planning".

---

## v0.34 — 2026-07-02

### Ajouté
- Écran Todo (`E20Inbox`) : actions "Planifier" et "Liste" par tâche, en plus de "Aujourd'hui" — convertissent la tâche vers `TaskV2`/`ListItem` au moment du clic et vident Todo.
- Pastille rouge sur le bouton "Todo" du dashboard dès qu'une tâche est en attente.

### Modifié
- Le système V1 `Task` (inbox→today, sous-tâches, action immédiate) reste le moteur du dashboard — pas d'unification sur `TaskV2`, conversion à l'action à la place.

### Corrigé
- Fonctionnalité Routines (V2-8) retirée intégralement — jamais demandée explicitement par Marie (écrans, règles, repositories, entités, tables Dexie supprimés).
- Collision de nommage V1/V2 "plus tard" résolue — système V1 "À faire plus tard" (`E25Later`, statut `later`) retiré, seul `to_plan` (V2) subsiste.
- Bug orphelin : la destination "Todo" de `E21CreateTaskV2` créait des `TaskV2` jamais affichées nulle part — crée maintenant une `Task` V1 cohérente avec l'écran Todo. Écran `E21CreateTask` (V1) devenu inaccessible, supprimé.
- `deleteAllData` ne vidait jamais la table `tasksV2` — corrigé.

---

## v0.33 — 2026-07-02

### Modifié
- `roadmap_v2.md` : note ajoutée sous Phase V2-8 — l'onglet "Routines" dédié n'a pas été demandé explicitement par Marie (sa maquette dessinée et ses notes écrites décrivent les routines comme un type de liste, pas une entité séparée). À retirer ou fusionner dans Listes, décision à trancher.
- `_contexte/signals.md` : action P1 ajoutée pour cette décision.

---

## v0.32 — 2026-07-01

### Modifié
- `_contexte/signals.md` : diagnostic d'un signalement utilisateur ("tâche 'à planifier plus tard' invisible") — pas un bug, collision de nommage entre deux systèmes distincts (V1 `Task`/`later` vs V2 `TaskV2`/`to_plan`). Documenté en action ouverte avec 3 options de résolution, à trancher la prochaine session.

---

## v0.31 — 2026-07-01

### Modifié
- `vitest.config.ts` : exclusion `dist_v1/**`/`e2e/**` du calcul de couverture (polluaient le rapport à 0%) — couverture réelle mesurée : 95.48% lignes / 91.74% branches / 89.11% fonctions (seuil 85% dépassé).
- `roadmap_v2.md` : Phase V2-10 — item "refacto d'architecture, dead code, couverture ≥85%" clos.

### Corrigé
- `src/domain/rules/taskRules.ts` : suppression de `TASK_TODAY_MAX`/`canAddToToday`, dead code V1 confirmé (aucune limite quotidienne appliquée nulle part dans l'app) — 392/392 tests après nettoyage.

---

## v0.30 — 2026-07-01

### Ajouté
- Phase V2-9 — Refonte page d'accueil : icône agenda dans `TopBar.tsx` (`onPlanningClick`, accès direct au planning), boutons "Planifier"/"Listes" ajoutés à la nav segmentée du dashboard.
- `E10Dashboard.tsx` : nouvelle section "Planning du jour" (mini, `TaskV2`+`Routine` du jour triés par heure), masquant les tâches `essential=false` en mode surcharge.
- 8 tests ajoutés (396/396 total, pool par défaut).

### Corrigé
- Navigation orpheline (`task-create-v2`) : bouton "Ajouter une tâche" du dashboard repointé vers le flux 3-destinations. Vérifié sans régression : les e2e T11-T19 passent par le bouton propre à `E20Inbox`, indépendant de celui du dashboard.

### Modifié
- `roadmap_v2.md` : V2-9 close (mécanique + test manuel TM-01 à TM-06 validés) ; test manuel V2-7 (12 TM) et TM-07/08 de V2-8 validés en cascade, débloqués par la nouvelle nav.
- `README.md` : état actuel et prochaine étape mis à jour (V2-10).

---

## v0.29 — 2026-07-01

### Ajouté
- Phase V2-8 — Routines (matin/soir) : `E70Routines.tsx` (liste, création nom/type/durée), `E71RoutineDetail.tsx` (étapes cochables, réservation de créneau).
- `src/domain/rules/routineRules.ts` : règles pures `createRoutine`/`createRoutineStep`/`scheduleRoutine`/`toggleRoutineStep`.
- `Routine` (entité) : ajout `scheduled_date`/`scheduled_start` optionnels.
- `AppContext.tsx` : state et méthodes routines, branchées sur `RoutineRepository`/`RoutineStepRepository` existants.
- `E40Planning.tsx` : affichage des routines planifiées comme bloc distinct dans la grille horaire.
- Dashboard : segment nav "Routines".
- 25 tests ajoutés (390/390 total). Test manuel TM-01 à TM-06 validé.

### Corrigé
- Roadmap : gate commun complété (point 7 — vérifier qu'un écran livré ne perd pas son accès navigable) suite à la découverte d'une régression silencieuse (`task-create-v2` orphelin depuis le revert e2e du 2026-06-30, planning inaccessible par navigation réelle).

### Modifié
- `roadmap_v2.md` : V2-8 close (mécanique + TM-01 à TM-06) ; V2-7 test manuel formellement reporté V2-9 ; TM-07/08 V2-8 reportés V2-9 ; angles morts "Navigation orpheline" documenté.

---

## v0.28 — 2026-07-01

### Ajouté
- Phase V2-7 — Listes (référentiel personnel) : `E60Lists.tsx` (page listes, création à la volée), `E61ListDetail.tsx` (détail liste, ajout/suppression d'élément).
- `src/domain/rules/listRules.ts` : règles pures `createList`/`createListItem`.
- `AppContext.tsx` : state et méthodes listes (`lists`, `createList`, `deleteList`, `getListItems`, `addListItem`, `deleteListItem`), branchées sur `ListRepository`/`ListItemRepository` existants.
- 28 tests ajoutés (365/365 total).

### Modifié
- `roadmap_v2.md` : Phase V2-7 close (mécanique) ; suggestion de liste depuis le flux d'ajout de tâche reportée V2-9.

---

## v0.27 — 2026-06-30

### Modifié
- `TopBar.tsx` : bouton "Mode surcharge" isolé en haut (top-right), prop `overloadActive`, `aria-pressed`, style actif/inactif distinct ; chip énergie seul dans la seconde ligne.
- `E10Dashboard.tsx` : toggle instantané surcharge sans navigation — bandeau "Mode surcharge actif" + accès Centre récupération inline ; suppression branche full-page overload.
- `E10Dashboard.test.tsx` : tests mode surcharge D10B réécrits + enrichis (337/337).
- `roadmap_v2.md` : Phase V2-6 close (mécanique [x] ; masquage `essential=false` différé V2-9).

---

## v0.26 — 2026-06-30

### Corrigé
- Dette e2e V1→V2 soldée : 46/46 tests Playwright passent (était 2/46).
- `01-onboarding.spec.ts`, `helpers/reset.ts` : `Commencer` → `Entrer` (vocabulaire V2-1).
- `03-energy.spec.ts` : `souffle` → `énergie`.
- `02-tasks.spec.ts`, `06-offline.spec.ts` : `Inbox` → `Todo`, `Plus tard` → `À faire plus tard`, aria-labels alignés.
- `E20Inbox.tsx` : bouton "Ajouter une tâche" revert sur `task-create` (V1) — incohérence corrigée (le bouton créait des TaskV2 invisibles dans l'inbox V1). `E21CreateTaskV2` sera reconnecté en V2-7/V2-9.

### Infrastructure
- Tests unitaires : 336/336 ✓. Tests e2e : 46/46 ✓.

---

## v0.25 — 2026-06-30

### Ajouté
- `E50ToPlanQueue.tsx` : écran file "À planifier" séquentielle — affiche 1re tâche `to_plan`, choix date/heure, planifier/arrêter, page de fin.
- `E50ToPlanQueue.test.tsx` : 12 tests (file vide, tâche affichée, champs, enchaînement, interruption).
- `AppContext` : screen `'to-plan-queue'`, state `toPlanTasks` (chargé dans `loadAll`, retiré après `scheduleV2Task`).

### Modifié
- `E10Dashboard.tsx` : pastille rouge "À planifier" → `goTo('to-plan-queue')` si `toPlanTasks.length > 0`.
- `App.tsx` : route `'to-plan-queue'` → E50ToPlanQueue.
- `testUtils.tsx` : mock `toPlanTasks: []`.
- `DevResetButton.tsx` : entrées manquantes `'task-create-v2'`, `'planning'`, `'to-plan-queue'` (fix build TypeScript).
- `roadmap_v2.md` : Phase V2-5 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-5 close, dette e2e P0, V2-6 prochaine.

### Infrastructure
- Tests unitaires : 336/336 ✓ (45 fichiers test).
- ⚠ Tests e2e : 44/46 échouent — specs V1 périmées (cherchent "Commencer", bouton dit "Entrer" depuis V2-1). À corriger en priorité.

---

## v0.24 — 2026-06-30

### Ajouté
- `E40Planning.tsx` : vue Planning — grille 6h–22h, scroll auto heure courante, navigation précédent/suivant, picker de placement et de déplacement de tâches.
- `E40Planning.test.tsx` : 11 tests (navigation, placement, déplacement, picker vide).
- `AppContext` : screen `'planning'` + `scheduleV2Task` / `getPlannedTasksForDate` / `getUnscheduledPlannedTasks`.

### Modifié
- `E21CreateTaskV2.tsx` : "Planifier" navigue vers `'planning'` (corrige le placeholder inbox).
- `App.tsx` : route `'planning'` → E40Planning.
- `testUtils.tsx` : 3 nouvelles fonctions mock.
- `roadmap_v2.md` : Phase V2-4 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-4 close, V2-5 prochaine.

### Infrastructure
- Tests : 324/324 ✓ (44 fichiers test).

---

## v0.23 — 2026-06-30

### Ajouté
- `E21CreateTaskV2.tsx` : écran d'ajout V2 avec 3 destinations obligatoires (Todo / Planifier / À planifier plus tard), validation bloquée si destination non choisie.
- `AppContext` : `createTaskV2Dest(title, status)` + screen `'task-create-v2'`.
- `E21CreateTaskV2.test.tsx` : 11 tests (3 chemins + cas limites).

### Modifié
- `E20Inbox.tsx` : bouton "Ajouter une tâche" pointe vers `'task-create-v2'`.
- `App.tsx` : route `'task-create-v2'` ajoutée.
- `testUtils.tsx` : mock `createTaskV2Dest` ajouté.
- `roadmap_v2.md` : Phase V2-3 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-3 close, V2-4 prochaine.

### Infrastructure
- Tests : 313/313 ✓ (43 fichiers test).

---

## v0.22 — 2026-06-29

### Ajouté
- `TaskV2`, `List`, `ListItem`, `Routine`, `RoutineStep` : entités domaine v2.
- `taskRulesV2.ts` : règles métier v2 (createTaskV2, scheduleTaskV2, completeTaskV2, moveTaskToLaterV2, toggleEssentialV2).
- Repositories v2 : `TaskV2Repository`, `ListRepository`, `ListItemRepository`, `RoutineRepository`, `RoutineStepRepository`.
- `_contexte/archive_decisions.md` : archive des décisions 2026-06-25 déplacées hors de `contexte.md`.

### Modifié
- `db.ts` : version(2) + tables v2 en parallèle de v1 (sans breaking change).
- `roadmap_v2.md` : Phase V2-2 cochée [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2-2 close, V2-3 prochaine.

### Infrastructure
- Tests : 301/301 ✓ (42 fichiers test, dont 5 fichiers V2 nouveaux).

---

## v0.21 — 2026-06-29

### Ajouté
- `dist_v1/` : archive build V1 pour rollback immédiat.

### Modifié
- Vocabulaire UI V2-1 : "souffle" → "énergie", "Inbox" → "Todo", "Plus tard" → "À faire plus tard" (8 composants, 6 fichiers de tests).
- `roadmap_v2.md` : Phases V2-0 et V2-1 cochées [x].
- `_contexte/signals.md`, `contexte.md`, `README.md` : état V2 en cours mis à jour.

### Infrastructure
- Tag `v1.0-mvp` posé sur le dernier commit `main`.
- Branche `v2` créée depuis `main`.

---

## v0.20 — 2026-06-29

### Ajouté
- `roadmap_v2.md` : roadmap V2 complète (11 phases, pilotée par retours Marie).
- `Archives/roadmap_v1.md` : roadmap V1 archivée.
- `Note de réunion/synthese_reunion_marie_2026-06-29.md` : synthèse session test utilisateur.
- `Note de réunion/analyse_conduite_visio_marie.md` : méthodo prochaines visios.

### Modifié
- `_contexte/signals.md`, `contexte.md` : état V2 prête à démarrer, reset données acté.
- `README.md` : état actuel mis à jour (Phase 7 en cours, V2 cadrée).

---

## v0.19 — 2026-06-25

### Ajouté
- `public/images/welcome-hero.png` : image générée pour l’écran de bienvenue.

### Modifié
- `E01Welcome.tsx` : écran de bienvenue refondu autour de l’image et du bouton `Entrer`, sans scroll mobile.
- `E02Profile.tsx` : âges retirés des choix de profil.
- `_contexte/`, `README.md` : clôture session alignée sur l’onboarding préparé pour test utilisateur.

### Validé
- `npm run test -- E01Welcome E02Profile`, `npm run lint`, `npm run build` : OK.
- Preview mobile 390x844 : écran bienvenue sans scroll, image chargée, bouton visible.

---

## v0.18 — 2026-06-25

### Modifié
- `_contexte/`, `README.md` : clôture session Phase 7 mise à jour autour du test utilisateur distant
- Décision actée : connexion Google hors périmètre immédiat, à réévaluer avec la sync V2

### Validé
- `npm run build` : build production OK et dossier `dist/` régénéré pour dépôt manuel Netlify

---

## v0.17 — 2026-06-25

### Ajouté
- `TopBar.tsx` : bouton icône document “Ressources” ajouté au dashboard
- `E120Resources.tsx` : nouvel écran ressources avec fondements de conception, mode d’emploi de l’application et liens utiles en attente
- `E120Resources.test.tsx` : couverture du nouvel écran ressources

### Modifié
- `App.tsx`, `AppContext.tsx`, `DevResetButton.tsx` : route `resources` et code écran E120 branchés
- `E10Dashboard.tsx` / `E10Dashboard.test.tsx` : navigation dashboard → ressources ajoutée et testée
- `_contexte/`, `README.md`, `roadmap.md` : clôture session mise à jour

### Corrigé
- `E22TaskDetail.tsx`, `E23Decompose.tsx` : dépendances `useEffect` complétées pour validation ESLint
- `DevResetButton.tsx` : appel `useApp()` rendu non conditionnel

### Validé
- `npm run lint`, `npm run build`, `npm run test` : 259/259 tests passent
- `npm run test:e2e` : 46/46 scénarios passent sans serveur manuel

---

## v0.16 — 2026-06-25

### Corrigé
- `E22TaskDetail.test.tsx` : assertion sous-étape alignée sur l'item drag-and-drop visible
- `E10Dashboard.test.tsx`, `E30EnergyView.test.tsx`, `E03Energy.test.tsx` : assertions restantes "cuillères" → "souffle"
- `vitest.config.ts` : Vitest limité aux tests `src/` pour exclure les specs Playwright `e2e/`
- `.claude/commands/start.md`, `.claude/commands/close.md` : détection des fichiers `roadmap*.md`

### Validé
- `npm run test` : 253/253 tests passent
- E2E Playwright : 46/46 scénarios passent avec preview lancé manuellement

---

## v0.15 — 2026-06-25

### Modifié
- `E10Dashboard.tsx`, `E30EnergyView.tsx`, `E31EnergyCheckIn.tsx`, `E03Energy.tsx` : "cuillères" → "souffle" (terme énergie)
- `e2e/03-energy.spec.ts` : libellés mis à jour ("cuillères" → "souffle")
- `E10Dashboard.tsx` : padding Card "Que faire maintenant?" 24px → 12px ; SortableTaskItem police 0.75rem + spacing-xs
- `src/index.css` : --spacing-12: 12px ajouté

### Corrigé
- `AppContext.tsx` : addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi après décomposition d'une tâche

---

## v0.14 — 2026-06-25

### Ajouté
- `src/ui/components/TopBar.tsx` : nouveau composant — titre « Appli pour AuDHD », pill énergie, pill surcharge, roue ⚙ paramètres
- `run_dev.py` / `run_prod.py` : scripts de lancement dev/prod avec `--host` (accès mobile réseau local)
- `SERVEURS.md` : liens localhost PC + mobile (192.168.1.180)

### Modifié
- `E10Dashboard.tsx` : refacto sans scroll — TopBar + nav segmentée (Inbox / Aujourd'hui / Plus tard) remplace 7 boutons empilés
- `E10Dashboard.test.tsx` : tests adaptés aux nouveaux libellés (26/26)
- `e2e/*.spec.ts` + `helpers/reset.ts` : libellés remappés (Tableau de bord → Appli pour AuDHD, Mon énergie → pill, Activer mode surcharge → Activer le mode surcharge)

### Corrigé
- `AppContext.tsx` : `taskId` → `_taskId` dans `reorderSubTasks` (erreur TS6133 bloquant le build prod)
- Fix scroll latéral mobile validé en build prod (overflow-x: clip, DevResetButton absent) ✅

---

## v0.13 — 2026-06-25

### Corrigé
- Scroll latéral mobile : `overflow-x: clip` sur html/body — neutralise le débordement du sr-only dnd-kit (-1px) que `overflow-x: hidden` ne bloquait pas

---

## v0.12 — 2026-06-25

### Ajouté
- `AppContext.tsx` : `taskDetailOrigin` state — mémorise l'écran d'origine pour corriger la navigation retour depuis E22
- Braille dots ⠿ sur cartes E10 et sous-tâches E22/E23 (indicateur drag)
- Drag-and-drop des sous-tâches dans E22 (dnd-kit, pattern optimiste identique E23)
- Bouton supprimer (×) sur chaque sous-tâche dans E22

### Corrigé
- E22 : sous-tâche supprimée encore visible dans E10 → `refreshDashboard()` après `deleteSubTask`
- E22 : bouton Retour naviguait vers E24 au lieu de E10 lors d'une navigation depuis le dashboard

### Modifié
- E110–E117, E30–E31 : bouton "← Retour" déplacé en haut des écrans (harmonisation pattern E22)
- Tests E110–E117 : `getByText('Retour')` → `getByRole('button', { name: 'Retour' })`

---

## v0.11 — 2026-06-25

### Corrigé
- `src/app/AppContext.tsx` : fallback UUID v4 via `crypto.getRandomValues` — `crypto.randomUUID()` indisponible hors HTTPS (accès mobile par IP locale)

### Modifié
- `roadmap.md` : Phase 6 clôturée `[x]`
- `README.md` : état actuel mis à jour (Phase 6 close, Phase 7 à démarrer)

---

## v0.10 — 2026-06-25

### Ajouté
- Suite E2E Playwright : 46 tests (onboarding, tâches, énergie, settings, surcharge, offline/SW/IndexedDB)
- `playwright.config.ts` : configuration Playwright webServer vite preview + Chromium headless
- `e2e/` : 6 fichiers de tests + helper reset/onboarding
- `package.json` : scripts `test:e2e`, `test:e2e:headed`, `test:e2e:report`

---

## v0.9 — 2026-06-25

### Ajouté
- `AppContext.test.tsx` : +3 describe blocks couvrant inbox ops, sous-tâches, settings/données (241 tests, 99.34% couverture)

### Corrigé
- Repositories (user, settings, task, subTask, energyEntry) : fix `erasableSyntaxOnly` TS 5.8+ (déclaration explicite des champs privés)
- `E117Export.test.tsx` : fix act() warning sur handleExport async
- `taskRules.test.ts` : suppression import inutilisé TASK_TODAY_MAX
- `vitest.config.ts` : DevResetButton exclus de la couverture (composant dev-only)

### Modifié
- `README.md` : Phase 6 code complète, 241 tests, 99.34% couverture

---

## v0.8 — 2026-06-25

### Ajouté
- `src/ui/screens/settings/` : E110–E114, E116, E117 + tests (paramètres, accessibilité, stimulation, export, suppression)
- `src/ui/screens/overload/E90OverloadRecovery.tsx` + tests : centre récupération, désactivation surcharge
- `AppContext.tsx` : settings state, updateSettings, exportData, deleteAllData, 8 nouveaux écrans
- `src/index.css` : dark-mode class, reduce-motion class, stimulation mode CSS (calm/dynamic)
- `E10Dashboard.tsx` : bouton "Activer mode surcharge" (nav normale) + "Centre récupération" (mode surcharge)

### Corrigé
- Font sizes : small=13px / medium=16px / large=22px (différences perceptibles)
- E90 : suppression "Retour au dashboard" — créait une boucle sans possibilité de sortir du mode surcharge

---

## v0.7 — 2026-06-25

### Ajouté
- `src/ui/screens/energy/E30EnergyView.tsx` + tests : affichage énergie du jour (3 états : null / filled / skipped)
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` + tests : check-in grille 1-10, skip, pré-sélection, 8 tests
- `AppContext.tsx` : Screen + 'energy-view'/'energy-checkin', state todayEnergyStatus ('filled'|'skipped'|null)
- `DevResetButton.tsx` : sélecteur date simulée (localStorage dev_fake_date) pour tests J+1 en DEV

### Modifié
- `src/App.tsx` : +2 routes energy-view / energy-checkin
- `src/ui/screens/dashboard/E10Dashboard.tsx` : badge énergie cliquable, encart CTA J+1, "Énergie ignorée", bouton "Mon énergie"
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : +5 cas énergie
- `src/test/testUtils.tsx` : todayEnergyStatus: null dans makeAppContext
- `roadmap.md` : Phase 4 cochée [x]

---

## v0.6 — 2026-06-24

### Ajouté
- `src/ui/screens/tasks/E20Inbox.tsx` + tests : liste inbox, déplacement today/later, modale M04
- `src/ui/screens/tasks/E21CreateTask.tsx` + tests : formulaire création tâche
- `src/ui/screens/tasks/E22TaskDetail.tsx` + tests : détail tâche, sous-tâches, terminer, supprimer
- `src/ui/screens/tasks/E23Decompose.tsx` + tests : décomposition manuelle en sous-tâches
- `src/ui/screens/tasks/E24Today.tsx` + tests : liste aujourd'hui, terminer, retirer
- `src/ui/screens/tasks/E25Later.tsx` + tests : liste plus tard, déplacer vers aujourd'hui, modale M04
- `AppContext.tsx` : inboxTasks, todayTasks, laterTasks, moveTask, completeTask, deleteTask, selectTask, getSubTasks, toggleSubTask
- `DevResetButton.tsx` : SCREEN_CODES mapping, affichage code écran (E01–E25)

### Corrigé
- `E20/E22/E25` : `backgroundColor: var(--color-bg)` inexistant → `var(--color-surface)` ; overlay 75 % opacité ; zIndex 1000
- `Button.tsx` : disabled state — opacity 0.4 + cursor not-allowed

### Modifié
- `src/App.tsx` : renderScreen() helper, DevResetButton dans AppScreens
- `roadmap.md` : Phase 3 cochée `[x]`

---

## v0.5 — 2026-06-24

### Ajouté
- `src/app/AppContext.tsx` : state machine React (Screen), repositories, logique onboarding complète
- `src/app/AppContext.test.tsx` : 9 tests intégration avec real DB (fake-indexeddb)
- `src/ui/components/Button.tsx` + `Card.tsx` : composants UI réutilisables
- `src/ui/components/DevResetButton.tsx` : reset IndexedDB en DEV uniquement (import.meta.env.DEV)
- `src/ui/screens/onboarding/E01Welcome.tsx` + `E02Profile.tsx` + `E03Energy.tsx` + `E04FirstTask.tsx` + tests
- `src/ui/screens/dashboard/E10Dashboard.tsx` + tests : D10A (normal) / D10B (surcharge)
- `src/test/testUtils.tsx` : makeAppContext + renderWithApp pour tests UI découplés
- Design tokens CSS neurodivergents dans `src/index.css` (palette, grille 8px, dark mode)

### Corrigé
- `src/data/db.ts` : `import type { Table }` — Rolldown/Vite 8 refuse l'import valeur

### Modifié
- `src/App.tsx` : router principal via AppContext + DevResetButton
- `vitest.config.ts` : exclusion `src/domain/entities/**` de la couverture
- `roadmap.md` : Phase 2 cochée `[x]`

---

## v0.4 — 2026-06-24

### Ajouté
- `src/domain/entities/` : types purs User, Task, SubTask, EnergyEntry, Settings
- `src/domain/rules/taskRules.ts` : canAddToToday (max 3), sortByPosition, nextPosition, completeTask
- `src/domain/rules/energyRules.ts` : hasCheckedInToday, getLatestFilledValue, getTodayEntry
- `src/domain/rules/actionImmediateRules.ts` : cascade Action immédiate MVP (déterministe)
- `src/data/db.ts` : schéma Dexie v1, 5 tables indexées, name optionnel pour tests isolés
- `src/data/repositories/` : 5 repositories CRUD (User, Task, SubTask, EnergyEntry, Settings)
- Chiffrement transparent des champs sensibles : Task.title, SubTask.title, EnergyEntry.value
- `docs/adr/ADR-003-domaine-infra.md` : règle d'isolement domaine/infra
- 71 tests, couverture globale 98.26 %, isolement domaine/infra validé par grep

### Modifié
- `src/test/setup.ts` : ajout `import 'fake-indexeddb/auto'`
- `package.json` : devDependency `fake-indexeddb`
- `roadmap.md` : Phase 1 cochée `[x]`
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.3 — 2026-06-24

### Ajouté
- `package.json` : React 19, Vite 8, TypeScript 6, ESLint, Prettier, Vitest + coverage v8, Dexie, vite-plugin-pwa
- `vite.config.ts` + `vitest.config.ts` : PWA (manifest, service worker Workbox), couverture 85 %
- `src/crypto/crypto.ts` : wrapper AES-GCM + PBKDF2 (Web Crypto API)
- `src/crypto/crypto.test.ts` + `src/test/smoke.test.ts` : 5 tests, couverture 100 % crypto
- `docs/adr/ADR-001-stack.md` + `ADR-002-architecture-couches.md` : décisions d'architecture
- `run.py` : script Python pour lancer `npm run dev` sur Windows

### Modifié
- `roadmap.md` : Phase 0 cochée `[x]`
- `README.md` : lancement local, structure des dossiers src/, état actuel

---

## v0.2 — 2026-06-23

### Ajouté
- `roadmap.md` : 15 phases (MVP 0–7, V1 8–12, V2 13–14), coches de suivi `[ ]`/`[~]`/`[x]`
- `LICENSE` : MIT, copyright ServOMorph 2026
- `.gitignore` : Node/Vite/Capacitor/coverage

### Modifié
- `_contexte/signals.md` : actions P1/P2 alignées sur la roadmap
- `README.md` : état actuel et prochaine étape mis à jour

---

## v0.1 — 2026-06-23

### Ajouté
- Documentation produit complète (6 docs de dev + cahier des charges) révisée et cohérente
- Stack technique arrêtée : React/TS PWA, Dexie.js, Web Crypto AES-GCM, Capacitor
- Cascade "Action immédiate" formalisée dans User Flows et Architecture des écrans
- Entité Event documentée (hors MVP, prévue V1 post-validation)
- Critères d'acceptation MVP étendus dans le PRD
- Distinction notification push / suggestion in-app établie dans Design System et User Flows
- Règle de skip du check-in énergie (statut `skipped`) dans Modèle de données
- Sync cloud définie comme post-MVP (Supabase région UE)
