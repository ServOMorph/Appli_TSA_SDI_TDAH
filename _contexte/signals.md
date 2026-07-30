# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-30)

## Questions ouvertes
- [P1] Démarrer la Phase V5-1 (nav + écran d'accueil fusionné) de `roadmap_v5.0.md` à la prochaine session. — fait quand : Phase V5-1 codée, tests verts, gate de sortie atteint — réf : `roadmap_v5.0.md` Phase V5-1
- [P2] Corriger `exportData()` (`useSettingsState.ts:66`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`

## Dernière session (2026-07-30 — Phase V5-0 codée, testée, validée manuellement, close)

## Décisions prises
- Phase V5-0 codée intégralement sous Opus : pile de navigation (`navigation.ts`), extraction des règles de créneaux planning (`planningSlotRules.ts`), suppression des trois `*Origin` codés en dur au profit de la pile (`back(fallback)` / `originScreen` / `goToPath`), découpage d'`AppContext.tsx` en 6 contextes de domaine (`src/app/contexts/*`).
- Bug trouvé en validation manuelle et corrigé au fil de la session : la clause anti-cycle de `push()` remontait à tort vers une occurrence antérieure du même écran dans la pile, cassant le retour contextuel quand un écran sans paramètre (ex. `task-create-v2`) était réutilisé deux fois dans un même flux (ex. depuis Aujourd'hui). Clause supprimée, régression verrouillée par un test dédié.
- Validation manuelle intégrale des points 83 à 100 confirmée par l'utilisateur ; `tests_manuels.md` purgé intégralement (protocole : plus aucun test en attente).
- Deux constats produits non bloquants tracés dans la roadmap plutôt que corrigés dans l'immédiat : réglage « Réduire les animations » quasi sans effet visible (angle mort produit), et bug d'export du chiffrement de l'énergie du jour (`exportData` contourne le déchiffrement du repository).
- Phase V5-0 passée à `[FAIT]` dans `roadmap_v5.0.md`. Phase V5-1 reste `[TODO]` (checkpoint non encore confirmé par l'utilisateur).

## Livrables produits ou modifiés
- `src/app/navigation.ts` + `navigation.test.ts` (créés, 21 tests) : pile de navigation, route paramétrée.
- `src/domain/rules/planningSlotRules.ts` + test (créés, 22 tests) : calcul de créneaux extrait de `E40Planning.tsx`.
- `src/app/repositories.ts` (créé) : repositories et helpers partagés entre contextes.
- `src/app/contexts/` (créé, 6 fichiers) : `useTasksState`, `usePlanningState`, `useEnergyState`, `useListsState`, `useBudgetState`, `useSettingsState`.
- `src/app/AppContext.tsx` : refactorisé, 961 → 169 lignes, façade composant les 6 domaines.
- `E40Planning.tsx`, `App.tsx`, `E10Dashboard.tsx`, `E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx`, `E24Today.tsx`, `E60Lists.tsx`, `E61ListDetail.tsx`, `E70Tools.tsx` + leurs tests : branchés sur la pile, `*Origin` supprimés.
- `tests_manuels.md` : purgé intégralement (points 83-100 validés).
- `roadmap_v5.0.md` : Phase V5-0 → `[FAIT]`, § « Bugs constatés » et § « Reporté hors V5 » enrichies des deux constats de validation manuelle.
- `CHANGELOG.md` : entrées `v5.0.0` et `v5.1` ajoutées.

## Hypothèses validées / invalidées
- VALIDE : le socle refactorisé est strictement iso-fonctionnel — 515/516 tests unitaires (flaky pré-existant confirmé identique sur le code d'avant refacto via `git stash`), 53/53 e2e, `tsc -b`/lint/build clean, 0 module d'état au-dessus de 300 lignes.
- INVALIDE : la clause de collapse de `push()` sur une route déjà présente dans la pile -> pivot vers un simple empilement sans recherche d'occurrence antérieure, seule façon sûre sans paramètres différenciants sur les routes.
- EN ATTENTE : correctif du bug d'export du chiffrement de l'énergie (P2 ci-dessus, non traité cette session).

## Prochaine étape exacte
Demander `/compact`, puis démarrer la Phase V5-1 (nav + écran d'accueil fusionné) de `roadmap_v5.0.md`.

## Question bloquante pour la session suivante
Aucune.
