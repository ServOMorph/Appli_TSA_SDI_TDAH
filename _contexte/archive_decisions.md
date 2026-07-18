# Décisions archivées — Appli_TSA_SDI_TDAH

## 2026-07-07 (close V3-6) (archivé depuis contexte.md 2026-07-19, close V4-1 D2/E7/D4)
- Phase V3-6 (nav persistante, N1) codée intégralement — `BottomNav` retiré de `E10Dashboard.tsx`, monté une seule fois dans `App.tsx` en position fixe (bottom), affiché sur tous les écrans sauf onboarding (`welcome`/`profile`/`energy`) et check-in énergie quotidien (`energy-checkin`) ; onglet actif mis en valeur (`activeTabFor`), pastille Todo conservée, 4ᵉ onglet « Accueil » ajouté (absent avant, nécessaire pour revenir au Dashboard depuis n'importe quel écran une fois la nav globale). Chaque écran concerné (17) réserve `padding-bottom: var(--bottomnav-h)` pour ne rien cacher derrière la nav fixe. Tests de nav obsolètes de `E10Dashboard.test.tsx` migrés vers `BottomNav.test.tsx` (nouveau, tests directs sur le composant) et `App.test.tsx` (nouveau, mapping écran → onglet + montage global). Gate V3-6 intégralement clos (374/374 tests, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-6.md` passé intégralement, doc `README.md` à jour). **Roadmap V3 (7 phases, V3-0 à V3-6) intégralement close.**

## 2026-07-07 (close V3-4) (archivé depuis contexte.md 2026-07-19, close V4-1 D2/E7/D4)
- Phase V3-4 codée intégralement (E7/E8 cuillères — `SpoonIcon`/`SpoonCost` — , P1 texte agrandi/centré, P2 pastel + bouton Terminer sur le Planning, P3 couleur d'ambiance configurable dans Accessibilité — `Settings.ambiance_color`, `src/ui/styles/ambiance.ts` —, P4b tâche terminée en teinte flashy, D5 cartes pastel sur "Planning du jour" du Dashboard). P6 (récurrence) : une première implémentation par avance automatique au jour suivant après chaque tâche planifiée a été codée puis **rejetée après test manuel** (elle masquait la tâche qu'on venait de placer, lue comme un bug par l'utilisateur) ; remplacée par un bouton explicite « Répéter demain » qui duplique la tâche au lendemain (`duplicateTaskV2ToNextDay`, `taskRulesV2.ts`) et ouvre directement ce jour-là (`repeatTaskTomorrow`, `planningTargetDate`/`setPlanningTargetDate`, `AppContext.tsx`) — décision assumée comme un compromis (1 clic par jour plutôt qu'un flux continu), à reconfirmer avec Marie. Gate V3-4 intégralement clos (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-4.md` passé intégralement, doc `README.md` à jour). `plan_test_manuel_v3-3.md` supprimé (nettoyage, phase close).

## 2026-07-07 (close V3-5) (archivé depuis contexte.md 2026-07-19, close V4-1 D2/E7/D4)
- Deux bugs mineurs P3 corrigés avant la phase — `E03Energy.tsx` (onboarding) passé de l'échelle 1-10 à 1-12 (`ENERGY_MIN`/`ENERGY_MAX`), affichage des valeurs d'énergie sur deux lignes fixes de 6 dans `E03Energy.tsx` et `E31EnergyCheckIn.tsx` (au lieu du `flexWrap` libre). Phase V3-5 (Listes) codée intégralement : L1/L2 hiérarchie visuelle entre vue globale (`E60Lists.tsx`, grosses cases, inchangé) et intérieur d'une liste (`E61ListDetail.tsx`, cases resserrées — padding `--spacing-xs`, radius `--radius-sm`, resserrement demandé une seconde fois par l'utilisateur après un premier passage jugé insuffisant), L3 titre de liste encadré du même style que les lignes de la vue globale. Gate V3-5 intégralement clos (367/367 tests, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-5.md` passé intégralement, doc `README.md` à jour). `plan_test_manuel_v3-4.md` supprimé (nettoyage, phase close). Seule la Phase V3-6 (nav persistante) reste sur la roadmap V3.

## 2026-07-07 (close V3-3, suite) (archivé depuis contexte.md 2026-07-18, close V4-branche/roadmap)
- Action « Reporter » implémentée — `postponeTaskV2` (`taskRulesV2.ts`) et `postponeTask` (`AppContext.tsx`) replanifient automatiquement la tâche au lendemain, même créneau horaire ; bouton « Reporter » visible dans `E10Dashboard.tsx`/`E40Planning.tsx` uniquement sur les tâches non-obligatoires du jour, non terminées, en surcharge. Décision **provisoire, non validée par Marie** sur ce mécanisme précis (transcription ambiguë) — consignée dans `Note de réunion/a demander a Marie.md`, de même que la fréquence du check-in énergie (Marie a dit « à chaque connexion » mais hésite elle-même avec « chaque jour » ; l'implémentation actuelle est une fois par jour, choix du développeur pour limiter la charge mentale, à reconfirmer). Test manuel de la Phase V3-3 passé intégralement (`plan_test_manuel_v3-3.md`) : navigation restreinte au Dashboard/Centre récupération en surcharge confirmée intentionnelle par l'utilisateur (initialement suspectée à tort comme un bug). Bug découvert et noté en roadmap (non corrigé) : `E03Energy.tsx` (onboarding) utilise encore une échelle 1-10 au lieu de 1-12. Gate V3-3 intégralement clos (353/353 tests, `tsc -b` clean, eslint 0 erreur, doc `README.md` à jour). `plan_test_manuel_v3-1.md`/`v3-2.md` supprimés (nettoyage intentionnel confirmé par l'utilisateur). **Note (2026-07-18)** : Marie a répondu à ces deux points en attente — check-in confirmé une fois/jour ; « Reporter » doit désormais ouvrir un choix de créneau vide (voir `roadmap_v4.md` E8) plutôt qu'avancer automatiquement.

## 2026-07-07 (archivé depuis contexte.md 2026-07-09, close session e2e/modale planning)
- Phase V3-3 codée (E4/E5/E6 visuel). Surcharge rendue 100% automatique (`isOverloaded` sur énergie du jour vs coût planifié restant via `todayPlannedTasks`/`refreshTodayPlanned`) — `Settings.overload_mode`/`setOverloadMode` retirés du code, plus de toggle manuel. Bouton TopBar devenu informatif. Effet de bord D1 (surcharge sans tâche visible, en attente depuis V3-1) résolu : "Planning du jour" reste visible en surcharge avec obligatoires en pastel / non-obligatoires grisées. Action "Reporter" (E6) explicitement non tranchée à la demande de l'utilisateur, reportée à la session suivante — piste "statut todo" écartée (créerait un orphelin non affiché nulle part dans l'UI, même défaut que B1).

## 2026-07-07 (archivé depuis contexte.md 2026-07-07 e2e, session tests e2e)
- Phase V3-2 codée intégralement. `getRemainingPlannedCost` (`taskRulesV2.ts`) : helper pur, somme `energy_cost` des tâches `planned` non `completed`, préparatoire à la surcharge V3-3, non branché à l'UI. `setEnergyCostV2` : setter pur validant 1-12 via `isValidEnergyValue` (réutilisation directe de la règle existante, pas de nouvelle règle de barème créée — E3 satisfait par réutilisation). E1/E2 : fenêtre à deux carrés (sélecteur d'énergie 1-12 + case obligatoire) implémentée dans `E40Planning.tsx` uniquement, au moment de l'assignation à un créneau (seul point où une tâche `planned` est réellement persistée) — écart assumé par rapport au fichier `E21CreateTaskV2.tsx` cité dans la roadmap initiale, ce dernier ne faisant qu'amorcer le flux via `startPlanTask`. `schedulePendingTask` (AppContext) étend sa signature (`energyCost`, `essential`) et câble `toggleEssentialV2` existant (trou fonctionnel V2-10 fermé). Affichage minimal du coût en texte sur les cases Planning et Dashboard. 342/342 tests unitaires, `tsc -b` clean, `eslint` 0 erreur.

## 2026-07-07 (archivé depuis contexte.md 2026-07-07 suite 3, masquage bouton surcharge)
- Test manuel de la Phase V3-1 passé intégralement (27/27 cas OK), gate de phase clos. Point mode surcharge sans tâche visible (effet de bord D1) explicitement reporté par l'utilisateur à la Phase V3-3 (travail spécifique sur la surcharge automatique), plutôt que tranché maintenant.

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 suite, icône batterie)
- Phase V3-0 (refacto préalable) codée et close — `ENERGY_MIN`/`ENERGY_MAX`/`isValidEnergyValue`/`getEnergyLabel`/`isOverloaded` (domaine, purs), schéma Dexie v3 (`TaskV2.energy_cost`, `Settings.ambiance_color`/`energy_max`, champs optionnels pour zéro migration), composants `EnergyDisplay`/`AppShell`/`BottomNav` extraits de `E10Dashboard.tsx`. 353/353 tests verts, `tsc -b` clean, validée par test manuel utilisateur (aucune régression). Nouvelle règle process actée : basculer sur le modèle Opus avant toute phase de refacto — intégrée à `/analyse_visio` (génération future) et ajoutée rétroactivement à `roadmap_v3.md` Phase V3-0.

