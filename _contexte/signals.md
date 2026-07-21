# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

### Roadmap V4.1 active (`roadmap_v4.1.md`, Phase V4.1-1 à démarrer)
- [P2|ouvert] Phase V4.1-1 — Listes épinglables dans Outils : champ `pinned_to_tools?` sur `List`, action épingler/désépingler, section « Listes épinglées » du hub
  - fait quand: une liste créée dans l'onglet Listes apparaît dans Outils après épinglage, se désépingle, s'ouvre depuis les deux entrées, gate de phase coché.
  - réf: `roadmap_v4.1.md` § Phase V4.1-1

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

## Dernière session (2026-07-21, suite 4)

## Décisions prises
- Icône onglet Outils : aucune, seul le libellé change (le composant `BottomNav` n'a pas d'icônes).
- Placeholder Budget du hub : grisé et non cliquable plutôt que masqué (visible mais indisponible tant que V4.1-3 n'est pas codée).

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : `Screen` étendu avec `'tools'`.
- `src/App.tsx` : route `'tools'` → `E70Tools`, `activeTabFor` mappe `'tools'`/`'inbox'` vers le même tab, nav pointe vers `goTo('tools')`.
- `src/ui/components/BottomNav.tsx` : libellé « Todo » → « Outils ».
- `src/ui/screens/tasks/E20Inbox.tsx` : retour vers `'tools'` au lieu de `'dashboard'`.
- `src/ui/components/DevResetButton.tsx` : code écran `E70` ajouté.
- `src/ui/screens/tools/E70Tools.tsx` : créé (hub Outils).
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : correctif choix de destination masqué depuis Todo.
- Tests : `E70Tools.test.tsx` créé (4 tests), `BottomNav.test.tsx`/`App.test.tsx`/`E20Inbox.test.tsx`/`E21CreateTaskV2.test.tsx` mis à jour.
- `roadmap_v4.1.md` : Phase V4.1-0 marquée `[FAIT]`, gate coché.

## Hypothèses validées / invalidées
- VALIDE : hub Outils + Todo identique depuis le hub, validé manuellement par l'utilisateur.
- VALIDE : le choix de destination n'a de sens que depuis les points d'entrée hors Todo (Dashboard notamment) — confirmé par le retour utilisateur, corrigé.

## Prochaine étape exacte
Démarrer la Phase V4.1-1 (listes épinglables dans Outils) sur demande de l'utilisateur.

## Question bloquante pour la session suivante
Aucune.
