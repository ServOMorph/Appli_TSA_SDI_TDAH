# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-01 session 3)

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
- [P1|ouvert] À DÉCIDER PROCHAINE SESSION — Collision de nommage "À planifier plus tard" (V2) vs "À faire plus tard" (V1)
  - constat : signalé comme "bug" par l'utilisateur (tâche créée en "À planifier plus tard" invisible dans "À faire plus tard") — en réalité pas un bug, deux systèmes distincts et non reliés qui portent des libellés quasi identiques
  - explication technique : créer une tâche via `E21CreateTaskV2` (bouton "Ajouter une tâche") avec destination "À planifier plus tard" crée une `TaskV2` statut `to_plan`. Cette tâche est visible UNIQUEMENT via le bouton "À planifier" (point rouge, dashboard) → `E50ToPlanQueue`. Elle n'apparaît PAS dans l'onglet nav "À faire plus tard" (`E25Later`), qui affiche exclusivement les tâches V1 (`Task`, statut `later`) — un modèle de données totalement différent, sans lien avec `TaskV2`/`to_plan`.
  - options à trancher :
    1. Fusionner les deux systèmes (migrer `E25Later` vers `TaskV2`/`to_plan`, supprimer le doublon V1 `later`)
    2. Renommer l'un des deux libellés pour lever l'ambiguïté sans toucher au code (ex: "À dater" vs "Choses à faire plus tard")
    3. Ne rien changer, mais documenter/expliquer la distinction dans l'UI (ex: tooltip, texte d'aide)
  - fait quand: une des 3 options est choisie et actée
  - réf: `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `src/ui/screens/planning/E50ToPlanQueue.tsx`, `src/ui/screens/tasks/E25Later.tsx`, `src/domain/entities/task.ts` (statut `later`) vs `src/domain/entities/taskV2.ts` (statut `to_plan`)

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

## Dernière session (2026-07-01 session 3)

## Décisions prises
- Aucune décision actée — session d'analyse : clarification Todo/À faire plus tard (V1), vérification de la pastille "À planifier" (déjà livrée V2-5), diagnostic d'un signalement utilisateur ("bug" à la création de tâche)

## Livrables produits ou modifiés
- `_contexte/signals.md` : nouvelle action P1 documentée — collision de nommage "À planifier plus tard" (V2, `TaskV2`/`to_plan`) vs "À faire plus tard" (V1, `Task`/`later`), avec 3 options de résolution à trancher

## Hypothèses validées / invalidées
- VALIDE : le signalement utilisateur n'est pas un bug logiciel — c'est une confusion UX réelle entre deux systèmes de données distincts (V1 `later` / V2 `to_plan`) sous des libellés quasi identiques, confirmé par lecture de `E21CreateTaskV2.tsx`, `E50ToPlanQueue.tsx`, `E25Later.tsx`
- VALIDE : la pastille rouge "À planifier" (Phase V2-5) est bien codée et fonctionnelle (`E10Dashboard.tsx:397-427`)

## Prochaine étape exacte
Trancher la collision de nommage V1/V2 (voir action P1 ci-dessus, 3 options proposées), puis poursuivre V2-10 : doc V2, build + déploiement Netlify, sessions test 2-5 avec Marie.

## Question bloquante pour la session suivante
Collision de nommage "À planifier plus tard" / "À faire plus tard" : fusionner les deux systèmes, renommer, ou documenter la distinction dans l'UI ?
