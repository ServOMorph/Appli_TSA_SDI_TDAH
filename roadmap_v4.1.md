# Roadmap — V4.1 (rubrique « Outils » : Todo / Listes épinglées / Budget)

Version : 4.1 — créée 2026-07-21. Succède à `Archives/roadmap_v4.md` (V4 close).
Source : constat E3 (`Note de réunion/2026-07-16/constats_2026-07-18.md`, transcription l.140-278) + cadrage utilisateur du 2026-07-21 (session courante).
Branche : `v4.1`.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Décisions de cadrage (2026-07-21)

- **Libellé nav** : « Outils » (pluriel). Remplace « Todo » dans le bottom nav ; Todo devient une sous-partie d'Outils, déplacé **tel quel** (pas de date butoir en V4.1).
- **Nav** : Dashboard / Outils / Planning / Listes — l'onglet Listes reste. Pas de refonte du bottom nav : « Outils » est un écran hub avec navigation interne (pattern plat existant, nouveaux `Screen` ajoutés sans toucher aux routes existantes).
- **Listes dans Outils** : pas de « Liste courses » codée en dur. L'utilisateur crée sa liste dans l'onglet Listes puis l'épingle dans Outils (flag sur l'entité `List`). La liste « particulière » de courses évoquée par Marie n'a jamais été précisée (transcription coupée) — reporté à un cadrage ultérieur.
- **Budget — périodicités** : semaine + mois uniquement (acté en séance avec Marie).
- **Budget — revenus** : plusieurs entrées de revenu possibles (même modèle que les catégories de dépense, type `income`).
- **Budget — passage de période** : reset automatique des compteurs à chaque nouvelle période (semaine lundi→dimanche, mois calendaire), historique conservé — les dépenses sont datées, les soldes par période sont calculés, rien n'est effacé.
- **Budget — livrets** : version simple. Livrets créés manuellement, un dépôt vers un livret est déduit du revenu comme une dépense, solde cumulé affiché. Pas de retrait ni de virement entre livrets en V4.1.
- **Budget — reste non budgétisé** : revenu − total budgétisé − dépôts livrets, affiché en permanence en tête de l'écran Budget.
- **Hors périmètre V4.1** : intégration accueil (saisie rapide de dépense et reste sur le Dashboard), date butoir Todo, retraits/virements livrets, périodicité jour/année, liste courses spécialisée.
- **Chiffrement** : données budget en clair dans IndexedDB, comme tout le modèle actuel (le mécanisme AES-GCM existant n'est câblé nulle part — chantier global à traiter séparément, pas en douce dans V4.1).

## Ordre & dépendances

```
V4.1-0 Nav + hub Outils ──┬──► V4.1-1 Listes épinglables
                          └──► V4.1-2 Modèle de données Budget
                                        │
                                        └──► V4.1-3 Budget : configuration
                                                    │
                                                    └──► V4.1-4 Budget : usage courant
```

V4.1-0 d'abord : le hub est le support d'accueil de tout le reste.
V4.1-2 avant V4.1-3/4 : entités, migration Dexie et règles de calcul testées avant toute UI.
V4.1-3 avant V4.1-4 : impossible de saisir une dépense sans catégories configurées.

---

## Phase V4.1-0 — Nav + écran hub « Outils » [FAIT]

Bloc d'écrans E7x (libre dans le code actuel).

- [x] Renommer l'onglet nav « Todo » → « Outils » (`BottomNav.tsx` : libellé changé, tab `inbox` conservé tel quel côté `BottomNavTab`, pas de churn sur `activeTabFor`)
- [x] Nouvel écran hub `E70Tools.tsx` (screen `'tools'`) : entrées « Todo » et « Budget » (placeholder grisé non cliquable « Budget (bientôt disponible) » tant que V4.1-3 n'est pas codée), section « Listes épinglées » vide pour l'instant
- [x] L'onglet « Outils » ouvre `E70Tools` ; `E20Inbox` (Todo) reste accessible depuis le hub avec retour vers le hub (`activeTabFor` : `'tools'` et `'inbox'` → tab `inbox`, pattern `'list-detail'` → `'lists'` existant)
- [x] Vérifié tous les points d'entrée existants vers `'inbox'` (Dashboard, création de tâche, `taskCreateOrigin`) : aucun flux existant cassé
- [x] Tests unitaires (rendu hub, navigation, `activeTabFor`) + mise à jour des tests existants touchés (`BottomNav.test.tsx`, `App.test.tsx`, `E20Inbox.test.tsx`, nouveau `E70Tools.test.tsx`)
- [x] Correctif hors périmètre initial, trouvé en validation manuelle : depuis Todo, `E21CreateTaskV2` affichait encore le choix de destination (Todo/Tâche du jour/Planifier/Liste) alors que la destination est obligatoirement Todo — section masquée et destination forcée quand `taskCreateOrigin === 'inbox'`

Gate : [x] tests verts (427, 2 échecs pré-existants sans lien confirmés via `git stash`) · [x] test manuel (validé par l'utilisateur) · [x] doc · [x] sortie : l'onglet « Outils » ouvre le hub, Todo accessible et fonctionnel à l'identique depuis le hub, aucun autre écran impacté

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V4.1-1 — Listes épinglables dans Outils [FAIT]

- [x] Champ optionnel `pinned_to_tools?: boolean` sur `List` (`src/domain/entities/list.ts`) — pattern champs optionnels déjà utilisé (`TaskV2.postponed?`), pas de migration de données nécessaire (Dexie n'indexe pas ce champ)
- [x] Action « Épingler dans Outils » / « Retirer d'Outils » sur une liste (`E60Lists.tsx`, à côté de Renommer/Supprimer)
- [x] Section « Listes épinglées » du hub `E70Tools` : affiche les listes épinglées, tap → `E61ListDetail` avec retour vers le hub
- [x] `listRules.ts` (`togglePinList`) : règle de bascule pure, persistée via `AppContext.togglePinList` (réutilise `listRepo.update`, pattern `renameList`) + tests
- [x] Retour dynamique d'`E61ListDetail` : nouveau state `listDetailOrigin`/`setListDetailOrigin` (pattern `taskCreateOrigin`) posé à chaque point d'entrée existant (`E60Lists`, `E20Inbox`, `E21CreateTaskV2`, `E22TaskDetail` → `'lists'` ; hub `E70Tools` → `'tools'`), défaut `'lists'` si non posé

Gate : [x] tests verts (433/435, 2 échecs pré-existants sans lien confirmés en amont) · [x] `tsc -b` clean · [x] test manuel (validé par l'utilisateur) · [x] doc · [x] sortie : une liste créée dans l'onglet Listes apparaît dans Outils après épinglage, se désépingle, s'ouvre depuis les deux entrées

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V4.1-2 — Modèle de données Budget [FAIT]

Aucune UI dans cette phase. Fonctions pures + repos + migration, entièrement testés.

- [x] Entités (`src/domain/entities/`) :
  - `budgetCategory.ts` — `{ id, name, kind: 'income' | 'expense', period: 'week' | 'month', amount, position, created_at, updated_at }` (`amount` = montant budgétisé pour une dépense, montant perçu pour un revenu)
  - `budgetEntry.ts` — `{ id, category_id, amount, label?, date, created_at }` (dépense réelle datée ; `label` libre, ex. « Intermarché »)
  - `budgetAccount.ts` — `{ id, name, created_at, updated_at }` (livret)
  - `budgetDeposit.ts` — `{ id, account_id, amount, date, created_at }` (dépôt vers livret)
- [x] Migration Dexie v4→v5 (`src/data/db.ts`) : 4 nouvelles tables, redéclaration intégrale du `.stores({...})` (pattern existant), mise à jour `db.test.ts` (`verno` = 5, existence des tables et migration d'une base v4 existante)
- [x] Repositories (`src/data/repositories/`) : `budgetCategoryRepository`, `budgetEntryRepository`, `budgetAccountRepository`, `budgetDepositRepository` — CRUD + accesseurs par période/catégorie, sans chiffrement (conforme cadrage)
- [x] Règles pures (`src/domain/rules/budgetRules.ts`), `now` injecté en paramètre (convention projet) :
  - bornes de période courante (semaine lundi→dimanche, mois calendaire) et d'une période passée arbitraire
  - dépensé / restant par catégorie sur une période
  - total revenus, total budgétisé, total dépôts livrets, **reste non budgétisé** (revenus − budgétisé − dépôts)
  - solde cumulé d'un livret
- [x] Tests unitaires exhaustifs des règles (bords de période : changement de semaine, de mois, d'année) + tests repos

Gate : [x] tests Budget verts (27/27), suite complète 454/455 avec 1 échec intermittent pré-existant dans `AppContext.test.tsx` · [x] `tsc -b` clean · [x] doc · [x] sortie : migration v5 propre sur base existante, toutes les règles de calcul testées, aucun impact visible dans l'app

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V4.1-3 — Budget : configuration [FAIT]

- [x] État et actions dans `AppContext.tsx` (repos Budget, state et fonctions exposées via `useApp()`)
- [x] Écran `E71Budget.tsx` (screen `'budget'`), accessible depuis le hub : deux sections « À la semaine » / « Au mois », reste non budgétisé en tête
- [x] Gestion des catégories : créer (nom + type revenu/dépense + périodicité + montant), renommer, modifier le montant, supprimer (avec confirmation si des dépenses existent)
- [x] Gestion des livrets : créer, renommer, supprimer (avec confirmation si des dépôts existent)
- [x] Tests unitaires écrans + mise à jour tests contexte

Gate : [x] tests ciblés verts (18/18), build et lint verts ; suite complète : 1 échec intermittent pré-existant dans `AppContext.test.tsx` · [x] test manuel (validé par l'utilisateur) · [x] doc · [x] sortie : la configuration réelle peut être reproduite

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase V4.1-4 — Budget : usage courant [FAIT]

- [x] Saisie d'une dépense : choix de la catégorie, montant, libellé optionnel — soustraction immédiate, restant de la catégorie mis à jour
- [x] Affichage par catégorie : budgétisé / dépensé / restant sur la période courante
- [x] Dépôt vers un livret : saisie du montant, déduit du reste non budgétisé, solde cumulé du livret affiché
- [x] Reset automatique au changement de période (purement calculé — comportement aux bornes couvert par les règles de V4.1-2)
- [x] Historique : consultation des périodes passées (navigation semaine/mois précédents, dépenses datées conservées)
- [x] Correction d'erreur de saisie : supprimer une dépense / un dépôt, avec libellés distincts de la suppression d'une catégorie ou d'un livret
- [x] Tests unitaires + e2e (`e2e/08-tools-budget.spec.ts` : hub Outils, configuration budget, saisie dépense, dépôt livret, suppression et recalcul du reste)
- [x] Corriger l'intégrité relationnelle : migration Dexie v6 (dépôts/écritures orphelins supprimés) et suppressions transactionnelles en cascade pour les livrets/catégories
- [x] Définir la périodicité d'un dépôt (`period: 'week' | 'month'`, sélecteur ajouté au formulaire, existant migré vers `month`) afin qu'il ne soit plus déduit simultanément des vues semaine et mois
- [x] Validation manuelle complète aux points 48 à 73 de `tests_manuels.md` (fichier purgé après validation)

Anomalie d'intégrité (dépôt orphelin après suppression d'un livret, invisible mais encore compté) corrigée par la migration Dexie v6 et les suppressions en cascade. Correctif hors périmètre initial trouvé en validation manuelle : le bouton de suppression d'une dépense affichait « Supprimer » (ambigu avec le bouton de suppression de la catégorie) — libellé changé en « Supprimer la dépense ».

Gate : [x] tests Budget ciblés, build et lint verts (suite complète : 1 échec intermittent pré-existant dans `AppContext.test.tsx`, sans lien) · [x] test manuel validé intégralement (points 48-73) · [x] doc · [x] e2e Budget vert (T52 + T53 cascade) · [x] sortie : flux complet de Marie fonctionnel, données réparées, aucune donnée orpheline comptée

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Correctifs ergonomiques post-validation (retours `bug et ameliorations.txt`)

Trois retours utilisateur bruts triés en correctifs. Bornés, sur la branche `v4.1`.
Regroupés en 2 phases : correctifs UI simples ensemble, drag planning isolé (le plus délicat).

### Phase V4.1-5 — Ajout de tâche contextuel + distinction listes épinglées [TODO]

- [ ] Nav « + » (`App.tsx`, `BottomNav.onAddTask`) : passer l'écran courant comme origin au lieu de `'dashboard'` codé en dur
- [ ] `E21CreateTaskV2.tsx` : généraliser `effectiveDestination` via un mapping origin→destination — `inbox`/`tools` → `todo`, `today` → `today`, `planning` → `planned`, autres (`dashboard`, `lists`, …) → sélecteur affiché ; masquer la section « Que faire de cette tâche ? » dès qu'une destination est forcée (pattern `isFromInbox` existant, étendu)
- [ ] Vérifier tous les points d'entrée vers `task-create-v2` (`dashboard`, `inbox`, `today`, + nouveaux via nav contextuel) : la tâche va dans l'écran d'origine sans étape superflue
- [ ] `E60Lists.tsx` : accent visuel sur la `li` d'une liste épinglée (bordure gauche + fond teinté colorés) pour distinguer nettement épinglée / non épinglée, au-delà du seul libellé du bouton
- [ ] Tests unitaires (destination forcée par origin, masquage du sélecteur, rendu de la ligne épinglée) + mise à jour des tests existants touchés (`E21CreateTaskV2.test.tsx`, `E60Lists.test.tsx`, `App.test.tsx`)

Gate : [ ] tests verts · [ ] `tsc -b` clean · [ ] lint clean · [ ] test manuel (validé par l'utilisateur) · [ ] sortie : depuis Planning/Today/Inbox le « + » crée la tâche dans l'écran courant sans demander la destination ; une liste épinglée est visuellement distincte

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

### Phase V4.1-6 — Auto-scroll vertical du drag planning [TODO]

Retour : lors du glissement d'une tâche vers un autre jour, une fois sur le nouveau jour, impossible de remonter/descendre pour choisir l'heure. Cause : aucun défilement vertical de la grille (`gridRef`, `overflowY: auto`) pendant le drag — seuls les bords latéraux (dwell gauche/droite → changement de jour) sont gérés.

- [ ] `E40Planning.tsx` : détecter la proximité du haut/bas de `gridRef` pendant un drag actif et faire défiler la grille verticalement (dwell/répétition symétrique à `armDwell` latéral), pour que tous les créneaux restent atteignables sans lâcher
- [ ] Ne pas casser la logique existante : drop via `slotFromPoint`, dwell latéral de changement de jour, `finishDrag` (retour anticipé si `edgeZoneAt !== null`)
- [ ] Tests (auto-scroll déclenché en zone haute/basse pendant drag ; pas de scroll hors drag) + e2e planning si le scénario est reproductible

Gate : [ ] tests verts · [ ] `tsc -b` clean · [ ] lint clean · [ ] test manuel (validé par l'utilisateur, appareil tactile) · [ ] sortie : pendant un drag, la grille défile pour atteindre n'importe quel créneau, y compris après un changement de jour

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Q à trancher (au fil des phases, non bloquant pour démarrer)

- **V4.1-3** : une catégorie de dépense peut-elle changer de périodicité après création (impact sur l'historique) ?

## Reporté hors V4.1

- Intégration accueil : saisie rapide de dépense + reste affiché sur le Dashboard (à cadrer, dépend du retour d'usage de Marie sur V4.1).
- Todo à date butoir + alerte accueil.
- Liste courses « particulière » (besoin jamais précisé par Marie — recadrer en visio).
- Retraits et virements entre livrets ; périodicités jour/année.
- Câblage global du chiffrement local (chantier transverse, pas spécifique au budget).
