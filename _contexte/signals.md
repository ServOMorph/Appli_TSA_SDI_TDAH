# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-01 session 2)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - dead code : nettoyé (voir Contexte chaud) ; couverture ≥85% : atteinte (95.48%) ; reste : doc V2, build+déploiement Netlify, sessions test 2-5
  - réf: `roadmap_v2.md` Phase V2-10
- [P2|ouvert] Raccorder la suggestion de liste au flux d'ajout de tâche
  - fait quand: bouton "Ajouter" dans le flux de tâche propose une liste existante
  - réf: `roadmap_v2.md` Phase V2-7 (reporté, non traité en V2-9) + `src/ui/screens/tasks/E21CreateTaskV2.tsx`
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/reporter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- V2-10 (dead code) : suppression de `TASK_TODAY_MAX`/`canAddToToday` (`src/domain/rules/taskRules.ts`, jamais appliqués, aucune limite quotidienne réelle en V1) — 392/392 tests. `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (`taskRulesV2.ts`) conservés : ce ne sont pas des reliquats mais des règles jamais câblées à une interaction UI (trou fonctionnel, voir action P3)
- `vitest.config.ts` : ajout de `dist_v1/**` et `e2e/**` dans `coverage.exclude` (ces dossiers polluaient le rapport avec 0%) — couverture réelle mesurée : 95.48% lignes / 91.74% branches / 89.11% fonctions (seuil 85% dépassé)
- `npm run test` passe 392/392 en pool par défaut ; `npm run test:e2e` 46/46 (relancé session précédente, aucune régression)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`) pour un résultat fiable
- V2-0 à V2-9 closes (mécaniques + tests manuels) — V2-10 en cours (dead code/couverture réglés, reste doc/déploiement/tests utilisateurs)
- Navigation orpheline résolue : bouton "Ajouter une tâche" dashboard → `task-create-v2` ; icône agenda (TopBar) + bouton "Planifier" → `planning` ; bouton "Listes" → `lists`. Vérifié : aucun e2e cassé (T11-T19 passent par le bouton propre à `E20Inbox`, indépendant de celui du dashboard)
- Dashboard : nouvelle section "Planning du jour" (mini, `TaskV2`+`Routine` du jour triés par heure) — masque les tâches `essential=false` en mode surcharge. Le planning en cases complet reste dans `E40Planning` seul (pas de duplication de la grille horaire dans le dashboard)
- Nav segmentée dashboard : 6 boutons (Todo/Aujourd'hui/À faire plus tard/Routines/Planifier/Listes) — les 4 premiers conservés tels quels car testés par e2e T14/T15, Planifier/Listes ajoutés à la suite plutôt que remplacement strict par les 3 items de la maquette

## Dernière session (2026-07-01 session 2)

## Décisions prises
- V2-10 démarrée : chantier "refacto/dead code/couverture" traité en premier (choix utilisateur)
- `vitest.config.ts` : exclusion `dist_v1/**` + `e2e/**` du coverage (polluaient le rapport à 0%) — couverture réelle mesurée : 95.48% lignes / 91.74% branches / 89.11% fonctions, seuil 85% dépassé
- Suppression de `TASK_TODAY_MAX`/`canAddToToday` (`src/domain/rules/taskRules.ts`) — dead code V1 confirmé (aucune limite quotidienne appliquée nulle part)
- `completeTaskV2`/`moveTaskToLaterV2`/`toggleEssentialV2` (`taskRulesV2.ts`) conservés — pas du code mort mais un trou fonctionnel (aucune UI ne les appelle), documenté en action ouverte plutôt que supprimé

## Livrables produits ou modifiés
- `vitest.config.ts` : ajout `dist_v1/**`/`e2e/**` dans `coverage.exclude`
- `src/domain/rules/taskRules.ts` : suppression `TASK_TODAY_MAX`/`canAddToToday`
- `src/domain/rules/taskRules.test.ts` : tests correspondants supprimés (392/392 total après nettoyage)
- `_contexte/signals.md` : question ouverte sur le critère `essential` retirée (demande explicite utilisateur)

## Hypothèses validées / invalidées
- VALIDE : `TASK_TODAY_MAX`/`canAddToToday` sont du dead code réel (grep confirme aucun usage hors test)
- INVALIDE : les 3 fonctions `taskRulesV2.ts` restantes sont du code mort -> pivot vers "trou fonctionnel non câblé", à trancher comme décision produit
- EN ATTENTE : décision sur l'implémentation (ou l'abandon explicite) de compléter/reporter/toggle essentiel une `TaskV2`

## Prochaine étape exacte
Poursuivre V2-10 : doc V2 (README/schéma données/ADR), build + déploiement Netlify (bascule `main`), sessions test 2-5 avec Marie et autres testeurs AuDHD.

## Question bloquante pour la session suivante
Aucune.
