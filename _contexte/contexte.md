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
V2 en cours sur branche `v2` — Phases V2-0 à V2-9 closes (mécaniques + tests manuels). Tag `v1.0-mvp` posé, `dist_v1/` archivé (rollback V1 opérationnel).
V2-10 (Consolidation) démarrée : chantier dead code/couverture traité — `TASK_TODAY_MAX`/`canAddToToday` (V1, jamais utilisés) supprimés ; couverture réelle mesurée à 95.48% (config coverage corrigée, `dist_v1`/`e2e` exclus). Trois fonctions `taskRulesV2.ts` (compléter/reporter/toggle essentiel une TaskV2) identifiées comme trou fonctionnel non câblé à l'UI — conservées, décision produit à trancher.
Reste sur V2-10 : doc V2 (README/schéma/ADR), build + déploiement Netlify (bascule `main`), sessions test 2-5 avec Marie et autres testeurs AuDHD.
Tests 392/392 unitaires (pool par défaut), 46/46 e2e (aucune régression).

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-30 : V2-3 close — flux d'ajout refondu (E21CreateTaskV2, 3 destinations obligatoires, createTaskV2Dest) + 313/313 tests.
- 2026-06-30 : V2-4 close — vue Planning (E40Planning : grille 6h–22h, scroll auto heure courante, nav jour, picker placement/déplacement) + 324/324 tests.
- 2026-06-30 : V2-5 close — file "À planifier" séquentielle (E50ToPlanQueue, pastille rouge dashboard, toPlanTasks dans AppContext) + 336/336 tests.
- 2026-06-30 : Dette e2e V1→V2 soldée — 46/46 passent (vocabulaire + revert E20Inbox vers flux V1 cohérent avec inboxTasks).
- 2026-06-30 : V2-6 close (mécanique) — mode surcharge toggle instantané, bouton isolé TopBar ; masquage `essential=false` différé V2-9 (todayTasks V1 sans champ essential) + 337/337 tests.
- 2026-07-01 : V2-7 close (mécanique) — page Listes + détail liste (E60Lists, E61ListDetail), createList/createListItem, repositories V2-2 réutilisés tels quels + 365/365 tests. Suggestion de liste différée à V2-9 ; test manuel formellement reporté V2-9 (pas de nav dashboard).
- 2026-07-01 : Constat local — `npm run test` par défaut sature la mémoire Node sur cette machine ; utiliser `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` + `NODE_OPTIONS=--max-old-space-size=4096`.
- 2026-07-01 : V2-8 close (mécanique + TM-01 à TM-06) — Routines (E70Routines, E71RoutineDetail), createRoutine/createRoutineStep/scheduleRoutine/toggleRoutineStep, bloc visible dans E40Planning + 390/390 tests. TM-07/08 reportés V2-9 : `task-create-v2` orphelin depuis revert e2e 2026-06-30 (planning inaccessible par nav réelle). Gate commun roadmap complété (point 7 : vérifier qu'un écran antérieur ne perd pas son accès navigable).
- 2026-07-01 : V2-9 close (mécanique + TM-01 à TM-06) — icône agenda (TopBar) + bouton "Planifier"/"Listes" sur le dashboard, bouton d'ajout repointé vers `task-create-v2` (navigation orpheline résolue, zéro e2e cassé) ; section "Planning du jour" (mini, TaskV2+Routine) avec masquage `essential=false` en surcharge, sans migrer `todayTasks` V1 + 396/396 tests. Déblocage en cascade : V2-7 (12 TM) et V2-8 (TM-07/08) validés dans la foulée.
- 2026-07-01 : V2-10 démarrée (chantier dead code/couverture) — suppression `TASK_TODAY_MAX`/`canAddToToday` (V1, jamais appliqués) ; config coverage corrigée (exclusion `dist_v1`/`e2e`), couverture réelle 95.48% (seuil 85% dépassé) ; `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (V2) conservés mais identifiés comme trou fonctionnel non câblé à l'UI, décision produit différée.
