# Signals — jeux (MAJ 2026-10-10)

## Actions ouvertes
- [P1|ouvert] Choisir une des trois nouvelles pistes avant tout nouveau développement ; préciser ensuite les éléments des jeux cités que sa fille apprécie le plus. fait quand: choix consigné et prochain prototype autorisé par l'utilisateur. réf: `JEUX/propositions_jeux.md`
- [P2|ouvert] Compléter la collecte web côté jeunes adultes / haut potentiel / AuDHD : les sources collectées (IA-TSA) visent surtout des enfants TSA, et les extraits web n'ont pas été relus en pages complètes. fait quand: `synthese_recherche.md` mis à jour avec sources lues en intégralité pour ce public. réf: `JEUX/donnees/synthese_recherche.md` §2 et §3.3
- [P2|ouvert] Proposer d'ajouter à `DOCUMENTATION/` l'information transversale : public cible des jeux = jeunes adultes autonomes, parfois haut potentiel (confirmation utilisateur requise, zone `documentation`). fait quand: décision documentaire prise par l'utilisateur. réf: `JEUX/_contexte/contexte.md`

## Dernière session (2026-10-10, mise à jour)

## Décisions prises
- Public cible : jeunes adultes autonomes, parfois à haut potentiel (pas de déficience).
- Banc de test hors application créé : `run_jeux.py` + `JEUX/harness/` (import de `src/` en lecture seule, base de données séparée, port 5180).
- Proposition initiale de 5 jeux simples abandonnée (fondée sur des données centrées enfants TSA).
- Les trois prototypes ont été retirés. L'analyse des boucles, retours et leçons reste dans `JEUX/donnees/analyse_prototypes_rejetes.md`.
- Le jeu de fusion a été rejeté car il ressemblait trop à Fruit Merge. Trois concepts distincts sont proposés ; aucun n'est encore sélectionné.

## Livrables produits ou modifiés
- `run_jeux.py`, `JEUX/harness/`, `JEUX/vitest.config.ts`, `JEUX/tsconfig.json` : banc de test conservé.
- `JEUX/donnees/analyse_prototypes_rejetes.md` : analyse de mémoire conservée après retrait du code des trois prototypes.
- `JEUX/propositions_jeux.md` : trois nouveaux concepts en attente de choix.

## Hypothèses validées / invalidées
- VALIDE : le banc de test fait apparaître les jeux sur l'accueil, outils dépliés, sans onboarding (vérifié en navigateur).
- INVALIDE : « un casse-tête de planification fidèle au vocabulaire de l'application suffit à intéresser le public » -> pivot vers critères de jeu à recueillir.
- INVALIDE : ajouter des fusions, lignes et un pouvoir spécial suffit à distinguer le jeu de Fruit Merge.

## Prochaine étape exacte
Faire choisir un des trois concepts avant de développer un nouveau prototype.

## Préférence utilisateur connue
Sa fille aime *Zombie Tsunami*, Tetris et les jeux de fusion de fruits. Elle a rejeté le prototype de fruits car il ressemblait trop à Fruit Merge. Les mécaniques précises qu'elle aime dans ces jeux ne sont pas encore établies.
