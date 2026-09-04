# Roadmap — Supprimer la catégorie « Tâche du jour »

## Origine

Demande de Marie du 2026-09-04, **hors Google Doc** : commentaire du parcours de test
`heures-debut-fin-sur-la-case` (marqué `nok` alors que le comportement testé fonctionne) :

> « Supprime complètement "Tâche du jour", je ne veux plus que cette catégorie existe nulle part.
> Quand on ajoute une tâche via l'écran d'accueil, elle se planifie automatiquement et on doit
> compléter tous les champs, notamment l'heure et la durée. Quand on ajoute une tâche à partir de
> Réception, on doit uniquement rentrer le champ "titre de la tâche", et ensuite elle s'affiche
> dans Réception avec les cases "Planifier" ou "Liste", mais sans "Tâche du jour". »

Tracé dans `_contexte/marie_modifications_suivi.md` (§ Précisions) comme demande non numérotée.
La demande #4 (livrée v5.58) avait déjà retiré « Tâche du jour » de la **fiche de tâche**
(`E22TaskDetail`) ; il reste le statut `today` lui-même, le bouton de la Réception, et la
plomberie accueil / dépôt.

## État constaté dans le code (2026-09-04)

- `src/domain/entities/task.ts:1` : `type TaskStatus = 'inbox' | 'today' | 'planned' | 'completed'`.
- Seule création réelle d'un statut `today` en UI : `E20Inbox.tsx` bouton « Tâche du jour »
  (`handleMoveToToday` → `moveTask(id, 'today')`, `E20Inbox.tsx:70-72,152-159`).
- `useTasksState.addTask` (`useTasksState.ts:47-52`) crée un `today` mais **n'est plus appelé
  nulle part en UI** (uniquement dans les tests).
- `taskRepo.getTodayTasks()` (`taskRepository.ts:40-49`) fusionne `status === 'today'` + tâches
  terminées aujourd'hui → alimente l'état `todayTasks`.
- `todayTasks` n'est plus lu que pour de la recherche d'objet : `E22TaskDetail.tsx:297`,
  `E23Decompose.tsx:235`, `E24EditTask.tsx:102` (`[...inboxTasks, ...todayTasks].find(...)`) et
  `E22TaskDetail.tsx:250` (`task.status === 'today'` → retour `dashboard`).
- `moveTask` a un cas spécial `status === 'today'` → pose `scheduled_date = todayDate()`
  (`useTasksState.ts:82`).
- Migration Dexie existante : `db.ts:203` `status: task.status === 'todo' ? 'inbox' : task.status`.
- Deux points d'ajout de tâche, **tous deux vers `E21CreateTaskV2` (formulaire complet)** :
  - « + / Ajouter une tâche » du menu du bas, global : `App.tsx:189`
    (`onAddTask={() => goTo('task-create-v2')}`, `BottomNav`).
  - « Ajouter une tâche » dans l'écran Réception : `E20Inbox.tsx:182-187`.
- « Planifier » depuis la Réception : `planTaskToday` (`usePlanningState.ts:100`) pose
  `status: 'planned'`, `scheduled_date = todayDate()`, sans horaire, puis ouvre `task-detail`.

## Décisions produit

- **D1 — TRANCHÉE (2026-09-04, utilisateur)** : migrer `today → inbox`. Les tâches
  `status: 'today'` déjà sur l'appareil de Marie repartent en Réception pour re-tri. Aucune
  perte, cohérent avec « la Réception ne demande que le titre ». Débloque la Phase 1.