## 2026-07-06 (suite 7, archivé depuis contexte.md 2026-07-07 suite 2, espacement Planning)
- Phase V3-1 (bugs + nettoyage UI) codée intégralement — B1 (plus de tâche `planned` fantôme non schedulée : refonte de la persistance Planning via `pendingPlanTask`/`schedulePendingTask`, remplace `planTodoTask`/`getUnscheduledPlannedTasks`), B2 (contraste bordures Planning en clair), B3 (non reproduit, aucun changement), D1 (bloc "Que faire maintenant ?" supprimé avec `actionImmediateRules.ts`, devenu mort), D2 (écran `E04FirstTask` retiré, `E03Energy` termine l'onboarding directement), D3 (réordonnancement + police "Tâche du jour"), D4/D4b (segment nav "Aujourd'hui" retiré, destination de création renommée "Tâche du jour"), P4a (tâche planifiée terminée reste affichée), P5 (case vide propose d'ajouter une tâche directement plutôt qu'une liste de backlog), Q1 (limite de 3 tâches/jour et modale M04 retirées partout). Effet de bord identifié et documenté : le mode surcharge n'affiche plus aucune tâche (le bloc "action immédiate" retiré par D1 était la seule information de tâche visible en surcharge depuis la décision du 2026-07-05, archivée) — question ouverte pour la session suivante plutôt que tranchée unilatéralement. 330/330 tests unitaires, `tsc -b` clean, `eslint` 0 erreur. Plan de test manuel dédié créé (`plan_test_manuel_v3-1.md`, 27 cas), pas encore passé.

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close V3-6)
- Relecture complète de la transcription de la visio Marie pour lever les points bloquants avant V3-0. Q1 tranché : suppression de la limite de 3 tâches/jour (jugée non nécessaire par Marie). Q2 tranché : la transcription n'était pas contradictoire mais complémentaire — retirer le segment nav "Aujourd'hui" du dashboard sans remplacement (D4), et renommer l'option de création "Aujourd'hui" en "Tâche du jour" pour conserver un moyen de créer une tâche dans cette section (D4b). Reset données V2 tranché : Marie accepte le reset, pas de migration au bump Dexie v3. Branche `v3` créée à partir de `v2` (commit de réorganisation des dossiers de notes de réunion au préalable).

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close V3-5)
- Commande `/analyse_visio <dossier-réunion>` créée (`.claude/commands/analyse_visio.md`) pour automatiser l'analyse des visios testeurs — lit la transcription et les captures du dossier, analyse le code impacté, propose une refacto préalable, et génère une roadmap versionnée (bump auto du numéro à partir des `roadmap_v*.md` existants) au format à cases à cocher. Appliquée à la visio Marie du 2026-07-06 : roadmap V3 créée, cœur de la demande = coût d'énergie par tâche (échelle 1-12, "cuillères"), tâches obligatoires (réutilise le champ `essential` de `TaskV2`, jamais câblé jusqu'ici), mode surcharge automatique dérivé de l'énergie du jour vs coûts planifiés (remplace le toggle manuel actuel).

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close V3-4)
- E2e relancés (45/45, aucune régression après onboarding). Bug export JSON trouvé en testant le fichier réellement exporté (RGPD) — `exportData` (AppContext.tsx) n'exportait que les tables V1, omettant `tasksV2`/`lists`/`listItems` alors que le flux de création principal est V2 ; corrigé, version export passée à `2.0`. Export iOS (test manuel 11.5) validé. `vite.config.ts` : `build.outDir` fixé à `dist/v2` (au lieu de sortir dans `dist/` racine, ce qui écrasait aussi les fichiers `dist/v1/` non versionnés au même niveau — restaurés via `git checkout`). Planning (`E40Planning.tsx`) : granularité des créneaux passée d'1h à 30 min (48 créneaux), à la demande de l'utilisateur ; durée par défaut à l'assignation ramenée à 30 min en cohérence. Investigation "groseille"/"pasteque" apparues dans le picker Planning : confirmé non-bug (données de test résiduelles d'une session précédente, absentes après reset de l'app).

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close V3-3, session suivante)
- Décision profil actée — `E111Profile` reste en lecture seule (pas de modification à implémenter). Décision énergie non tranchée directement : remontée à Marie pour la prochaine réunion (contexte consigné dans `Note de réunion/a traiter prochaine reunion.txt`), plutôt que de trancher unilatéralement un usage produit non validé par l'utilisatrice finale. Tests manuels 2.4, 2.6, 6.7, 6.10, 7.3, mode sombre et 11.2 validés. Section "Stimulation cognitive" des Paramètres supprimée intégralement à la demande de l'utilisateur (même traitement que la section "Organisation" précédemment retirée) : écran `E113Stimulation`, entrée menu, champ `Settings.stimulation_mode`, CSS `data-stimulation` retirés du code plutôt que masqués. 339/339 tests unitaires, `tsc -b` clean.

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close V3-3)
- Retest manuel en app réelle du bug conflit de créneau — comportement encore incorrect (clic sur créneau occupé ouvrait le déplacement de l'autre tâche au lieu de refuser la tâche en attente) ; corrigé avec modale de refus dédiée. Décision actée : garder tel quel l'écran Planning sans tâche planifiable. Ajout d'une tâche à une liste (Todo/création/détail tâche) : navigue désormais vers le détail de la liste plutôt que de rester sur l'écran d'origine. Listes : renommage et suppression ajoutés (`deleteList` existait sans être câblée). Section "Organisation" des Paramètres et icône Planning de la TopBar supprimées intégralement (nettoyage UI demandé, code mort retiré plutôt que masqué). Énergie confirmée comme purement décorative à cette date (aucun effet fonctionnel au-delà de l'affichage) — depuis branché sur la surcharge automatique en V3-3.

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close suite)
- Comportement onboarding revu à la demande de l'utilisateur — un utilisateur qui quitte l'app avant d'atteindre le dashboard doit repartir de zéro (écran de bienvenue) à la prochaine ouverture, plutôt que de reprendre directement sur le dashboard (comportement précédent, jugé incorrect). Ajout de `User.onboarding_completed`, fonction `completeOnboarding` (`AppContext.tsx`) appelée en fin de `E04FirstTask` ; si un utilisateur incomplet est détecté au démarrage, toutes les données sont effacées. Bouton "Ignorer" retiré de l'écran de choix de profil (`E02Profile`) : la sélection d'un profil est désormais obligatoire (l'écran ne propose qu'un choix de type de profil, pas de saisie de nom — ajout d'un champ nom reporté après V2).

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close suite)
- Plan de test manuel V2 (`plan_test_manuel_v2.md`) rédigé à la demande de l'utilisateur, scope basé sur les écrans réellement implémentés (et non sur la roadmap seule), et passé intégralement en session. Décision : consolider les écarts constatés (bugs, décisions produit, fonctionnalités manquantes, demandes de nettoyage UI, points à re-tester) dans `roadmap_v2.md` comme un lot dédié à traiter avant déploiement, plutôt que de corriger à la volée pendant la revue.

