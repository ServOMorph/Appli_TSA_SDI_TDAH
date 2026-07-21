# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

### Roadmap V4.1 active (`roadmap_v4.1.md`, Phase V4.1-2 à démarrer)
- [P2|ouvert] Phase V4.1-2 — Modèle de données Budget : entités `budgetCategory`/`budgetEntry`/`budgetAccount`/`budgetDeposit`, migration Dexie v4→v5, repositories, règles pures `budgetRules.ts`, pas d'UI
  - fait quand: migration v5 propre sur base existante, toutes les règles de calcul testées, aucun impact visible dans l'app, gate de phase coché.
  - réf: `roadmap_v4.1.md` § Phase V4.1-2

## Questions ouvertes
- Reste hors périmètre V4.1 (voir `roadmap_v4.1.md` § Reporté hors V4.1) : liste courses « particulière » (besoin jamais précisé par Marie), intégration accueil du budget, date butoir Todo, retraits/virements livrets, câblage global du chiffrement.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Roadmap `roadmap_v4.1.md` active à la racine (branche `v4.1`) : Phase V4.1-0 close et validée. 4 phases restantes (V4.1-1 à V4.1-4). Décisions de cadrage détaillées en tête du fichier roadmap.
- Cadrage Budget acté avec l'utilisateur (pas encore avec Marie) : périodicités semaine+mois uniquement, reset auto par période avec historique conservé, pas d'intégration accueil en V4.1, livrets simples (dépôt seul, pas de retrait/virement), données en clair (pas de chiffrement, cohérent avec le reste du modèle actuel qui n'a jamais câblé le mécanisme AES-GCM existant).
- `AppContext.tsx` déjà volumineux (751 lignes, ~85 propriétés) — vigilance à avoir en V4.1-3 pour ne pas l'alourdir sans extraction.
- Phase V4.1-0 codée : `Screen` étendu avec `'tools'`, `E70Tools.tsx` créé (hub avec entrées Todo/Budget placeholder/Listes épinglées vide), `activeTabFor` fait pointer `'tools'` et `'inbox'` vers le même tab `inbox` du `BottomNav` (libellé « Outils »), retour d'`E20Inbox` pointe vers `'tools'`. Pattern retour en dur (comme `E61ListDetail` → `'lists'`), pas de pile de navigation ni d'origin dynamique pour ce hub (un seul point d'entrée).
- Correctif trouvé en validation manuelle de V4.1-0, hors périmètre initial : `E21CreateTaskV2` affichait le choix de destination (Todo/Tâche du jour/Planifier/Liste) même quand la tâche est créée depuis Todo, où la destination est nécessairement Todo. Corrigé : section masquée et destination forcée (`effectiveDestination`) quand `taskCreateOrigin === 'inbox'`.
- Décision E9 (2026-07-18) appliquée à la lettre : la sous-tâche planifiable reste une `SubTask` rattachée à sa `Task` parente (champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés directement dessus), jamais promue en `TaskV2` indépendante avec `parent_task_id`.
- `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) généralisés pour accepter tout objet `{scheduled_start, scheduled_end}` (pas seulement `TaskV2`) — réutilisés tels quels pour les sous-tâches, pas de duplication de la logique de créneaux.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les écrans qui en dépendent.
- Un échec de test pré-existant et sans lien avec les sessions récentes (`AppContext.test.tsx`, pollution d'ordre entre tests sur `reportSubTaskV2`/`renameSubTaskV2`) confirmé via `git stash` — non bloquant, à investiguer si le volume de faux positifs augmente.

## Dernière session (2026-07-21, suite 5)

## Décisions prises
- Bouton épingler/désépingler placé sur `E60Lists.tsx` (liste des listes), pas sur `E61ListDetail.tsx` — question ouverte tranchée au codage.

## Livrables produits ou modifiés
- `src/domain/entities/list.ts` : champ optionnel `pinned_to_tools?: boolean`.
- `src/domain/rules/listRules.ts` : `togglePinList(list, now)`.
- `src/app/AppContext.tsx` : `togglePinList`, `listDetailOrigin`/`setListDetailOrigin` (pattern répliqué de `taskCreateOrigin`).
- `src/ui/screens/lists/E60Lists.tsx` : bouton épingler/désépingler par liste, origin `'lists'` posé avant `goTo('list-detail')`.
- `src/ui/screens/lists/E61ListDetail.tsx` : retour contextualisé (`listDetailOrigin ?? 'lists'`).
- `src/ui/screens/tools/E70Tools.tsx` : section « Listes épinglées », ouverture avec origin `'tools'`.
- `src/ui/screens/tasks/E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx` : origin `'lists'` posé explicitement sur leurs flux « déplacer tâche vers liste » pour ne pas hériter d'un `listDetailOrigin` périmé.
- Tests : `listRules.test.ts`, `E60Lists.test.tsx`, `E61ListDetail.test.tsx`, `E70Tools.test.tsx` mis à jour/étendus.
- `roadmap_v4.1.md` : Phase V4.1-1 marquée `[FAIT]`, gate intégralement coché.

## Hypothèses validées / invalidées
- VALIDE : épingler/désépingler une liste depuis l'onglet Listes la fait apparaître/disparaître dans Outils, ouverture fonctionnelle depuis les deux entrées avec retour contextuel — validé manuellement par l'utilisateur.

## Prochaine étape exacte
Démarrer la Phase V4.1-2 (modèle de données Budget : entités, migration Dexie v4→v5, repositories, règles pures, pas d'UI) sur demande de l'utilisateur.

## Question bloquante pour la session suivante
Aucune.