- **D2 — EN ATTENTE** : « ajouter via l'écran d'accueil » = quel point d'entrée ? Interprétation
  dev = le bouton « Ajouter une tâche » du menu du bas (`BottomNav`, global, `App.tsx:189`).
  Décision utilisateur du 2026-09-04 : **ne pas poser la question à Marie maintenant**, la
  regrouper avec sa réponse aux autres questions en attente (#3, re-tests v5.84). **Bloque la
  Phase 3.**
- **D3 — TRANCHÉE (2026-09-04, utilisateur)** : retirer le mode « création non planifiée » de
  `E21CreateTaskV2` en Phase 3 (moins de chemins morts).

---

## Phase 1 — Retrait du statut `today` et du bouton « Tâche du jour » [EN COURS]

Cœur de la demande : « que cette catégorie n'existe nulle part ».

Pré-requis : D1 tranchée (migration `today → inbox`).

- `src/domain/entities/task.ts` : `TaskStatus` → `'inbox' | 'planned' | 'completed'`.
- `src/domain/rules/taskRules.ts` : vérifier qu'aucune transition ne produit `'today'` ; retirer
  toute branche `'today'` résiduelle.
- `src/data/repositories/taskRepository.ts` : supprimer `getTodayTasks()` ; revoir le tri de
  `getByStatus` (`:50`, comparaison `status === 'completed'`) ; retirer la constante `'today'`.
- `src/data/db.ts` : ajouter à la migration la réécriture des tâches `status: 'today'` selon D1
  (nouvelle version de schéma / `upgrade` Dexie). Tester la montée de version sur une base
  contenant des `today`.
- `src/app/contexts/useTasksState.ts` : retirer `addTask`, l'état `todayTasks` /
  `todaySubTasksMap` / `reorderTodayTasks`, le cas spécial `moveTask` `:82`. Exposer un accès
  objet de substitution pour les écrans qui faisaient `[...inboxTasks, ...todayTasks].find()`
  (`getTaskById` existe déjà — `E24EditTask.tsx:100` l'importe).
- `src/ui/screens/tasks/E20Inbox.tsx` : retirer le bouton « Tâche du jour »,
  `handleMoveToToday`, l'entrée `planTaskToday` restant utilisée par « Planifier ».
- `src/ui/screens/tasks/E22TaskDetail.tsx` : retirer `task.status === 'today'` (`:250`) et la
  dépendance `todayTasks` (`:272,297`).
- `src/ui/screens/tasks/E23Decompose.tsx`, `E24EditTask.tsx` : idem, basculer la recherche
  d'objet sur `getTaskById`.
- `src/ui/screens/resources/E120Resources.tsx:63` : reformuler la phrase « Quand une tâche du
  jour existe… » (texte d'aide, pas de logique).
- Tests : `taskRepository.test.ts`, `AppContext.test.tsx`, `E20Inbox.test.tsx`,
  `E22TaskDetail.test.tsx`, tests de migration `db.ts`, e2e `e2e/02-tasks.spec.ts` (retirer tout
  scénario « Tâche du jour »). `tsc -b` + lint + suite complète verts.
- Catalogue in-app (`src/domain/data/manualTestsCatalog.ts`) : nouveau parcours
  « Plus de catégorie Tâche du jour » (Réception : le bouton « Tâche du jour » a disparu, il ne
  reste que « Planifier » et « Liste » ; aucune mention « du jour » ailleurs). `WHATS_NEW`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Ajout depuis la Réception : titre seul [TODO]

- `src/ui/screens/tasks/E20Inbox.tsx` : « Ajouter une tâche » n'ouvre plus `task-create-v2`.
  À la place, saisie du **titre seul** (champ inline sous la liste, ou petite modale), validation
  → `createTaskInbox(title)` (déjà exposé, `useTasksState.ts:54-59`). La tâche apparaît dans la
  liste Réception avec ses actions « Planifier » / « Liste » inchangées.
- Vérifier qu'aucun autre appelant n'attend l'ancien comportement du bouton.
- Tests : `E20Inbox.test.tsx` (création titre seul, la tâche s'ajoute à `inboxTasks`, pas de
  navigation vers `task-create-v2`). Suite complète verte.
- Catalogue in-app : parcours « Ajouter une tâche depuis la Réception » (on ne saisit que le
  titre ; la tâche apparaît dans Réception avec « Planifier » et « Liste »).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Ajout depuis l'accueil : tâche planifiée d'office [TODO — BLOQUÉ : D2 (Marie)]

Ne pas démarrer avant la réponse de Marie sur D2.

- Point d'entrée retenu (D2) : bouton « Ajouter une tâche » du menu du bas.
  `App.tsx:189` : au lieu de `goTo('task-create-v2')` nu, ouvrir `E21CreateTaskV2` **pré-réglé
  en mode planifié** (`isPlanned = true` d'office, date = jour affiché de l'accueil), date +
  heure + durée obligatoires (contraintes déjà en place depuis #25 : `canSubmit`,
  `hasDuration`, message d'aide `startTime`).
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : forcer `isPlanned` à `true` dans ce mode ;
  masquer / retirer la bascule vers le mode non planifié selon D3.
- Si D3 = retrait : supprimer le mode `isPlanned = false` de `E21CreateTaskV2` et le code mort
  associé (`useTasksState.addTask` déjà retiré en Phase 1).
- Tests : `E21CreateTaskV2.test.tsx` (mode planifié d'office, impossible de valider sans date /
  heure / durée), `AppContext.test.tsx`. e2e `02-tasks.spec.ts`. Suite complète verte.
- Catalogue in-app : parcours « Ajouter une tâche depuis l'accueil » (formulaire planifié
  d'office, tous les champs obligatoires).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Après la dernière phase

- `_contexte/marie_modifications_suivi.md` : passer la demande « supprimer Tâche du jour » (§
  Précisions) à `livrée vX.Y` une fois déployée et validée par Marie ; ajouter une entrée
  « Historique des revues ».
- `COMMUNICATION/Marie/a_transmettre.md` : commentaire de livraison (ce qui change côté Marie :
  plus de « Tâche du jour », ajout titre seul en Réception, ajout planifié d'office depuis
  l'accueil).
- Vérifier `WHATS_NEW` (`E01Welcome.tsx`) à jour.
- Archiver cette roadmap dans `Archives/` au `/deploy` qui livre la dernière phase.
