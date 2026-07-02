# Contexte — Appli_TSA_SDI_TDAH

## Objectif (immuable sauf décision explicite)
Créer une application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans DI + TDAH, 14–40 ans) : réduire la charge mentale quotidienne, soutenir les fonctions exécutives, offline-first, confidentialité renforcée.

## Stack / contraintes techniques (stable, rarement modifié)
- Frontend : React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js (source de vérité V1)
- Chiffrement local : Web Crypto API, AES-GCM, clé PBKDF2
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : reportée post-MVP — Supabase région UE envisagé, Firebase écarté
- Offline-first strict : fonctionne sans serveur ni compte en V1

## État actuel (réécrit intégralement à chaque /close)
V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes. Tag `v1.0-mvp` posé, `dist_v1/` archivé (rollback V1 opérationnel).
V2-10 (Consolidation) en cours : dead code réglé, couverture ≥85% atteinte (mesure 2026-07-01). Fonctionnalité Routines (V2-8) retirée intégralement — non demandée par Marie. Collision de nommage V1/V2 "plus tard" résolue par suppression du système V1 (`later`) ; seul `to_plan` (V2) subsiste. Écran Todo enrichi (actions Planifier/Liste, conversion à l'action vers `TaskV2`/`ListItem`) sans migrer le système V1 `Task` (inbox→today), qui reste le moteur du dashboard.
Reste sur V2-10 : doc V2 (README/schéma/ADR), build + déploiement Netlify (bascule `main`), sessions test 2-5 avec Marie et autres testeurs AuDHD. Actions ouvertes mineures : sous-tâches perdues silencieusement lors de conversion Todo, 3 tests e2e overload cassés (préexistant).
Tests 345/345 unitaires (pool par défaut), 42/45 e2e (3 échecs préexistants sans lien avec les derniers changements).

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-30 : V2-5 close — file "À planifier" séquentielle (E50ToPlanQueue, pastille rouge dashboard, toPlanTasks dans AppContext) + 336/336 tests.
- 2026-06-30 : Dette e2e V1→V2 soldée — 46/46 passent (vocabulaire + revert E20Inbox vers flux V1 cohérent avec inboxTasks).
- 2026-06-30 : V2-6 close (mécanique) — mode surcharge toggle instantané, bouton isolé TopBar ; masquage `essential=false` différé V2-9 (todayTasks V1 sans champ essential) + 337/337 tests.
- 2026-07-01 : V2-7 close (mécanique) — page Listes + détail liste (E60Lists, E61ListDetail), createList/createListItem, repositories V2-2 réutilisés tels quels + 365/365 tests. Suggestion de liste différée à V2-9 ; test manuel formellement reporté V2-9 (pas de nav dashboard).
- 2026-07-01 : Constat local — `npm run test` par défaut sature la mémoire Node sur cette machine ; utiliser `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` + `NODE_OPTIONS=--max-old-space-size=4096`.
- 2026-07-01 : V2-8 close (mécanique + TM-01 à TM-06) — Routines (E70Routines, E71RoutineDetail), createRoutine/createRoutineStep/scheduleRoutine/toggleRoutineStep, bloc visible dans E40Planning + 390/390 tests. TM-07/08 reportés V2-9 : `task-create-v2` orphelin depuis revert e2e 2026-06-30 (planning inaccessible par nav réelle). Gate commun roadmap complété (point 7 : vérifier qu'un écran antérieur ne perd pas son accès navigable).
- 2026-07-01 : V2-9 close (mécanique + TM-01 à TM-06) — icône agenda (TopBar) + bouton "Planifier"/"Listes" sur le dashboard, bouton d'ajout repointé vers `task-create-v2` (navigation orpheline résolue, zéro e2e cassé) ; section "Planning du jour" (mini, TaskV2+Routine) avec masquage `essential=false` en surcharge, sans migrer `todayTasks` V1 + 396/396 tests. Déblocage en cascade : V2-7 (12 TM) et V2-8 (TM-07/08) validés dans la foulée.
- 2026-07-01 : V2-10 démarrée (chantier dead code/couverture) — suppression `TASK_TODAY_MAX`/`canAddToToday` (V1, jamais appliqués) ; config coverage corrigée (exclusion `dist_v1`/`e2e`), couverture réelle 95.48% (seuil 85% dépassé) ; `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (V2) conservés mais identifiés comme trou fonctionnel non câblé à l'UI, décision produit différée.
- 2026-07-02 : Fonctionnalité Routines (V2-8) retirée intégralement — Marie n'avait jamais demandé d'onglet dédié (maquette dessinée = nav Todo/Planifier/Listes ; ses notes citent "routines" comme contenu de liste, pas une entité séparée). Code, tests, tables Dexie supprimés.
- 2026-07-02 : Collision de nommage V1/V2 "plus tard" résolue par suppression du système V1 (`Task.later`, `E25Later`) — seul `to_plan` (V2, pastille rouge, E50ToPlanQueue) subsiste comme mécanisme de report.
- 2026-07-02 : Décision d'architecture — le système V1 `Task` (inbox→today, sous-tâches, action immédiate) reste le moteur du dashboard, non unifié sur `TaskV2`. Écran Todo enrichi d'actions "Planifier"/"Liste" qui convertissent la tâche à l'action (création TaskV2/ListItem + suppression Task V1) plutôt que de migrer le modèle de données. Corrige au passage un bug orphelin (destination "Todo" de E21CreateTaskV2 créait des TaskV2 jamais affichées) et un bug de reset (`deleteAllData` ne vidait pas `tasksV2`).
