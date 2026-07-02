# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-02)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - dead code : nettoyé ; couverture ≥85% : atteinte (mesure 2026-07-01, non réévaluée après les retraits Routines/Later) ; reste : doc V2, build+déploiement Netlify, sessions test 2-5
  - réf: `roadmap_v2.md` Phase V2-10
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI. `moveTaskToLaterV2` reste utilisé conceptuellement par "Planifier" depuis Todo (transition vers `planned`).
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`
- [P2|ouvert] e2e T40/T44/T45 (`05-overload.spec.ts`) cassés — décalage test/UI préexistant
  - constat : les tests attendent un `heading` "Mode surcharge" sur le dashboard ; le bandeau surcharge est un `<p>` depuis la refonte V2-6 (toggle inline sans navigation). Repéré lors de la relance e2e post-retrait Routines/Later, non introduit par les changements de cette session.
  - fait quand: soit le bandeau devient un `<h2>`/`<h3>`, soit les 3 tests sont réécrits pour matcher le texte réel ("Mode surcharge actif")
  - réf: `e2e/05-overload.spec.ts` lignes 9-13, 36-51 ; `src/ui/screens/dashboard/E10Dashboard.tsx` (`<p>Mode surcharge actif</p>`)
- [P3|ouvert] Sous-tâches perdues silencieusement lors de conversion Todo → Planifier/Liste
  - constat : `planTodoTask`/`moveTodoTaskToList` (`AppContext.tsx`) suppriment les `SubTask` liées sans les recréer côté `TaskV2`/`ListItem` (pas de mécanisme cross-modèle). Cas rare (peu de tâches Todo décomposées avant conversion) mais silencieux — pas de confirmation utilisateur avant perte.
  - fait quand: décision produit prise (avertir l'utilisateur avant conversion si sous-tâches existent, ou accepter la perte silencieuse comme comportement définitif)
  - réf: `src/app/AppContext.tsx` fonctions `planTodoTask`/`moveTodoTaskToList`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- **Fonctionnalité Routines retirée intégralement** : Marie n'avait jamais demandé d'onglet dédié (sa maquette dessinée = nav 3 items Todo/Planifier/Listes ; ses notes citent "routines" comme exemple de contenu d'une liste). Code supprimé : `E70Routines`/`E71RoutineDetail`, `routineRules.ts`, `routineRepository`/`routineStepRepository`, entités `routine.ts`/`routineStep.ts`, tables Dexie. Réintroduction possible comme type de liste si Marie l'exprime.
- **Collision de nommage V1/V2 "plus tard" résolue par suppression du système V1** : `E25Later`, `TaskStatus.later`, bouton nav "À faire plus tard" retirés. Seul le système V2 subsiste : "À planifier plus tard" → `TaskV2` statut `to_plan`, pastille rouge dashboard, `E50ToPlanQueue`.
- **Pastille rouge ajoutée sur le bouton "Todo"** (nav segmentée dashboard) dès que `inboxTasks.length > 0` (`E10Dashboard.tsx`, `segmentPastilleStyle`).
- **Bug orphelin corrigé** : la destination "Todo" de `E21CreateTaskV2` créait une `TaskV2` statut `todo` jamais affichée nulle part (aucun écran ne lisait ce statut). Corrigé : cette destination crée maintenant une `Task` V1 via `createTaskInbox`, cohérente avec l'écran Todo (`E20Inbox`).
- **Écran `E21CreateTask` (V1) supprimé** : devenu inaccessible après le fix ci-dessus (bouton Todo repointé vers `task-create-v2`).
- **Décision architecture actée** : le système V1 `Task` (inbox→today, sous-tâches, décomposition, action immédiate) reste le moteur du dashboard — non unifié sur `TaskV2`. L'écran Todo reste V1 ; conversion vers `TaskV2`/`ListItem` seulement au moment de l'action utilisateur ("Planifier"/"Liste"), pas de migration de données de fond.
- **Écran Todo (`E20Inbox`) enrichi** : 3 actions par tâche désormais — "Aujourd'hui" (inchangé, V1), "Planifier" (convertit en `TaskV2` statut `planned` non casée + navigue planning), "Liste" (crée un `ListItem` dans la liste choisie, ou propose d'en créer une). Les 3 actions vident Todo (suppression de la `Task` V1 source).
- **Bug annexe corrigé** : `deleteAllData` ne vidait jamais `db.tasksV2` (données V2 fantômes après reset) — `db.tasksV2.clear()` + `setToPlanTasks([])` ajoutés.
- Nav segmentée dashboard actuelle : 4 boutons (Todo/Aujourd'hui/Planifier/Listes) — Routines et À faire plus tard retirés
- 345/345 tests unitaires, `tsc -b` et `npm run build` passent
- e2e : 42/45 passent. 3 échecs préexistants sans lien avec cette session : `e2e/05-overload.spec.ts` T40/T44/T45 (voir action P2 ci-dessus)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-02)

## Décisions prises
- Onglet "Routines" retiré intégralement (non demandé par Marie)
- Système V1 "À faire plus tard" (`later`) retiré intégralement — le système V2 `to_plan` devient l'unique mécanisme de report
- Pastille rouge ajoutée sur le bouton "Todo" quand des tâches sont en attente
- Le système V1 `Task` (inbox→today) reste le moteur du dashboard — pas d'unification sur `TaskV2` ; l'écran Todo gagne des actions "Planifier"/"Liste" qui convertissent la tâche au moment du clic plutôt que de migrer le modèle de données
- Conversion "Liste" : la tâche est supprimée après création du `ListItem` (pas conservée en `completed`)

## Livrables produits ou modifiés
- Suppression : `E70Routines`/`E71RoutineDetail`, `routineRules.ts`, `routineRepository`/`routineStepRepository`, `routine.ts`/`routineStep.ts`, `E25Later.tsx`, `E21CreateTask.tsx` (+tests associés)
- `db.ts` : tables `routines`/`routineSteps` retirées ; `task.ts` : `TaskStatus` sans `later`
- `AppContext.tsx` : nouvelles fonctions `planTodoTask`/`moveTodoTaskToList`, fix `deleteAllData` (tasksV2), fix destination "Todo" orpheline
- `E20Inbox.tsx` : actions Planifier/Liste + modale sélecteur de liste ; bouton Ajouter repointé vers `task-create-v2`
- `E10Dashboard.tsx` : pastille Todo, nettoyage Routines
- `e2e/02-tasks.spec.ts`, `e2e/06-offline.spec.ts` : adaptation au nouveau flux de création (sélection destination obligatoire)
- `roadmap_v2.md` : Phase V2-8 marquée RETIRÉE, décisions actées documentées

## Hypothèses validées / invalidées
- VALIDE : les deux fonctionnalités retirées (Routines, "plus tard" V1) n'étaient pas des demandes explicites de Marie ou créaient une confusion UX documentée
- INVALIDE : unifier Todo sur `TaskV2` -> pivot vers conversion à l'action, car le système V1 (sous-tâches, action immédiate, décomposition) est le moteur actif du dashboard et aurait été cassé par une bascule complète
- VALIDE : 345/345 tests unitaires, `tsc -b`, `npm run build`, 42/45 e2e (3 échecs préexistants) après l'ensemble des changements

## Prochaine étape exacte
Poursuivre V2-10 : doc V2, build + déploiement Netlify, sessions test 2-5 avec Marie. Décider du sort des sous-tâches perdues lors de conversion Todo (action P3) et des tests e2e overload cassés (action P2).

## Question bloquante pour la session suivante
Aucune.
