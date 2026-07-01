# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-01)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-10 (Consolidation V2 & 2e vague de tests)
  - fait quand: refacto dead code fait, couverture ≥85%, doc V2 (README/schéma/ADR) à jour, build+déploiement Netlify basculé sur `main`, sessions test 2-5 réalisées
  - réf: `roadmap_v2.md` Phase V2-10
- [P2|ouvert] Raccorder la suggestion de liste au flux d'ajout de tâche
  - fait quand: bouton "Ajouter" dans le flux de tâche propose une liste existante
  - réf: `roadmap_v2.md` Phase V2-7 (reporté, non traité en V2-9) + `src/ui/screens/tasks/E21CreateTaskV2.tsx`

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour définir le critère "essentiel" exact (masquage tâches non-essentielles, mécanique déjà livrée en V2-9)

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 396/396 en pool par défaut (8 tests V2-9 ajoutés) ; `npm run test:e2e` 46/46 (relancé cette session, aucune régression)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`) pour un résultat fiable
- V2-0 à V2-9 closes (mécaniques + tests manuels) — prochaine phase : V2-10 (consolidation)
- Navigation orpheline résolue : bouton "Ajouter une tâche" dashboard → `task-create-v2` ; icône agenda (TopBar) + bouton "Planifier" → `planning` ; bouton "Listes" → `lists`. Vérifié : aucun e2e cassé (T11-T19 passent par le bouton propre à `E20Inbox`, indépendant de celui du dashboard)
- Dashboard : nouvelle section "Planning du jour" (mini, `TaskV2`+`Routine` du jour triés par heure) — masque les tâches `essential=false` en mode surcharge. Le planning en cases complet reste dans `E40Planning` seul (pas de duplication de la grille horaire dans le dashboard)
- Nav segmentée dashboard : 6 boutons (Todo/Aujourd'hui/À faire plus tard/Routines/Planifier/Listes) — les 4 premiers conservés tels quels car testés par e2e T14/T15, Planifier/Listes ajoutés à la suite plutôt que remplacement strict par les 3 items de la maquette

## Dernière session (2026-07-01)

## Décisions prises
- V2-9 : bouton "Ajouter une tâche" dashboard repointé vers `task-create-v2` (résout la navigation orpheline), vérifié sans casser T11-T19 (bouton distinct de celui d'`E20Inbox`)
- Masquage `essential` : nouvelle section "Planning du jour" (mini, TaskV2+Routine) plutôt que migration complète de `todayTasks` vers TaskV2 (aurait cassé action immédiate/sous-tâches/drag-reorder)
- Nav du bas : segments existants conservés (Todo/Aujourd'hui/À faire plus tard/Routines) + Planifier/Listes ajoutés à la suite, pas de remplacement strict par les 3 items de la maquette (aurait cassé T14/T15)

## Livrables produits ou modifiés
- `src/ui/components/TopBar.tsx` : icône agenda (`onPlanningClick`)
- `src/ui/screens/dashboard/E10Dashboard.tsx` : section "Planning du jour", bouton d'ajout → `task-create-v2`, nav étendue (Planifier/Listes)
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : 8 tests ajoutés/corrigés (396/396 total)
- `roadmap_v2.md` : V2-9 close (mécanique + test manuel TM-01 à TM-06 validés) ; V2-7 (12 TM) et V2-8 (TM-07/08) validés en cascade, débloqués par la nouvelle nav

## Hypothèses validées / invalidées
- VALIDE : repointer le bouton dashboard vers `task-create-v2` ne casse aucun e2e (T11-T19 passent par le bouton propre à `E20Inbox`, vérifié par lecture de code + exécution e2e)
- INVALIDE : migrer `todayTasks` vers TaskV2 pour débloquer le masquage `essential` -> pivot vers une section planning séparée, sans toucher au système de tâches V1 existant
- VALIDE : nav bas à 6 segments plutôt que 3 stricts (évite de casser T14/T15, aucun réagencement UX demandé par ailleurs)

## Prochaine étape exacte
Démarrer V2-10 (Consolidation V2 & 2e vague de tests) : refacto/dead code, couverture ≥85%, doc V2 (README/schéma données/ADR), build + déploiement Netlify (bascule `main`), sessions test 2-5 avec Marie et autres testeurs AuDHD.

## Question bloquante pour la session suivante
Quand Marie vivra une vraie surcharge, quelle est la définition exacte du critère `essential` (quelles tâches masquer en mode surcharge) ?
