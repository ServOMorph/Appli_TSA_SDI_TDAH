# Signals — jeux   (MAJ 2026-10-10)

## Actions ouvertes
- [P1|ouvert] Recueillir auprès de l'utilisateur ce qu'il entend par « ludique » (exemples de jeux appréciés, mécaniques attendues : progression, récompense, narration, tension, rejouabilité) et si cela prime sur le principe « ni ludique à tout prix, ni addictif » du design system. fait quand: réponse de l'utilisateur consignée dans `contexte.md` (critères de jeu). réf: `JEUX/propositions_jeux.md`, `_docs/docs de dev/5- DESIGN SYSTEM NEURODIVERGENT.md` §2
- [P1|ouvert] Redéfinir la proposition de jeux sur la base de ces critères, puis la faire valider avant tout nouveau développement. fait quand: nouvelle `propositions_jeux.md` validée par l'utilisateur. réf: `JEUX/donnees/synthese_recherche.md`, `JEUX/propositions_jeux.md`
- [P2|ouvert] Compléter la collecte web côté jeunes adultes / haut potentiel / AuDHD : les sources collectées (IA-TSA) visent surtout des enfants TSA, et les extraits web n'ont pas été relus en pages complètes. fait quand: `synthese_recherche.md` mis à jour avec sources lues en intégralité pour ce public. réf: `JEUX/donnees/synthese_recherche.md` §2 et §3.3
- [P2|ouvert] Décider du sort de « Tri calme » (jugé trop simple) et de « Planning d'énergie » (jugé pas assez ludique) : retirer, transformer ou garder comme base technique. fait quand: décision de l'utilisateur consignée dans `contexte.md` et `catalogue.ts` ajusté. réf: `JEUX/harness/catalogue.ts`, `JEUX/tri_calme/`, `JEUX/planning_energie/`
- [P2|ouvert] Proposer d'ajouter à `DOCUMENTATION/` l'information transversale : public cible des jeux = jeunes adultes autonomes, parfois haut potentiel (confirmation utilisateur requise, zone `documentation`). fait quand: décision documentaire prise par l'utilisateur. réf: `JEUX/_contexte/contexte.md`

## Dernière session (2026-10-10)
# Session du 2026-10-10

## Décisions prises
- Public cible : jeunes adultes autonomes, parfois à haut potentiel (pas de déficience).
- Banc de test hors application créé : `run_jeux.py` + `JEUX/harness/` (import de `src/` en lecture seule, base de données séparée, port 5180).
- Proposition initiale de 5 jeux simples abandonnée (fondée sur des données centrées enfants TSA).

## Livrables produits ou modifiés
- `run_jeux.py`, `JEUX/harness/`, `JEUX/vitest.config.ts`, `JEUX/tsconfig.json` : opérationnels (types, lint, 29 tests OK).
- `JEUX/tri_calme/` : jeu 1, fonctionnel, jugé trop simple par l'utilisateur.
- `JEUX/planning_energie/` : jeu B, fonctionnel (générateur à solution garantie, solveur, indices), jugé pas assez ludique par l'utilisateur.
- `JEUX/donnees/synthese_recherche.md`, `JEUX/propositions_jeux.md` : produits, le second révisé.

## Hypothèses validées / invalidées
- VALIDE : le banc de test fait apparaître les jeux sur l'accueil, outils dépliés, sans onboarding (vérifié en navigateur).
- INVALIDE : « un casse-tête de planification fidèle au vocabulaire de l'application suffit à intéresser le public » -> pivot vers critères de jeu à recueillir.
- EN ATTENTE : difficulté réelle de « Difficile », tactile, mode sombre (jamais testés).

## Prochaine étape exacte
Faire préciser par l'utilisateur ce qu'est un jeu « ludique » pour lui, puis rebâtir la proposition sur ces critères.

## Question bloquante pour la session suivante
Quels jeux ou mécaniques trouvez-vous ludiques, et cela prime-t-il sur le principe anti-addictif du design system ?
