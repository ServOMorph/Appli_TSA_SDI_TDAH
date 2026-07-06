# Décisions archivées — Appli_TSA_SDI_TDAH

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
