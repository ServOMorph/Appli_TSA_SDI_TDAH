## v5.2 — 2026-07-30

Phase V5-1 — navigation et écran d'accueil fusionné. Validation manuelle en attente (`tests_manuels.md`, points 101 à 109).

### Ajouté
- `src/ui/screens/dashboard/PlanningBoard.tsx` : corps du planning extrait de `E40Planning`, piloté par un état `collapsed`. Replié, il n'affiche qu'une fenêtre de créneaux autour de l'heure courante et masque la navigation par jour ; déplié, la journée entière défile. Créneaux, pickers, bannières de planification et de déplacement inchangés.
- `visibleSlotWindow()` (`planningSlotRules.ts`) : fenêtre de six créneaux ancrée sur le créneau courant, recalée pour rester entière en début et en fin de journée. 4 tests.
- `getEnergyPairLabel()` (`energyRules.ts`) : libellé « planifié / disponible » de la pastille d'énergie, avec repli sur le libellé simple quand l'énergie du jour n'est pas renseignée (E14, Q1). 4 tests.
- Poignée de dépliement/repliement sur l'accueil (E18), sous le planning en état replié, au-dessus en état déplié.
- Zone de widgets d'outils sur l'accueil (E24), portant en V5-1 deux entrées provisoires « Outils » et « Listes » — les vrais widgets arrivent en V5-3. Sans elles, le retrait des onglets rendait `tools`, `budget`, `lists` et `list-detail` inatteignables.

### Modifié
- `src/ui/components/BottomNav.tsx` : nav ramenée à quatre éléments — Boîte de réception, Accueil, Paramètres, « + » (N1). Les onglets Outils, Planning et Listes sont retirés ; le bouton pleine largeur « Ajouter une tâche » devient le segment « + ». La pastille de tâches en attente passe sur la boîte de réception.
- `src/App.tsx` : la route `planning` rend l'accueil fusionné en état déplié. `activeTabFor` mappe `dashboard` et `planning` sur le même onglet. Les six flux qui appelaient `goTo('planning')` (inbox, création, fiche tâche, décomposition, report) fonctionnent sans modification.
- `src/ui/screens/dashboard/E10Dashboard.tsx` : écran unique à deux états (E19, Q8). Replié : planning à l'heure courante, Tâche du jour, zone widgets. Déplié : planning entier scrollable seul, Tâche du jour et widgets masqués. La liste de cartes « Planning du jour » est remplacée par la grille réelle.
- `src/ui/components/EnergyDisplay.tsx` : affiche l'énergie planifiée et l'énergie disponible côte à côte (E14, Q1).
- `src/ui/components/TopBar.tsx` : la pastille de surcharge ouvre le centre de récupération quand la surcharge est active, et conserve la modale explicative quand elle est inactive (E21).
- `vite.config.ts` : `outDir` `dist/v4.1` → `dist/v5.0`, résidu de version aligné sur la branche active.
- e2e : sélecteurs adaptés à la nouvelle nav et à la fusion. `T44` réaffecté — « Terminer la tâche depuis le Planning » n'a plus de sens distinct, un seul écran portant les deux états ; il vérifie désormais que la pastille de surcharge ouvre le centre de récupération (E21).

### Supprimé
- `src/ui/screens/planning/` (`E40Planning.tsx`, `E40Planning.test.tsx`) : absorbé par l'accueil fusionné.
- Glisser-déposer du planning (~250 lignes : appui long, maintien aux bords pour changer de jour, overlay de glissement, neutralisation de la sélection de texte). Supprimé pendant la fusion plutôt que porté puis retiré en V5-2, conformément à l'arbitrage `Q10`. Le déplacement d'une tâche passe par le menu « Déplacer ».

## v5.1 — 2026-07-30

### Corrigé
- `src/app/navigation.ts` : `push()` ne remonte plus vers une occurrence antérieure du même écran dans la pile — cette clause anti-cycle tronquait les niveaux intermédiaires quand un écran sans paramètre différenciant (ex. `task-create-v2`) était réutilisé deux fois dans un même flux, cassant le retour contextuel (ex. depuis Aujourd'hui, la destination « Tâche du jour » n'était plus forcée après un second passage par la création). Détecté en validation manuelle de la Phase V5-0. Test de non-régression ajouté (`navigation.test.ts`).

### Validé
- Phase V5-0 (`roadmap_v5.0.md`) passée à `[FAIT]` : validation manuelle intégrale (points 83 à 100, `tests_manuels.md` purgé) — retours contextuels, non-régression Planning/Budget/Réglages/onboarding. Aucune régression fonctionnelle trouvée hors le bug de navigation ci-dessus.

### Constaté (non corrigé, tracé dans `roadmap_v5.0.md`)
- Réglage « Réduire les animations » (`E112Accessibility.tsx`) : mécanique correcte mais quasiment aucune animation à réduire dans l'interface actuelle. Angle mort produit, reporté hors V5.
- `exportData()` (`useSettingsState.ts`) lit la table `energyEntries` brute au lieu de passer par `EnergyEntryRepository` : `energy_entries[].value` sort non déchiffré dans l'export si le chiffrement local est activé. Bug isolé, hors périmètre V5-0, à corriger séparément.

## v5.0.0 — 2026-07-30

