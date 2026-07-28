# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-28, suite)

## Questions ouvertes
- [P1] Démarrer la Phase V5-0 (refacto socle du système d'état et de navigation) de `roadmap_v5.0.md`, sous Opus, à la prochaine session. — fait quand : Phase V5-0 codée, tests verts, gate de sortie atteint — réf : `roadmap_v5.0.md` Phase V5-0
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant — décision explicite de l'utilisateur cette session), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — non vérifié en navigateur ; le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`

## Dernière session (2026-07-28, suite — arbitrages finaux V5.0, pas de code applicatif)

## Décisions prises
- Q10 révisé, tranché directement avec l'utilisateur (sans repasser par Marie) : abandon complet du glisser-déposer sur le planning. Une tâche se modifie désormais en cliquant dessus pour ouvrir sa fiche, où chaque champ (date, horaire, alerte, énergie) est cliquable — reprend exactement le fonctionnement de l'application de référence de Marie (cf. capture `Capture d'écran 2026-07-28 160841.png`). Rend obsolètes : la dette V4.1-6 (auto-scroll pendant drag), le correctif de sélection de texte du 2026-07-25 et sa validation tactile en attente, `planningDragRules.ts` (renommé `planningSlotRules.ts`, sans logique de drag).
- Q2 résolu : l'outil « Sentiments » se nomme « Météo du jour ». Q3 résolu : l'outil de comptage (ex-« joint ») se nomme « Comptage ».
- Ordre de priorité des 5 outils reportés en V5.1+ tranché : Comptage en premier (usage quotidien concret), puis Météo du jour, Comptes refondus, Routine, Tableau prévisions.
- Décision de ne pas envoyer la communication à Marie maintenant : elle se fera au moment de la livraison de la V5.0, une fois qu'elle pourra manipuler. `a_communiquer_v5.md` créé à la racine pour cet usage futur, remplaçant la version de travail du 2026-07-28.
- 7 fichiers de communication Marie devenus obsolètes (questions déjà répondues dans des visios ultérieures, ou remplacés par `a_communiquer_v5.md`) supprimés après validation explicite de l'utilisateur.

## Livrables produits ou modifiés
- `roadmap_v5.0.md` : modifié — Q10 révisé (fiche cliquable au lieu du drag), Q2/Q3 résolus, priorité des outils reportés fixée, items et gates de V5-0/V5-1/V5-2 mis à jour en conséquence (suppression des références au drag).
- `a_communiquer_v5.md` (racine) : créé — synthèse finale à communiquer à Marie à la livraison de la V5.0.
- 7 fichiers supprimés (validés par l'utilisateur) : `Note de réunion/2026-07-28/a_communiquer_2026-07-28.md`, `Note de réunion/a demander a Marie.md`, `Note de réunion/2026-07-06/a traiter prochaine reunion.txt`, `Note de réunion/2026-07-06/questions_visio_marie_v2_retour.md`, `Note de réunion/2026-07-13/questions_marie.md`, `Note de réunion/2026-07-16/questions_marie.md`, `Note de réunion/Marie-2026-06-28.txt`.
- Aucun fichier `src/` modifié.

## Hypothèses validées / invalidées
- INVALIDE : l'arbitrage initial du 2026-07-28 sur Q10 (grille révélée pendant un drag) -> pivot vers l'abandon total du drag au profit d'une fiche tâche cliquable, alignée sur l'application de référence de Marie.
- VALIDE : les 6 questions de `Note de réunion/2026-07-16/questions_marie.md` (identiques à celles du 2026-07-13) étaient déjà toutes répondues dans `constats_2026-07-18.md` § « Questions en attente désormais tranchées » — fichiers obsolètes confirmés avant suppression.

## Prochaine étape exacte
Démarrer la Phase V5-0 (refacto socle, sous Opus) de `roadmap_v5.0.md` à la prochaine session. Ne pas communiquer à Marie avant la livraison complète de la V5.0.

## Question bloquante pour la session suivante
Aucune.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) : entièrement obsolète désormais — l'item d'auto-scroll (l.1) ne s'applique plus (drag supprimé) ; les 3 autres items (l.2-4) sont déjà couverts par la Phase V4.1-5 close (`FORCED_DESTINATION_BY_ORIGIN`, accent visuel liste épinglée). À vider ou supprimer à la discrétion de l'utilisateur, non fait automatiquement cette session.
