# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-05)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - dead code : nettoyé ; couverture ≥85% : atteinte (mesure 2026-07-01, non réévaluée après les changements récents) ; reste : doc V2, build+déploiement Netlify, sessions test 2-5
  - réf: `roadmap_v2.md` Phase V2-10
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI.
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`. Note 2026-07-05 : `moveTaskToLaterV2` (même trou fonctionnel) a été retiré entièrement suite à la suppression du statut `to_plan`, ne concerne plus que ces deux fonctions.
- [P2|ouvert] e2e T40/T44/T45 (`05-overload.spec.ts`) cassés — décalage test/UI préexistant
  - constat : les tests attendent un `heading` "Mode surcharge" sur le dashboard ; le bandeau surcharge est un `<p>` depuis la refonte V2-6 (toggle inline sans navigation).
  - fait quand: soit le bandeau devient un `<h2>`/`<h3>`, soit les 3 tests sont réécrits pour matcher le texte réel ("Mode surcharge actif")
  - réf: `e2e/05-overload.spec.ts` lignes 9-13, 36-51 ; `src/ui/screens/dashboard/E10Dashboard.tsx` (`<p>Mode surcharge actif</p>`)
- [P3|ouvert] Sous-tâches perdues silencieusement lors de conversion Todo → Planifier/Liste
  - constat : `planTodoTask`/`moveTodoTaskToList` (`AppContext.tsx`) suppriment les `SubTask` liées sans les recréer côté `TaskV2`/`ListItem` (pas de mécanisme cross-modèle). Cas rare mais silencieux — pas de confirmation utilisateur avant perte.
  - fait quand: décision produit prise (avertir l'utilisateur avant conversion si sous-tâches existent, ou accepter la perte silencieuse comme comportement définitif)
  - réf: `src/app/AppContext.tsx` fonctions `planTodoTask`/`moveTodoTaskToList`
- [P2|ouvert] e2e non relancés depuis plusieurs sessions (flux Planning, correctifs SubTask, et désormais refonte des destinations de création de tâche)
  - constat : aucun `.spec.ts` ne référence les libellés "Planifier"/"Placer à"/"Mettre dans une liste"/"Aujourd'hui" (vérifié par recherche), mais le flux réel n'a pas été rejoué en e2e — seuls les tests unitaires (345/345) ont validé le nouveau comportement. S'accumulent désormais : suppression du bouton "Voir le Todo" sur `E24Today`, checkbox de sous-tâches, suppression de la destination `to_plan` (et de l'écran `E50ToPlanQueue`), ajout de la destination "Aujourd'hui" sur l'écran de création.
  - fait quand: `npx playwright test` relancé et confirmé (attention : les tests qui référençaient `to-plan-queue` ou l'ancienne destination "À planifier plus tard" doivent être adaptés/retirés en plus des 3 échecs `05-overload` déjà connus)
  - réf: `e2e/*.spec.ts`, `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/screens/planning/E40Planning.tsx`, `src/ui/screens/tasks/E24Today.tsx`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- **Écran de création de tâche (`E21CreateTaskV2`) revu (2026-07-05)** : 4 destinations désormais — Todo / Aujourd'hui (nouveau, crée une `Task` V1 en `today`, modal de remplacement si déjà 3 tâches, même règle que `E20Inbox`) / Planifier / Mettre dans une liste (remplace "À planifier plus tard", ouvre un modal de sélection de liste, crée un `ListItem` via `addListItem`).
- **Statut `to_plan` (TaskV2) supprimé du domaine** : plus aucune voie de création ne l'utilisait (`moveTaskToLaterV2` jamais câblée à l'UI). Retirés en conséquence : `E50ToPlanQueue` (écran + test), bouton pastille "Tâches à planifier" du dashboard, `moveTaskToLaterV2` (`taskRulesV2.ts`), `getToPlantasks` (`taskV2Repository.ts`), état `toPlanTasks`/route `to-plan-queue` (`AppContext.tsx`, `App.tsx`). `TaskStatusV2` est désormais `'todo' | 'planned' | 'completed'`.
- **Bug racine SubTask corrigé** : `toggleSubTask` (AppContext.tsx) existait mais n'était appelée nulle part dans l'UI — aucune sous-tâche ne pouvait jamais être marquée terminée. Conséquence en cascade : le badge "X/Y" du Dashboard restait bloqué à "0/Y" et "Prochaine étape" n'avançait jamais. Corrigé par ajout d'une checkbox fonctionnelle dans `E22TaskDetail`/`E23Decompose` (relié à `toggleSubTask`, qui appelle désormais `loadAll()` pour propager la mise à jour).
- **Cohérence d'affichage des sous-tâches entre écrans** : badge "X/Y" désormais présent sur `E20Inbox` (nouveau, via `inboxSubTasksMap`) et `E24Today` (nouveau, via `todaySubTasksMap` déjà existant), en plus du Dashboard. `E24Today` affiche aussi "Prochaine étape : {titre}" comme le Dashboard.
- **`E24Today`** : bouton "Voir le Todo" retiré (demande explicite utilisateur) — l'accès à Todo reste disponible via la nav dashboard.
- **Flux de planification revu (retour utilisateur direct sur capture d'écran)** : l'ancien comportement où taper un créneau vide affichait la liste de toutes les tâches non planifiées, et cliquer sur une tâche validait immédiatement, n'était pas intuitif. Nouveau flux :
  - `planTodoTask` (Todo → Planifier) et `createTaskV2Dest` (création directe, destination "Planifier") retournent désormais l'id de la `TaskV2` créée.
  - `E20Inbox`/`E21CreateTaskV2` appellent `selectTask(id)` avant `goTo('planning')` pour porter cette tâche comme "tâche en attente" (`selectedTaskId` du contexte).
  - `E40Planning` : si une tâche en attente correspond à une tâche non planifiée, taper un créneau vide affiche directement "Placer « titre » à Xh00" + bouton **Valider** unique (pas de liste). Sinon (pas de tâche en attente), fallback sur l'ancien comportement : liste des tâches non planifiées, sélection (surlignage) puis bouton Valider (désactivé tant qu'aucune sélection).
  - Le déplacement d'une tâche déjà planifiée (`mode: 'move'`) est inchangé.
- **Nav segmentée dashboard** : bouton "Planifier" renommé en "Planning" (`E10Dashboard.tsx` ligne ~423). Ne pas confondre avec l'icône agenda de la TopBar qui porte déjà `aria-label="Planning"` (collision d'aria-label résolue dans les tests via `within(header)`/`within(group)`).
- **Fonctionnalité Routines retirée intégralement** (session 2026-07-02) : réintroduction possible comme type de liste si Marie l'exprime.
- **Collision de nommage V1/V2 "plus tard" résolue** (session 2026-07-02) : seul `to_plan` (V2, pastille rouge, `E50ToPlanQueue`) subsiste comme mécanisme de report.
- **Écran Todo (`E20Inbox`) enrichi** : 3 actions par tâche — "Aujourd'hui" (V1), "Planifier" (convertit en `TaskV2` statut `planned`, transporte l'id vers Planning), "Liste" (crée un `ListItem`).
- Nav segmentée dashboard actuelle : 4 boutons (Todo/Aujourd'hui/Planning/Listes)
- 345/345 tests unitaires, `tsc -b` passent (e2e non relancés cette session, voir action P2 ci-dessus)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-05)

## Décisions prises
- Écran de création de tâche (`E21CreateTaskV2`) : destination "À planifier plus tard" remplacée par "Mettre dans une liste" (demande utilisateur)
- Suite au constat que le statut `to_plan` devenait totalement inatteignable (aucune autre voie de création), nettoyage complet validé avec l'utilisateur : `E50ToPlanQueue`, pastille dashboard, `moveTaskToLaterV2`, `getToPlantasks` retirés
- Ajout d'une 4e destination "Aujourd'hui" sur l'écran de création (demande utilisateur), avec la même règle de remplacement à 3 tâches que sur l'écran Todo

## Livrables produits ou modifiés
- `E21CreateTaskV2.tsx`/`.test.tsx` : 4 destinations (Todo/Aujourd'hui/Planifier/Liste), modal sélection de liste, modal remplacement "Aujourd'hui" à la limite de 3
- `E10Dashboard.tsx` : bouton pastille "Tâches à planifier" retiré
- `App.tsx`, `AppContext.tsx` : route/état `to-plan-queue`/`toPlanTasks` retirés
- `taskV2.ts` (`TaskStatusV2` sans `to_plan`), `taskRulesV2.ts`/`.test.ts` (`moveTaskToLaterV2` retiré), `taskV2Repository.ts` (`getToPlantasks` retiré)
- `E50ToPlanQueue.tsx`/`.test.tsx` : supprimés
- `testUtils.tsx`, `DevResetButton.tsx` : nettoyage des références `to_plan`/`to-plan-queue`
- `roadmap_v2.md` : Phase V2-5 marquée RETIRÉE, Phase V2-3 mise à jour (destinations)

## Hypothèses validées / invalidées
- VALIDE : le statut `to_plan` n'avait strictement aucune voie de création alternative à l'écran de création de tâche — suppression complète sans perte fonctionnelle réelle (fonctionnalité jamais atteignable autrement)
- EN ATTENTE : e2e non rejoués depuis plusieurs sessions, s'accumulent désormais les changements Planning + SubTask + destinations de création (voir action P2)

## Prochaine étape exacte
Relancer `npx playwright test` pour confirmer l'absence de régression (accumulation de plusieurs sessions de changements non testés en e2e), puis poursuivre V2-10 : doc V2, build + déploiement Netlify, sessions test 2-5 avec Marie.

## Question bloquante pour la session suivante
Aucune.