### Ajouté
- `src/app/navigation.ts` : pile de navigation et route porteuse de paramètres (`Route`, `NavStack`, `push`/`pop`/`replace`, `previousRoute`). Remplace l'union plate `Screen` à 23 valeurs comme source de vérité ; `Screen` reste exporté comme alias de `Route['name']`. 21 tests.
- `src/domain/rules/planningSlotRules.ts` : logique de calcul de créneaux extraite de `E40Planning.tsx` (`slotTime`, `slotLabel`, `slotFromDate`, `addDays`, `formatPlanningDate`, `isRangeAvailable`, `normalizeRange`, `moveTargetRange`). Prérequis de la fusion accueil/planning (Q8). 22 tests.
- `src/app/repositories.ts` : instances de repositories, `todayDate` et `newId` partagés par les contextes de domaine.
- `src/app/contexts/` : six modules d'état par domaine — `useTasksState` (tâches V1 et sous-tâches), `usePlanningState` (tâches V2, placement, déplacement), `useEnergyState`, `useListsState`, `useBudgetState`, `useSettingsState`.
- `goToPath(routes)` : empile un chemin de navigation complet, pour les écrans qui doivent retomber sur un parent qui n'est pas l'écran d'appel.

### Modifié
- `src/app/AppContext.tsx` : 961 → 169 lignes. Devient la façade qui compose les six domaines ; `useApp()` conserve la même surface, aucun écran n'a changé d'API. Aucun module d'état ne dépasse 300 lignes.
- `E40Planning.tsx` : branché sur `planningSlotRules`, helpers locaux dupliqués supprimés.

### Supprimé
- `taskCreateOrigin`, `taskDetailOrigin`, `listDetailOrigin` et leurs setters : les retours codés en dur sont remplacés par la pile (`back(fallback)`), l'origine étant dérivée via `originScreen`.

## v4.24 — 2026-07-28

### Modifié
- `roadmap_v5.0.md` : Q10 révisé, tranché directement avec l'utilisateur — abandon du glisser-déposer sur le planning au profit d'une fiche tâche cliquable (date, horaire, alerte, énergie éditables individuellement), alignée sur l'application de référence de la testeuse. Rend obsolètes la dette V4.1-6 (auto-scroll pendant drag) et la validation tactile du correctif de sélection de texte du 2026-07-25. Q2 résolu (« Sentiments » → « Météo du jour »), Q3 résolu (« joint » → « Comptage »), ordre de priorité des 5 outils reportés fixé (Comptage en premier).
- `a_communiquer_v5.md` (racine) : créé — synthèse finale à communiquer à la testeuse à la livraison de la V5.0 (envoi différé, décision explicite).

### Corrigé
- 7 fichiers de communication testeuse devenus obsolètes supprimés (questions déjà répondues dans des visios ultérieures, ou remplacées par `a_communiquer_v5.md`).

## v4.23 — 2026-07-28

### Ajouté
- `.claude/commands/analyse_visio.md` : commande corrigée en profondeur après échec constaté en exécution — appariement horodaté du `.jsonl` remplacé par un appariement ordinal par annonce vérifié image par image (le premier avait un retard cumulatif de ~20 min sur ce jeu de données) ; garde-fou d'intégrité systématisé ; étape d'arbitrage interactif ajoutée avant l'écriture de la roadmap ; lecture conditionnelle des documents non lisibles (`.docx`) ; étape finale d'archivage/promotion de roadmap.
- `roadmap_v5.0.md` (racine) : roadmap V5.0 issue de la visio testeuse du 2026-07-28 (`Note de réunion/2026-07-28/`), 4 phases socle (V5-0 à V5-3), 7 arbitrages tranchés avec l'utilisateur. `Note de réunion/2026-07-28/captures_2026-07-28.md`, `constats_2026-07-28.md`, `a_communiquer_2026-07-28.md` produits en amont.

### Modifié
- Branche `v5.0` créée depuis `v4.1`.
- `roadmap_v4.1.md` archivée (`Archives/roadmap_v4.1.md`).

## v4.22 — 2026-07-25

### Corrigé
- `E40Planning.tsx` : sélection de texte parasite du navigateur pendant le drag-and-drop d'une tâche (déclenchée par le long-press). `userSelect`/`touchAction: none` sur les cellules du planning, purge de la sélection au démarrage du drag, `userSelect: none` sur la page tant que le drag est actif. Correctif hors roadmap, signalé par l'utilisateur. 474/474 tests verts, `tsc -b` clean. Validation manuelle tactile à confirmer.

## v4.21 — 2026-07-25