## 2026-07-06 (archivé depuis contexte.md 2026-07-07 close suite)
- Les 4 bugs confirmés du test manuel corrigés. Conflit de créneau Planning : décision actée avec l'utilisateur = refus + message (plutôt que remplacement avec confirmation ou superposition autorisée). Perte de sous-tâches à la conversion Todo→Planifier/Liste : fix minimal retenu = avertissement de confirmation avant conversion, sans étendre le modèle de données (`TaskV2`/`ListItem` ne supportent pas les sous-tâches) ; la planification indépendante des sous-tâches est reportée comme chantier séparé, piste retenue si le besoin se confirme = chaque `SubTask` devient sa propre `TaskV2` avec un `parent_task_id` optionnel plutôt que d'étendre `SubTask` avec ses propres champs de planification.

## 2026-07-05 (archivé depuis contexte.md 2026-07-06 suite 7)
- Mode surcharge du Dashboard rendu minimaliste, à la demande explicite de l'utilisateur (itération écran par écran) — plutôt que de câbler le filtre `essential` par tâche (jamais accessible depuis l'UI, `toggleEssentialV2` non appelée), masquage direct des sections entières du Dashboard en `overloadMode` : icônes TopBar (Planning/Ressources/Paramètres), chip énergie, bouton "Ajouter une tâche", nav segmentée, "Planning du jour", "Tâches du jour". Ajout d'un bouton "Sortir du mode surcharge" en pied de page, même style que le bouton actif en haut. Le filtre mort `essential` sur le planning du jour est supprimé. Restent visibles en surcharge (à l'époque) : titre, bouton "Mode surcharge", bandeau d'état + Centre récupération, action immédiate. **Note (2026-07-06, Phase V3-1)** : le bloc "action immédiate" mentionné ici a depuis été supprimé sans condition (D1, demande explicite Marie) — le mode surcharge n'affiche donc plus aucune tâche, point remonté en question ouverte.

