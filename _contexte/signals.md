# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-05, session 3)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - dead code : nettoyé ; couverture ≥85% : atteinte (mesure 2026-07-01, non réévaluée après les changements récents) ; e2e : 45/45 passent (confirmé 2026-07-05) ; reste : build V2 à jour, doc V2, déploiement Netlify, sessions test 2-5
  - fait quand: doc V2 rédigée, `dist/v2/` régénéré et déployé sur Netlify, 5-10 sessions test réalisées
  - réf: `roadmap_v2.md` Phase V2-10
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI.
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`. Note 2026-07-05 (session 3) : le filtre `essential` sur le Dashboard en mode surcharge a été retiré (mort — jamais atteignable) plutôt que câblé ; ce trou fonctionnel reste donc entier et sans usage identifié pour l'instant.
- [P3|ouvert] Sous-tâches perdues silencieusement lors de conversion Todo → Planifier/Liste
  - constat : `planTodoTask`/`moveTodoTaskToList` (`AppContext.tsx`) suppriment les `SubTask` liées sans les recréer côté `TaskV2`/`ListItem` (pas de mécanisme cross-modèle). Cas rare mais silencieux — pas de confirmation utilisateur avant perte.
  - fait quand: décision produit prise (avertir l'utilisateur avant conversion si sous-tâches existent, ou accepter la perte silencieuse comme comportement définitif)
  - réf: `src/app/AppContext.tsx` fonctions `planTodoTask`/`moveTodoTaskToList`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Mode surcharge du Dashboard rendu minimaliste (2026-07-05, session 3)** : en `overloadMode`, sont désormais masqués — dans la `TopBar` : icônes Planning/Ressources/Paramètres + chip énergie (`overloadActive`) ; dans `E10Dashboard` : bouton "Ajouter une tâche", nav segmentée (Todo/Aujourd'hui/Planning/Listes), section "Planning du jour", section "Tâches du jour". Un bouton "Sortir du mode surcharge" est ajouté en pied de page (même style `--color-warning` que le bouton actif en haut). Restent visibles : titre, bouton "Mode surcharge", bandeau "Mode surcharge actif" + Centre récupération, "Que faire maintenant ?" (action immédiate). Le filtre `todayPlanned.filter(t => overloadMode ? t.essential : true)` a été supprimé (mort : `essential` toujours `false` à la création, jamais câblé à l'UI — cf. action ouverte P3).
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` déplacé vers `dist/v1/` (2026-07-05, regroupement des builds : `dist/v1/` versionné/rollback, `dist/v2/` ignoré Git/régénérable via `npm run build`)
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
- 345/345 tests unitaires (E10Dashboard.test.tsx : 36/36 après ajustement du test mode surcharge), `tsc -b` passent ; e2e non relancés cette session (dernière confirmation 45/45 le 2026-07-05, session 2)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-05, session 3)

## Décisions prises
- Mode surcharge du Dashboard rendu minimaliste : masquage de toutes les sections non essentielles plutôt que de câbler le filtre `essential` (jamais accessible depuis l'UI)
- Ajout d'un bouton "Sortir du mode surcharge" en pied de page, même couleur (`--color-warning`) que le bouton actif en haut

## Livrables produits ou modifiés
- `src/ui/components/TopBar.tsx` : icônes Planning/Ressources/Paramètres + chip énergie masqués si `overloadActive`
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton "Ajouter une tâche", nav segmentée, sections "Planning du jour" et "Tâches du jour" masquées en surcharge ; filtre mort `essential` supprimé ; bouton "Sortir du mode surcharge" ajouté en pied de page
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : test obsolète (filtre essential sur tâche planifiée) remplacé par un test de masquage de la section "Planning du jour"
- `roadmap_v2.md` Phase V2-6 : item "masquer essential=false" clos avec la solution retenue (masquage de sections, pas filtre par tâche)

## Hypothèses validées / invalidées
- VALIDE : 36/36 tests Dashboard passent, `tsc -b` clean après chaque étape
- EN ATTENTE : e2e non relancés cette session (dernière confirmation 45/45 le 2026-07-05, session 2) — à revalider avant prochain déploiement
- EN ATTENTE : build V2 (`dist/v2/`) toujours périmé (généré le 2026-07-02) — à régénérer via `npm run build` avant tout déploiement Netlify

## Prochaine étape exacte
Poursuivre V2-10 : `npm run build` pour régénérer `dist/v2/` à jour, doc V2 (README/schéma/ADR), déploiement Netlify (dépôt manuel de `dist/v2/`), sessions test 2-5 avec Marie.

## Question bloquante pour la session suivante
Aucune.