### Ajouté
- Nav « + » contextuel (`App.tsx`) : pose désormais l'écran courant comme origin de création de tâche au lieu de `'dashboard'` en dur.
- `E21CreateTaskV2.tsx` : `effectiveDestination` généralisé via `FORCED_DESTINATION_BY_ORIGIN` (`inbox`/`tools`→`todo`, `today`→`today`, `planning`→`planned`, `lists`→`list`) ; depuis Listes, le « + » ouvre directement le sélecteur de liste (existante ou création d'une nouvelle liste) sans passer par le choix générique à 4 destinations.
- `E60Lists.tsx` : accent visuel (bordure gauche + fond teinté) sur une liste épinglée dans Outils, distinct du seul libellé du bouton.

### Validé
- Phase V4.1-5 (`roadmap_v4.1.md`) close. 474/474 tests unitaires au run de clôture, `tsc -b` clean, lint clean. Validation manuelle intégrale confirmée par l'utilisateur (`tests_manuels.md` points 74-82, purgés).

## v4.20 — 2026-07-25

### Corrigé
- Dette e2e du renommage nav Todo→Outils (Phase V4.1-0) : `02-tasks.spec.ts`, `06-offline.spec.ts`, `07-planning-v4.spec.ts` mis à jour (flux via hub Outils, suppression du clic sur le sélecteur de destination masqué depuis V4.1-0). Bug de test lié découvert en cascade : bouton Retour de `E20Inbox` pointant vers le hub Outils depuis V4.1-0 (au lieu du Dashboard), tâche déplacée invisible après Retour (T14) — assertion corrigée.

### Validé
- Cause des 10 échecs e2e confirmée unique (renommage nav, pas de régression fonctionnelle). Suite e2e complète 53/53 verte, suite unitaire 464/466 (flaky pré-existant `AppContext.test.tsx`, sans lien).

## v4.19 — 2026-07-25

### Ajouté
- Roadmap `roadmap_v4.1.md` : Phase V4.1-5 (ajout de tâche contextuel selon l'écran d'origine, distinction visuelle liste épinglée) et Phase V4.1-6 (auto-scroll vertical de la grille planning pendant un drag), toutes deux `[TODO]`.

### Validé
- Les 4 retours bruts de `bug et ameliorations.txt` triés et intégralement repris dans la roadmap — aucun écarté hors périmètre. Aucun code applicatif modifié cette session.

## v4.18 — 2026-07-25

### Modifié
- `outDir` de `vite.config.ts` corrigé (`dist/v3` → `dist/v4.1`, résidu de version), aligné sur la branche/version active.

### Validé
- Build de production régénéré avec succès (`tsc -b` + `vite build` + PWA) vers `dist/v4.1/`.

## v4.17 — 2026-07-25

### Modifié
- Refonte de lisibilité de l'écran Budget (`E71Budget.tsx`) sur retour utilisateur : hiérarchie visuelle renforcée (Restant avant Dépensé), reste non budgétisé mis en avant (gros chiffre coloré vert/rouge selon le signe), dépassement de budget signalé par la couleur du Restant de catégorie, boutons destructifs (Supprimer, Supprimer la dépense/le dépôt/le livret) distingués en rouge des actions neutres, accent visuel par période (pastille + bordure colorée, semaine/mois), formulaire de catégorie allégé (Type et Périodicité groupés).

### Corrigé
- Modales de confirmation de suppression (catégorie/livret) : le texte affichait encore « seront conservées » alors que la suppression est réellement en cascade depuis la correction d'intégrité précédente — corrigé pour refléter le comportement réel.

### Validé
- 465/466 tests unitaires (flaky pré-existant `AppContext.test.tsx`, sans lien), `tsc -b` clean, lint clean, build et e2e Budget 2/2 verts après adaptation des assertions au nouvel ordre Restant/Dépensé. Rendu visuel réel non vérifié en navigateur dans cette session.

## v4.16 — 2026-07-25

### Corrigé
- Intégrité relationnelle du Budget : migration Dexie v6 supprimant les dépôts/écritures orphelins issus d'une suppression de livret ou de catégorie ; `deleteBudgetCategory`/`deleteBudgetAccount` suppriment désormais en cascade les écritures/dépôts liés une fois la suppression confirmée.
- Périodicité des dépôts (`period: 'week' | 'month'`, sélecteur ajouté au formulaire) : un dépôt n'est plus déduit simultanément des vues semaine et mois ; existant migré vers `month`.
- Bouton de suppression d'une dépense libellé « Supprimer la dépense » (ambigu avec le bouton de suppression de la catégorie, relevé en validation manuelle).

### Modifié
- Script de lancement dev déplacé de `scripts/run_dev.py` vers `run.py` (racine), référence corrigée dans `llms.txt`.

### Validé
- Phase V4.1-4 close : validation manuelle intégrale des points 48 à 73 confirmée par l'utilisateur ; `tests_manuels.md` purgé de tous les points validés. Roadmap `roadmap_v4.1.md` intégralement terminée (V4.1-0 à V4.1-4). 466/466 tests unitaires verts (seul échec rencontré : le flaky pré-existant `AppContext.test.tsx`, sans lien), `tsc -b` clean, lint clean, e2e Budget 2/2 verts (nouveau scénario T53 sur la suppression en cascade).

## v4.15 — 2026-07-21

### Ajouté
- Phase V4.1-3 validée : configuration des catégories Budget et des livrets depuis `E71Budget`.
- Phase V4.1-4 implémentée : saisie et suppression des dépenses/dépôts, calcul des soldes, navigation dans l'historique semaine/mois et recalcul après correction.
- Parcours `tests_manuels.md`, tests unitaires Budget et scénario e2e `e2e/08-tools-budget.spec.ts`.

### Corrigé
- Actions de suppression rendues explicites dans les livrets : « Supprimer le dépôt » et « Supprimer le livret ».
- État React rechargé depuis Dexie après suppression directe d'une dépense ou d'un dépôt.

### Validé
- Phase V4.1-3 validée manuellement ; Phase V4.1-4 validée jusqu'au point 47. Tests Budget ciblés, build, lint et e2e Budget verts.

### En attente
- Phase V4.1-4 non close : les dépôts d'un livret supprimé deviennent orphelins, invisibles mais encore comptés. Migration de réparation, suppressions en cascade et périodicité des dépôts à implémenter avant la reprise au point 48.
- Suite Vitest complète : un échec intermittent pré-existant dans `AppContext.test.tsx`.

## v4.14 — 2026-07-21

### Ajouté
- Phase V4.1-2 codée : quatre entités et tables Budget, migration Dexie v4→v5, quatre repositories et règles pures pour les périodes, catégories, totaux, reste non budgétisé et soldes des livrets.
- Tests de migration d'une base v4 existante, des repositories et des règles Budget : 27/27 verts.

### Corrigé
- `E61ListDetail` : `getListItems` stabilisé et déclaré dans les dépendances du `useEffect`, supprimant l'avertissement lint.

### Validé
- Build et lint verts. Suite complète à 454/455 avec un échec intermittent pré-existant dans `AppContext.test.tsx`, sans lien avec la Phase V4.1-2.

## v4.13 — 2026-07-21

### Ajouté
- Phase V4.1-1 codée : champ `pinned_to_tools?` sur `List`, règle `togglePinList`, bouton épingler/désépingler sur `E60Lists.tsx`, section « Listes épinglées » sur le hub `E70Tools.tsx`, retour contextuel de `E61ListDetail` (`listDetailOrigin`).

### Validé
- Phase V4.1-1 validée manuellement par l'utilisateur. 433/435 tests unitaires verts (2 échecs pré-existants sans lien), `tsc -b` clean.

## v4.12 — 2026-07-21

### Ajouté
- Phase V4.1-0 codée : nouvel écran hub `E70Tools.tsx` (screen `'tools'`), onglet nav « Todo » renommé « Outils », `E20Inbox` accessible depuis le hub avec retour vers celui-ci.

### Corrigé
- `E21CreateTaskV2` : depuis Todo, le choix de destination (Todo/Tâche du jour/Planifier/Liste) n'a plus de sens et n'est plus affiché — la tâche est créée directement dans Todo.

### Validé
- Phase V4.1-0 validée manuellement par l'utilisateur. 427 tests unitaires verts, `tsc -b` clean.

## v4.11 — 2026-07-21

### Ajouté
- `roadmap_v4.1.md` créée à la racine (5 phases V4.1-0 à V4.1-4) : cadrage complet d'E3 — rubrique nav « Outils » remplaçant « Todo » (Todo tel quel, listes épinglables, module Budget semaine/mois avec catégories, revenus multiples, livrets simples, reste non budgétisé).

### Décidé
- Nav « Outils » (pluriel) ; onglet Listes conservé, listes épinglables dans Outils plutôt que dupliquées. Budget : périodicités semaine/mois, reset auto par période avec historique conservé, données en clair (cohérent avec le reste du modèle non chiffré). Hors périmètre V4.1 : intégration accueil, date butoir Todo, liste courses spécialisée, virements livrets.

## v4.10 — 2026-07-21

### Modifié
- Ménage complet de la racine du projet (8 points validés par l'utilisateur) : `docs/adr/` fusionné dans `_docs/adr/`, scripts regroupés dans `scripts/`, `SERVEURS.md` fusionné dans `README.md`, `validation_manuelle.md` archivé, `Retours/` fusionné dans `Note de réunion/`, `dist/v1`/`dist/v2` supprimés (`dist/v3` conservée), `.gitignore` ignore `dist/` entier.
- `roadmap_v4.md` archivé (`Archives/roadmap_v4.md`) — plus aucune roadmap active à la racine.

### Ajouté
- Branche `v4.1` créée depuis `v4` et activée.

## v4.9 — 2026-07-21

### Validé
- V2-10 (doc V2, déploiement Netlify, branche `v2`) confirmée terminée par l'utilisateur — roadmap V2 intégralement close.

## v4.8 — 2026-07-21

### Validé
- Point 1.5 de `validation_manuelle.md` (bouton « Renommer » une sous-étape depuis E22) validé par l'utilisateur.
- Phase V4-5 close. Roadmap V4 intégralement terminée (V4-0 à V4-5).

## v4.7 — 2026-07-19

### Ajouté
- Phase V4-5 codée : sous-tâches planifiables (E9a modèle de données, E9b affichage hiérarchique, E9c point d'entrée « Planifier »), avec parité complète d'interactions (glisser, menu déplacer/renommer/supprimer, report) entre tâche et sous-tâche planifiées, sur demande explicite de l'utilisateur.
- Bouton « Renommer » une sous-étape ajouté sur l'écran de détail de tâche (E22), sur retour utilisateur en cours de validation manuelle.

### Modifié
- `SubTask` reste rattachée à sa tâche parente (pas de promotion en `TaskV2` indépendante), conforme à la décision E9 du 2026-07-18 — migration Dexie v3→v4.
- `E40Planning.tsx` réécrit autour d'un type union `PlanBlock` (tâche/sous-tâche) pour porter la parité d'interactions sans dupliquer la logique de glisser/menu/report.

### Validé
- 422/422 tests unitaires, `tsc -b` clean, eslint 0 erreur, 51/51 e2e (T51 nouveau). Validation manuelle quasi close (1.1-1.4, 2.1-2.3, 3.1-3.6 confirmés) ; point 1.5 (renommer depuis E22) en attente.

## v4.6 — 2026-07-19

### Ajouté
- Phase V4-4 codée : menu déplacer/renommer/supprimer sur une tâche planifiée (E6), glisser souris/tactile avec lecture directe de la case sous le curseur et zones de bord pour changer de jour (E1), report vers un créneau choisi (E8).
- E6 (« Déplacer ») et E8 (« Reporter ») unifiés sur le flux « tâche en main » (bandeau, navigation libre entre les jours) au lieu d'une modale de liste de créneaux — retirée sur demande de l'utilisateur.

### Corrigé
- `E40Planning.tsx` : `reload()` rechargeait le mauvais jour après une bascule pendant un glisser en cours (closure figée dans un écouteur `window` de longue durée) — corrigé via une ref toujours à jour.

### Validé
- Tous les points de `validation_manuelle.md` V4-4 passés. 403/403 tests unitaires, `tsc -b` clean, 50/50 e2e. Phase V4-4 close ; roadmap V4 passe à la Phase V4-5.

## v4.5 — 2026-07-19

### Corrigé
- Validation manuelle V4-3 close : bandeau « tâche en cours de planification » repositionné en fixe au-dessus du bouton « Ajouter une tâche » (`E40Planning.tsx`), espace ajouté entre le nom de tâche et l'icône batterie sur la carte « Planning du jour » (`E10Dashboard.tsx`).
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`) au lieu d'une constante CSS figée — supprime un interstice de grille de planning visible sous le bandeau.

### Validé
- Tous les points de `validation_manuelle.md` V4-3 passés, dont B2. 386/386 tests unitaires, `tsc -b` clean, 47/47 e2e. Phase V4-3 close ; roadmap V4 passe à la Phase V4-4.

## v4.4 — 2026-07-19

### Modifié
- V4-3 codée : plages multi-créneaux, tâche active replaçable, retrait de « Répéter demain » et modale énergie/obligatoire fusionnée.
- Gates automatisés mis à jour : 386/386 tests unitaires et 47/47 e2e verts.

### En attente
- Validation manuelle V4-3 à passer avant la clôture de la phase.

## v4.3 — 2026-07-19

### Corrigé
- Phase V4-1 clôturée : retour vers l'écran d'origine après création de tâche et modale d'explication du mode surcharge.
- Phase V4-2 clôturée : créneaux colorés, coche réversible sur les tâches planifiées et conservation des tâches terminées.

### Validé
- 388/388 tests unitaires, build TypeScript, 45/45 tests e2e et validation manuelle complète.

## v4.2 — 2026-07-19

### Ajouté
- Phase V4-1 (Quick wins UI) codée : D2 (libellés check-in « aujourd'hui » → « maintenant » sur `E31EnergyCheckIn.tsx`, `E03Energy.tsx`, `E30EnergyView.tsx`), E7 (bouton « Mode surcharge » de la TopBar rendu permanent, grisé hors surcharge / coloré actif, cliquable dans les deux états), D4 (l'ajout de tâche depuis Todo ne propose plus la destination « Planifier », via nouveau state `taskCreateOrigin` dans `AppContext.tsx`). 383/383 tests, `tsc -b` clean.
- E2, E8, E9 tranchés avec l'utilisateur (chevauchement de plage bloquant, coût énergétique compté une fois par tâche, choix de créneau au lieu de report automatique, sous-tâche rattachée au parent).

### Corrigé (à faire)
- B3 : le retour depuis l'écran de création de tâche (`E21CreateTaskV2.tsx`) ramène toujours vers Todo au lieu de l'écran d'origine — ajouté à la Phase V4-1, non corrigé cette session.
- B4 : le bouton « Mode surcharge » doit ouvrir une modale d'explication détaillée (bouton Fermer) au lieu du texte inline actuellement codé — ajouté à la Phase V4-1, non corrigé cette session.

## v4.1 — 2026-07-18

### Ajouté
- Phase V4-0 (refacto préalable) codée et validée manuellement (`validation_manuelle.md`, 20/20 points) : `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) pour l'occupation du planning par plage de créneaux ; variable CSS `--color-accent` injectée depuis `Settings.ambiance_color`.
- B1 tranché (périmètre large) et codé : la couleur d'ambiance s'applique à tous les boutons utilisant le bleu clair de base (`Button`, `BottomNav`, `E120Resources`, `E31EnergyCheckIn`, `E03Energy`, `E21CreateTaskV2`, `E40Planning`).

## v4.0 — 2026-07-18

### Contexte
Bascule vers roadmap V4 — voir `roadmap_v4.md`. `roadmap_v3.md` (7 phases, intégralement close) archivé dans `Archives/`.

### Ajouté
- Analyse de la visio Marie du 2026-07-16 : `Note de réunion/2026-07-16/constats_2026-07-18.md` (17 constats). Répond aux 4 points V3 en attente (Reporter, fréquence check-in, bouton surcharge, sous-tâches).
- Roadmap V4 (`roadmap_v4.md`, racine, 6 phases V4-0 à V4-5), supersédant le brouillon du 2026-07-13 — ordre des phases revu (multi-créneaux/récurrence avant interactions sur une tâche), retrait de « Répéter demain » regroupé avec son remplaçant. Aucune phase codée.
- Branche `v4` créée depuis `v3` et activée.

## v3.16 — 2026-07-13

### Ajouté
- Analyse de la visio Marie du 2026-07-13 (écourtée) : `Note de réunion/2026-07-13/constats_2026-07-13.md` (7 constats) et `Note de réunion/2026-07-13/roadmap_v4.md` (brouillon, 4 phases) — non promue à la racine, aucun code touché.

## v3.15 — 2026-07-09

### Corrigé
- Tests e2e Playwright : T19 supprimé (`e2e/02-tasks.spec.ts`) — testait la limite « 3 tâches/jour » retirée intentionnellement en V3-1, confirmé non-régression. 44/44 verts.

### Ajouté
- Icône batterie ajoutée au pill énergie du Dashboard/TopBar (`EnergyDisplay.tsx`), affichée uniquement quand une valeur d'énergie est saisie.

### Modifié
- Modale de planification (E1/E2, `E40Planning.tsx`) refondue en flux 3 étapes séquentielles : nom de la tâche (Valider) → grille de sélection d'énergie 1-12 (option Passer) → choix « Obligatoire ? » via deux boutons Oui/Non à finalisation directe (sans bouton de validation supplémentaire).
- `vite.config.ts` : `build.outDir` basculé de `dist/v2` à `dist/v3` pour préserver le rollback V2 ; `dist/v3/` ajouté au `.gitignore` (régénérable via `npm run build`).
- `roadmap_v3.md` : Q3 (couleur à la connexion) et « reset données » cochés — décisions déjà actées, roadmap mise à jour en conséquence.

### Validé
- Test manuel 13.2 (mode offline) validé sur le build `dist/v3`.
- 29/29 tests `E40Planning.test.tsx`, 44/44 e2e, `tsc -b` clean.

## v3.14 — 2026-07-07

### Corrigé
- Tests e2e Playwright remis en état (`e2e/`) : cause élargie au-delà du signal initial (écran `E04FirstTask` supprimé depuis V3-1) à 4 dérives cumulées — titre Dashboard obsolète (`Appli pour AuDHD` → `AuDHD`, 6 fichiers), bouton « Ajouter une tâche » dupliqué (BottomNav persistante V3-6 + bouton propre à `E20Inbox.tsx`) causant des violations de mode strict Playwright, `aria-label` de déplacement passé de « Aujourd'hui » à « Tâche du jour » (V3-1), mode surcharge devenu 100% automatique depuis V3-3 (plus de bouton manuel). `e2e/05-overload.spec.ts` réécrit intégralement pour déclencher/désactiver la surcharge via le mécanisme automatique réel. Corrigé côté tests uniquement, aucun changement de code applicatif.

### Validé
- 44/45 tests e2e verts. T19 (`02-tasks.spec.ts`) reste en échec sciemment : teste la limite « 3 tâches/jour » retirée intentionnellement en V3-1 (décision Q1, confirmée via `_contexte/archive_decisions.md`) — suppression du test à faire en session suivante, pas une régression.

## v3.13 — 2026-07-07

### Modifié
- Bouton « Mode surcharge désactivé » de la TopBar retiré hors surcharge (`TopBar.tsx`) — n'apparaît plus que quand la surcharge est active. Écart assumé avec une demande explicite antérieure de Marie (bouton visible, grisé, informatif hors surcharge) ; point ajouté à `Note de réunion/a demander a Marie.md` pour reconfirmation.

### Validé
- 29/29 tests (`E10Dashboard.test.tsx`) verts, `tsc -b` clean.

## v3.12 — 2026-07-07

### Corrigé
- Espacement des créneaux du Planning (`E40Planning.tsx`) rendu symétrique : suppression du `minHeight` fixe (64px) qui créait un espace plus grand en bas qu'en haut autour de la case de tâche. Les créneaux occupés s'ajustent désormais à leur contenu réel, les créneaux vides sont alignés sur la même hauteur via un placeholder invisible (`emptySlotPlaceholderStyle`) plutôt qu'une valeur en dur.

### Validé
- 29/29 tests (`E40Planning.test.tsx`) verts, `tsc -b` clean. Changement visuel mineur hors gate de phase — pas de test manuel dédié.

## v3.11 — 2026-07-07

### Modifié
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (`E10Dashboard.tsx`).
- Symbole d'énergie changé de cuillères à batterie à la demande de l'utilisateur (moins connoté spoon theory) : `SpoonIcon`/`SpoonCost` supprimés, remplacés par `BatteryIcon`/`BatteryCost` (`src/ui/components/`). Câblé sur le Dashboard et le Planning (remplacement direct), et ajouté aux 3 écrans de check énergie (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`, `E30EnergyView.tsx`) qui n'affichaient aucun symbole auparavant.

### Validé
- 374/374 tests unitaires verts, `tsc -b` clean. Changement visuel mineur hors gate de phase (roadmap V3 déjà close) — pas de test manuel dédié.

## v3.10 — 2026-07-07

### Ajouté
- Phase V3-6 (nav persistante, N1) codée intégralement : `BottomNav` monté une seule fois dans `App.tsx` en position fixe (bottom), affiché sur tous les écrans sauf l'onboarding (`welcome`/`profile`/`energy`) et le check-in énergie quotidien (`energy-checkin`) ; onglet actif mis en valeur (`activeTabFor`), pastille rouge Todo conservée, 4ᵉ onglet « Accueil » ajouté pour revenir au Dashboard depuis n'importe quel écran.
- `--bottomnav-h` (`index.css`) et `padding-bottom` réservé sur 17 écrans pour qu'aucun contenu ne soit caché derrière la nav fixe.
- `plan_test_manuel_v3-6.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.
- `src/ui/components/BottomNav.test.tsx` et `src/App.test.tsx` : nouveaux tests (nav directe sur le composant, mapping écran → onglet, montage global).

### Modifié
- `E10Dashboard.tsx` : retrait du montage local de `BottomNav` (désormais global).
- Tests de nav obsolètes de `E10Dashboard.test.tsx` migrés vers `BottomNav.test.tsx`/`App.test.tsx`.

### Validé
- **Phase V3-6 close, roadmap V3 (7 phases, V3-0 à V3-6) intégralement close** : gate intégral (374/374 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Reporté
- Comportement de l'action « Reporter », fréquence du check-in énergie et rythme du bouton « Répéter demain » : à reconfirmer avec Marie — consigné dans `Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.
- V2-10 (mode offline, doc V2, déploiement Netlify) : reste en suspens sur la branche `v2`.

## v3.9 — 2026-07-07

### Ajouté
- Phase V3-5 (Listes) codée intégralement : hiérarchie visuelle entre la vue globale des listes (`E60Lists.tsx`, grosses cases, inchangée) et l'intérieur d'une liste (`E61ListDetail.tsx`, cases resserrées — padding `--spacing-xs`, radius `--radius-sm`) (L1, L2) ; titre de la liste encadré du même style que les lignes de la vue globale (L3).
- `plan_test_manuel_v3-5.md` : plan de test manuel (3 sections), passé intégralement le 2026-07-07.

### Corrigé
- `E03Energy.tsx` (onboarding) : échelle d'énergie corrigée de 1-10 à 1-12 (`ENERGY_MIN`/`ENERGY_MAX`), cohérente avec `E31EnergyCheckIn.tsx`.
- Affichage des valeurs d'énergie sur deux lignes fixes de 6 dans `E03Energy.tsx` et `E31EnergyCheckIn.tsx` (au lieu du `flexWrap` libre dépendant de la largeur d'écran).

### Validé
- **Phase V3-5 close** : gate intégral (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Reporté
- Rythme du bouton « Répéter demain », comportement de l'action « Reporter » et fréquence du check-in énergie : à reconfirmer avec Marie — consigné dans `Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.

### Supprimé
- `plan_test_manuel_v3-4.md` (nettoyage intentionnel, phase déjà close).

## v3.8 — 2026-07-07

### Ajouté
- Phase V3-4 (Planning : cuillères, couleurs, récurrence) codée intégralement : composant cuillères sobre (`SpoonIcon.tsx`, `SpoonCost.tsx`), coût affiché en cuillères sur le planning (E7/E8) ; texte des cases agrandi et centré (P1) ; bouton « Terminer » ajouté au Planning, cases pastel quand une tâche est placée (P2) ; couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité, `src/ui/styles/ambiance.ts`) pilotant les teintes pastel/flashy (P3) ; tâche terminée en version flashy de la couleur d'ambiance (P4b) ; « Planning du jour » du Dashboard en cartes pastel comme « Tâche du jour » (D5).
- Récurrence (P6) : bouton « Répéter demain » sur chaque tâche planifiée (Planning et Dashboard) — `duplicateTaskV2ToNextDay` (`taskRulesV2.ts`), `repeatTaskTomorrow` (`AppContext.tsx`). Duplique la tâche au lendemain, même créneau, et ouvre directement le jour du duplicata (`planningTargetDate`/`setPlanningTargetDate`, AppContext).
- `plan_test_manuel_v3-4.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.

### Validé
- **Phase V3-4 close** : gate intégral (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc).

### Corrigé
- P6 : une première version (avance automatique au jour suivant après chaque tâche planifiée, sans bouton dédié) a été testée manuellement et invalidée — elle masquait la tâche qu'on venait de placer, lue comme un bug. Remplacée par le bouton explicite « Répéter demain » ci-dessus.

### Reporté
- Rythme du bouton « Répéter demain » (1 clic par jour), comportement de l'action « Reporter » et fréquence du check-in énergie : à reconfirmer avec Marie — consigné dans `Note de réunion/a demander a Marie.md` et `_contexte/signals.md`.

### Supprimé
- `plan_test_manuel_v3-3.md` (nettoyage intentionnel, phase déjà close).

## v3.7 — 2026-07-07

### Ajouté
- Action « Reporter » (Phase V3-3, E6) : `postponeTaskV2` (`taskRulesV2.ts`) et `postponeTask` (`AppContext.tsx`) replanifient automatiquement une tâche non-obligatoire grisée au lendemain, même créneau horaire ; bouton « Reporter » dans `E10Dashboard.tsx` et `E40Planning.tsx`. Décision provisoire, non validée par Marie sur ce mécanisme précis.
- `plan_test_manuel_v3-3.md` : plan de test manuel (5 sections), passé intégralement le 2026-07-07.

### Validé
- **Phase V3-3 close** : gate intégral (353/353 tests, `tsc -b` clean, eslint 0 erreur, test manuel, doc). Navigation restreinte au Dashboard/Centre récupération en mode surcharge confirmée intentionnelle par l'utilisateur (initialement suspectée à tort comme un bug bloquant, vérifiée puis levée).

### Reporté
- Comportement de l'action « Reporter » et fréquence du check-in énergie (une fois/jour vs chaque ouverture) : à reconfirmer avec Marie — consigné dans `Note de réunion/a demander a Marie.md`.

### Supprimé
- `plan_test_manuel_v3-1.md`, `plan_test_manuel_v3-2.md` (nettoyage intentionnel, phases déjà closes).

## v3.6 — 2026-07-07

### Ajouté
- Phase V3-3 (check-in + surcharge automatique) codée : `overloadMode` (AppContext) désormais 100% dérivé (`isOverloaded` sur énergie du jour vs coût planifié restant, `todayPlannedTasks`/`refreshTodayPlanned`) — plus de toggle manuel. Check-in énergie routé automatiquement à l'ouverture si aucune saisie du jour, échelle corrigée 1-10 → 1-12. Bouton TopBar devenu informatif (détail chiffré au clic). "Planning du jour" reste visible en surcharge (obligatoires en pastel, non-obligatoires grisées), résout l'effet de bord D1 en attente depuis V3-1. 341/341 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.

### Modifié
- `src/domain/entities/settings.ts` : champ `overload_mode` retiré (mort, remplacé par la dérivation automatique)
- `src/ui/screens/overload/E90OverloadRecovery.tsx`, `src/ui/components/BottomNav.tsx` : boutons de désactivation manuelle devenus invalides, remplacés par une navigation retour

### Reporté
- Action « Reporter » sur les tâches non-obligatoires grisées en surcharge (E6) : décision explicitement laissée ouverte à la demande de l'utilisateur, à trancher en session suivante.

## v3.5 — 2026-07-07

### Validé
- Test manuel de la Phase V3-2 passé intégralement (tous cas OK) — gate de phase clos.

## v3.4 — 2026-07-07

### Ajouté
- Phase V3-2 (énergie : domaine + saisie) codée intégralement : `getRemainingPlannedCost` et `setEnergyCostV2` (`taskRulesV2.ts`, purs), fenêtre à deux carrés (sélecteur d'énergie 1-12 + case « obligatoire ») dans `E40Planning.tsx` au moment de l'assignation à un créneau, `essential` câblé via `toggleEssentialV2` existant (ferme le trou fonctionnel V2-10), affichage minimal du coût sur les cases du Planning et du Dashboard. 342/342 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.
- `plan_test_manuel_v3-2.md` : plan de test manuel dédié à la Phase V3-2 (4 sections).

### Modifié
- `AppContext.tsx` : `schedulePendingTask` étend sa signature (`energyCost`, `essential`) pour persister le coût en énergie et le caractère obligatoire à la création d'une tâche planifiée.

## v3.3 — 2026-07-07

### Validé
- Test manuel de la Phase V3-1 passé intégralement (27/27 cas OK) — gate de phase clos.
- Point mode surcharge sans tâche visible (effet de bord D1) explicitement reporté à la Phase V3-3.

## v3.2 — 2026-07-06

### Ajouté
- Phase V3-1 (bugs + nettoyage UI) codée intégralement : B1 (plus de tâche `planned` fantôme non schedulée en cas d'abandon de la planification), B2 (contraste des cases du Planning en thème clair), B3 (vérifié non reproductible), D1 (bloc "Que faire maintenant ?" retiré), D2 (question "chose la plus importante" retirée de l'onboarding), D3 (section "Tâche du jour" réordonnée au-dessus de "Planning du jour", police agrandie), D4/D4b (segment de nav "Aujourd'hui" retiré, destination de création renommée "Tâche du jour"), P4a (tâche planifiée terminée reste affichée), P5 (case vide du Planning propose d'ajouter une tâche directement plutôt qu'une liste de backlog), Q1 (limite de 3 tâches du jour et modale associée retirées). 330/330 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.
- `plan_test_manuel_v3-1.md` : plan de test manuel dédié à la Phase V3-1 (27 cas).

### Modifié
- `AppContext.tsx` : `pendingPlanTask`/`startPlanTask`/`clearPendingPlanTask`/`schedulePendingTask` remplacent `planTodoTask`/`getUnscheduledPlannedTasks` — une tâche en cours de planification n'est plus persistée avant qu'un créneau soit validé (fix B1).

### Retiré
- Écran `E04FirstTask` et `actionImmediateRules.ts` (devenus morts après D1/D2).

## v3.1 — 2026-07-06

### Ajouté
- Phase V3-0 (refacto préalable) close : constantes/schéma énergie (`ENERGY_MIN`/`ENERGY_MAX`, Dexie v3 `energy_cost`/`ambiance_color`/`energy_max`), composant `EnergyDisplay`, extraction `AppShell`/`BottomNav`, sélecteur pur `isOverloaded`. Aucun changement de comportement visible, validé par test manuel utilisateur. 353/353 tests verts, `tsc -b` clean.

### Modifié
- Commande `/analyse_visio` : ajoute un rappel de bascule sur le modèle Opus avant toute phase de refacto générée dans une roadmap (dont la phase 0).

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