## 2026-07-05 (archivé depuis contexte.md 2026-07-06 close)
- Écran de création de tâche (E21CreateTaskV2) revu à la demande de l'utilisateur — destination "À planifier plus tard" (`to_plan`) remplacée par "Mettre dans une liste" (modal de sélection de liste, création directe d'un `ListItem`) ; ajout d'une destination "Aujourd'hui" (création directe d'une `Task` V1 `today`, avec la même règle de remplacement à 3 tâches que sur l'écran Todo). Le statut `to_plan` n'ayant plus aucune voie de création (`moveTaskToLaterV2` jamais câblée à l'UI), il est retiré intégralement du domaine avec l'écran `E50ToPlanQueue` et la pastille dashboard associée (décision de nettoyage validée avec l'utilisateur plutôt que de laisser du code mort).

## 2026-07-05 (archivé depuis contexte.md 2026-07-06 close)
- E2E relancés après accumulation de plusieurs sessions non testées — 45/45 passent, aucune régression. Les 3 échecs préexistants (`05-overload.spec.ts` T40/T44/T45) corrigés en réécrivant les assertions (texte réel "Mode surcharge actif" au lieu d'un `heading` inexistant).

## 2026-07-05 (archivé depuis contexte.md 2026-07-06 close)
- Réorganisation des dossiers de build — `dist_v1/` fusionné dans `dist/` (`dist/v1/` versionné pour rollback, `dist/v2/` ignoré Git et régénérable via `npm run build`), pour réduire le nombre de dossiers à la racine.

## 2026-07-03 (archivé depuis contexte.md 2026-07-06 close)
- Bug racine SubTask corrigé — `toggleSubTask` (AppContext.tsx) existait mais n'était appelée nulle part dans l'UI, donc aucune sous-tâche ne pouvait jamais être marquée terminée : badge "X/Y" bloqué à "0/Y", "Prochaine étape" jamais mise à jour. Corrigé par une checkbox fonctionnelle dans E22TaskDetail/E23Decompose ; badge étendu à E20Inbox/E24Today.

## 2026-07-03 (archivé depuis contexte.md 2026-07-06 session suivante)
- Écran Planning (E40Planning) revu suite à retour utilisateur direct (capture d'écran) — l'ancien flux (taper un créneau vide affichait toutes les tâches non planifiées, un clic validait immédiatement) jugé non intuitif. Nouveau flux : bouton "Valider" explicite dans tous les cas ; si une tâche vient d'être choisie via "Planifier" (Todo ou création directe), son id est transporté via `selectedTaskId` (champ existant, réutilisé) jusqu'à Planning, qui affiche directement la confirmation de placement pour cette tâche précise sans lister le reste du backlog. Bouton "Planifier" de la nav segmentée dashboard renommé "Planning" (à ne pas confondre avec l'icône agenda TopBar, `aria-label="Planning"` déjà existant).

## 2026-07-02 (archivé depuis contexte.md 2026-07-06 session suite)
- Décision d'architecture — le système V1 `Task` reste le moteur du dashboard, non unifié sur `TaskV2`. Écran Todo enrichi d'actions "Planifier"/"Liste" (conversion à l'action). Corrige un bug orphelin (`E21CreateTaskV2` destination "Todo" créait des `TaskV2` jamais affichées) et un bug de reset (`deleteAllData` ne vidait pas `tasksV2`).

## 2026-07-01 (archivé depuis contexte.md 2026-07-06)
- V2-10 démarrée (chantier dead code/couverture) — suppression `TASK_TODAY_MAX`/`canAddToToday` (V1, jamais appliqués) ; config coverage corrigée (exclusion `dist`/`e2e`), couverture réelle 95.48% (seuil 85% dépassé) ; `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (V2) conservés mais identifiés comme trou fonctionnel non câblé à l'UI, décision produit différée.

## 2026-07-02 (archivé depuis contexte.md 2026-07-06)
- Fonctionnalité Routines (V2-8) retirée intégralement — Marie n'avait jamais demandé d'onglet dédié (maquette dessinée = nav Todo/Planifier/Listes ; ses notes citent "routines" comme contenu de liste, pas une entité séparée). Code, tests, tables Dexie supprimés.

## 2026-07-02 (archivé depuis contexte.md 2026-07-06 session suivante)
- Collision de nommage V1/V2 "plus tard" résolue par suppression du système V1 (`Task.later`, `E25Later`) — seul `to_plan` (V2, pastille rouge, E50ToPlanQueue) subsiste comme mécanisme de report.

## 2026-07-01 (archivé depuis contexte.md 2026-07-05 session 3)
- V2-9 close (mécanique + TM-01 à TM-06) — icône agenda (TopBar) + bouton "Planifier"/"Listes" sur le dashboard, bouton d'ajout repointé vers `task-create-v2` (navigation orpheline résolue, zéro e2e cassé) ; section "Planning du jour" (mini, TaskV2+Routine) avec masquage `essential=false` en surcharge, sans migrer `todayTasks` V1 + 396/396 tests. Déblocage en cascade : V2-7 (12 TM) et V2-8 (TM-07/08) validés dans la foulée.

## 2026-07-01 (archivé depuis contexte.md 2026-07-05 session 2)
- Constat local — `npm run test` par défaut sature la mémoire Node sur cette machine ; utiliser `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` + `NODE_OPTIONS=--max-old-space-size=4096`.
- V2-8 close (mécanique + TM-01 à TM-06) — Routines (E70Routines, E71RoutineDetail), createRoutine/createRoutineStep/scheduleRoutine/toggleRoutineStep, bloc visible dans E40Planning + 390/390 tests. TM-07/08 reportés V2-9 : `task-create-v2` orphelin depuis revert e2e 2026-06-30 (planning inaccessible par nav réelle). Gate commun roadmap complété (point 7 : vérifier qu'un écran antérieur ne perd pas son accès navigable).

## 2026-07-01 (archivé depuis contexte.md 2026-07-05)
- V2-7 close (mécanique) — page Listes + détail liste (E60Lists, E61ListDetail), createList/createListItem, repositories V2-2 réutilisés tels quels + 365/365 tests. Suggestion de liste différée à V2-9 ; test manuel formellement reporté V2-9 (pas de nav dashboard).

## 2026-06-30 (archivé depuis contexte.md 2026-07-03 session 2)
- V2-6 close (mécanique) — mode surcharge toggle instantané, bouton isolé TopBar ; masquage `essential=false` différé V2-9 (todayTasks V1 sans champ essential) + 337/337 tests.

## 2026-06-30 (archivé depuis contexte.md 2026-07-03)
- V2-5 close — file "À planifier" séquentielle (E50ToPlanQueue, pastille rouge dashboard, toPlanTasks dans AppContext) + 336/336 tests.
- Dette e2e V1→V2 soldée — 46/46 passent (vocabulaire + revert E20Inbox vers flux V1 cohérent avec inboxTasks).

## 2026-06-30 (archivé depuis contexte.md 2026-07-02)
- V2-3 close — flux d'ajout refondu (E21CreateTaskV2, 3 destinations obligatoires, createTaskV2Dest) + 313/313 tests.
- V2-4 close — vue Planning (E40Planning : grille 6h–22h, scroll auto heure courante, nav jour, picker placement/déplacement) + 324/324 tests.

## 2026-06-29 (archivé depuis contexte.md 2026-07-01 session 2)
- V2-2 close — schéma Dexie v2 parallèle (TaskV2, List, ListItem, Routine, RoutineStep) + règles métier + 301/301 tests.

## 2026-06-29 (archivé depuis contexte.md 2026-07-01)
- Session test Marie — Netlify déployé et fonctionnel ; retours documentés dans `Note de réunion/`.
- `roadmap_v2.md` créée (11 phases) ; `roadmap.md` archivé dans `Archives/roadmap_v1.md`.
- Reset données accepté par Marie — schéma Dexie v2 propre, sans migration de compatibilité v1.
- V2-0 close — tag `v1.0-mvp`, branche `v2`, `dist_v1/` archivé ; rollback V1 en une commande.
- V2-1 close — vocabulaire UI : souffle→énergie, Inbox→Todo, Plus tard→À faire plus tard (259/259 tests).

## 2026-06-25 (archivé depuis contexte.md 2026-06-29 session 2)
- "cuillères" renommé "souffle" — terme inventé, court, compréhensible, sans référence théorique (spoon theory).
- Bug fix addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi → sous-tâche visible dans "Que faire maintenant?" après décomposition.
- Vitest limité aux tests `src/` ; les specs `e2e/` sont réservées au runner Playwright.
- E120Resources ajouté — écran ressources depuis dashboard, avec fondements de conception, mode d'emploi et liens utiles en attente.
- Orchestration `npm run test:e2e` validée — build + preview Playwright + 46/46 sans serveur manuel.
- Phase 7 démarre par test distant — déploiement manuel Netlify, observation accompagnée, données locales navigateur.
- Onboarding ajusté pour test utilisateur — image bienvenue générée, bouton `Entrer`, profils sans âges affichés, écran mobile sans scroll vérifié.

## 2026-06-25 (archivé depuis contexte.md 2026-06-29)
- Phase 6 close — flux validés mobile physique. crypto.randomUUID() remplacé par fallback getRandomValues (non-secure context HTTP).
- overflow-x: clip sur html/body — bloque scroll latéral mobile (sr-only dnd-kit à -1px). Validé en prod ✅
- Dashboard refactorisé sans scroll — TopBar (titre « Appli pour AuDHD », ⚙ réglages, pill énergie, pill surcharge) + nav segmentée (Inbox / Aujourd'hui / Plus tard). Remplace les 7 boutons empilés.

## 2026-06-25 (antérieur)
- Phase 5 complète — E90/E110–E117, Settings DOM, export RGPD, 232 tests, 22 tests manuels ok.
- E90 simplifié — "Retour au dashboard" supprimé (boucle sans issue), seul "Désactiver" disponible.
- Phase 6 code complète — audit architecture, 99.34% couverture, build PWA, erasableSyntaxOnly fix, offline validé.
- Tests E2E Playwright adoptés (46/46, 12.7s) — remplacent les tests manuels desktop.
