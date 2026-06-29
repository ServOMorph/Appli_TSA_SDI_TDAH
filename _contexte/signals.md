# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-29)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P1|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — Démarrage
- [P1|ouvert] Lancer Phase V2-0 (tag + branche + archive dist)
  - fait quand: tag `v1.0-mvp` créé, branche `v2` existante, `dist_v1/` archivé
  - réf: `roadmap_v2.md` Phase V2-0
- [P2|ouvert] Attendre maquettes de Marie (photos dessins visio)
  - fait quand: fichiers reçus et placés dans `Note de réunion/`
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md`

## Questions ouvertes
- Quand Marie vivra une vraie surcharge, elle détaillera son ressenti pour affiner le filtrage d'essentiels (V2-6)

## Échéances

## Blocages
- Maquettes de Marie non encore reçues (photos des dessins visio du 2026-06-29)

## Contexte chaud
- `npm run test` passe 259/259 ; `npm run test:e2e` passe 46/46
- Netlify déployé et fonctionnel — URL transmise à Marie
- Session test Marie complétée (2026-06-29, 35 min) : retours positifs et détaillés
- `roadmap_v2.md` créée (11 phases, pilotée par retours Marie)
- `roadmap.md` archivé dans `Archives/roadmap_v1.md`
- Reset données accepté par Marie : schéma Dexie v2 peut repartir proprement
- run_dev.py / run_prod.py disponibles à la racine

## Dernière session (2026-06-29)

# Session du 2026-06-29

## Décisions prises
- Première session test utilisateur (Marie) réalisée : Netlify fonctionnel, retours documentés
- `roadmap_v2.md` créée (11 phases) à partir des retours de Marie
- Contrainte migration données allégée : Marie accepte le reset, schéma Dexie v2 propre
- `roadmap.md` archivé dans `Archives/roadmap_v1.md`

## Livrables produits ou modifiés
- `Note de réunion/synthese_reunion_marie_2026-06-29.md` : synthèse session test (35 min, 10 actions)
- `Note de réunion/analyse_conduite_visio_marie.md` : méthodo pour prochaines visios
- `roadmap_v2.md` : roadmap V2 complète (11 phases)
- `Archives/roadmap_v1.md` : roadmap V1 archivée
- `_contexte/signals.md` : mis à jour avec actions V2

## Hypothèses validées / invalidées
- VALIDE : MVP fluide, sans bugs, design épuré apprécié par testeur réel AuDHD
- VALIDE : offline-first et reconnexion sans ressaisie fonctionnent
- INVALIDE : "Souffle" → trop abstrait pour TSA ; pivot vers "Batterie/Énergie"
- INVALIDE : mode surcharge non reconnu comme bouton → refactoriser en V2-6
- INVALIDE : "Inbox" / "Plus tard" libellés flous → "Todo" / suppression
- INVALIDE : migration additive requise → reset accepté par Marie, schéma v2 propre

## Prochaine étape exacte
1. Exécuter Phase V2-0 : `git tag v1.0-mvp`, branche `v2`, archiver `dist/`
2. Attendre maquettes de Marie, puis démarrer V2-1 (vocabulaire)

## Question bloquante pour la session suivante
Aucune (V2-0 peut démarrer immédiatement)
