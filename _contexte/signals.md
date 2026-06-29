# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-29)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P1|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|done] Phase V2-2 (modèle de données v2) close
  - fait quand: `db.ts` version(2) propre, entités Task/List/Routine/RoutineStep définies, tests ≥ 85 %
  - réf: taskV2Repository, listRepository, listItemRepository, routineRepository, routineStepRepository ; tests : 301/301 ✓
- [P2|done] Maquettes de Marie reçues et localisées
  - fait quand: fichiers reçus et placés dans `Note de réunion/`
  - réf: `Note de réunion/Capture d'écran 2026-06-29 183750.png` (accueil), `184709.png` (planning hebdo), `184750.png` (RM détaillée)
- [P1|ouvert] Démarrer Phase V2-3 (flux d'ajout de tâche refondu)
  - fait quand: écran ajout avec 3 destinations (Todo/Planifier/À planifier), validation complète
  - réf: `roadmap_v2.md` Phase V2-3

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
Aucun — V2-2 close. V2-3 peut démarrer immédiatement. V2-4 (planning) et V2-9 (accueil) disposent des maquettes.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 301/301 ; `npm run test:e2e` passe 46/46
- V2-0, V2-1, V2-2 closes — prochaine phase : V2-3 (flux d'ajout refondu)
- db.ts version(2) : TaskV2, List, ListItem, Routine, RoutineStep repositories créés et testés ✓
- run_dev.py lance Vite via `npm run dev --host` (attention : encodage emoji Python sur Windows cp1252 — lancer `npm run dev` directement si besoin)

## Dernière session (2026-06-29)

# Session du 2026-06-29

## Décisions prises
- Phase V2-0 exécutée : tag `v1.0-mvp` posé, branche `v2` créée, `dist_v1/` archivé — V1 restaurable en une commande
- Phase V2-1 exécutée : vocabulaire UI aligné (souffle→énergie, Inbox→Todo, Plus tard→À faire plus tard)

## Livrables produits ou modifiés
- `dist_v1/` : archive build V1 (9 fichiers)
- `src/ui/screens/*` (8 fichiers) : libellés UI V2-1 mis à jour
- `src/ui/screens/*.test.*` (6 fichiers) : tests mis à jour (259/259)
- `roadmap_v2.md` : Phases V2-0 et V2-1 cochées [x]

## Hypothèses validées / invalidées
- VALIDE : V2-0 exécutable sans bloquer — V1 toujours restaurable
- VALIDE : changements vocabulaire V2-1 sans régression (259/259 → 301/301 tests après V2-2)
- VALIDE : "énergie" / "Todo" / "À faire plus tard" visibles et corrects dans l'UI (test manuel Playwright)
- VALIDE : schéma v2 parallèle à v1, sans casser l'existant (TaskV2, List, Routine implémentés, tests ≥ 85 %)

## Prochaine étape exacte
Démarrer Phase V2-3 — Écran ajout de tâche : 3 destinations obligatoires (Todo/Planifier/À planifier plus tard).

## Question bloquante pour la session suivante
Aucune (V2-3 peut démarrer immédiatement)
