# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-29)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P1|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Démarrer Phase V2-2 (modèle de données v2)
  - fait quand: `db.ts` version(2) propre, entités Task/List/Routine/RoutineStep définies, tests ≥ 85 %
  - réf: `roadmap_v2.md` Phase V2-2
- [P2|ouvert] Attendre maquettes de Marie (photos dessins visio)
  - fait quand: fichiers reçus et placés dans `Note de réunion/`
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md`

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
- Maquettes de Marie non encore reçues (photos des dessins visio du 2026-06-29) — nécessaires pour V2-4 et V2-9

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- `npm run test` passe 259/259 ; `npm run test:e2e` passe 46/46
- V2-0 et V2-1 closes — prochaine phase : V2-2 (modèle de données)
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
- VALIDE : changements vocabulaire V2-1 sans régression (259/259 tests)
- VALIDE : "énergie" / "Todo" / "À faire plus tard" visibles et corrects dans l'UI (test manuel Playwright)
- EN ATTENTE : maquettes de Marie non reçues — nécessaires pour V2-4 (planning) et V2-9 (accueil)

## Prochaine étape exacte
Démarrer Phase V2-2 — Modèle de données v2 : réécrire `db.ts` (version(2)), nouvelles entités Task/List/Routine, règles domaine.

## Question bloquante pour la session suivante
Aucune (V2-2 peut démarrer immédiatement ; maquettes Marie nécessaires pour V2-4 seulement)
