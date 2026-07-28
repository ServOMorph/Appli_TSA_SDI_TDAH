# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-28)

## Questions ouvertes
- [P1] Communiquer à Marie les points de `a_communiquer_2026-07-28.md` (à montrer : grille du planning révélée pendant un drag ; écarts assumés : dossiers à un seul niveau, bouton « + » sans menu dépense, Budget non refondu ; questions Q2/Q3 ; ce qui reste manipulable après usage). — fait quand : retour de Marie recueilli sur les 4 écarts assumés — réf : `Note de réunion/2026-07-28/a_communiquer_2026-07-28.md`
- [P1] Faire valider par l'utilisateur en test manuel tactile que le drag-and-drop dans Planning ne sélectionne plus le texte de l'appli (correctif du 2026-07-25, jamais confirmé depuis). — fait quand : validation tactile confirmée — réf : `E40Planning.tsx`, `roadmap_v5.0.md` Phase V5-1 (item auto-scroll repris de l'ancienne V4.1-6)
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — non vérifié en navigateur ; le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Nom définitif de l'outil « Sentiments » (Q2) et renommage de l'outil de comptage actuellement nommé « joint » (Q3), ambigu avec un compte bancaire partagé. Non bloquant pour le code, reporté avec les outils en V5.1+. — fait quand : réponse de Marie obtenue — réf : `Note de réunion/2026-07-28/constats_2026-07-28.md` § Q, `a_communiquer_2026-07-28.md` § À lui demander

## Dernière session (2026-07-28, analyse visio + arbitrage V5.0, pas de code applicatif)

## Décisions prises
- Branche `v5.0` créée depuis `v4.1` pour porter la refonte issue de la visio Marie du 2026-07-28.
- Commande `/analyse_visio` corrigée en profondeur après un échec constaté en exécution : l'appariement horodaté du `.jsonl` était invalide sur ce jeu de données (retard cumulatif atteignant ~20 min, confirmé en comparant `state.position` à la taille du fichier). Remplacé par un appariement ordinal par annonce, vérifié image par image. Ajout d'un garde-fou d'intégrité systématique, d'une étape d'arbitrage interactif avant l'écriture de la roadmap, d'une lecture conditionnelle des documents non lisibles (`.docx`), et d'une étape finale d'archivage/promotion de roadmap.
- Périmètre de la V5.0 tranché avec l'utilisateur (Q7) : socle seul, 4 phases sur les 7 cadrées en séance (V5-0 refacto, V5-1 nav+accueil fusionné, V5-2 planning/tâches, V5-3 outils/dossiers/listes/budget rebranché). Les 5 outils spécialisés décrits par Marie (Sentiments, Liste comptage, Comptes refondus, Routine, Tableau prévisions) sont reportés en V5.1+.
- 6 autres arbitrages tranchés : accueil et planning fusionnés en un seul écran à deux états (Q8) ; Budget V4.1 rebranché tel quel comme outil, sans refonte de son modèle (Q5) ; dossiers limités à un seul niveau (Q9) ; grille du planning révélée uniquement pendant un drag actif (Q10) ; récurrence sur le modèle Google Agenda avec choix occurrence/série à chaque modification (Q11) ; bouton « + » conservant la création directe de tâche héritée de la Phase V4.1-5 (Q12).
- `roadmap_v4.1.md` archivée (`Archives/`), `roadmap_v5.0.md` promue à la racine du projet.

## Livrables produits ou modifiés
- `.claude/commands/analyse_visio.md` : modifiée (appariement, garde-fous, arbitrage interactif, lecture `.docx`, étape d'archivage).
- `Note de réunion/2026-07-28/captures_2026-07-28.md` : créé (58 captures + 6 feuilles appariées).
- `Note de réunion/2026-07-28/constats_2026-07-28.md` : créé (48 constats priorisés, section sources non exploitées, 7 Q).
- `Note de réunion/2026-07-28/a_communiquer_2026-07-28.md` : créé (points à communiquer à Marie).
- `roadmap_v5.0.md` : créé, arbitré interactivement, déplacé à la racine.
- `Archives/roadmap_v4.1.md` : archivée (renommée depuis la racine).
- `Note de réunion/2026-07-28/en amont/communication marie.txt` : supprimé (fichier vide).
- Aucun fichier `src/` modifié.

## Hypothèses validées / invalidées
- VALIDE : l'appariement horodaté (`horodatage` du `.jsonl`) n'est pas fiable sans contrôle préalable de couverture — pivot vers l'appariement ordinal vérifié par le contenu visuel, désormais méthode primaire de la commande.
- VALIDE : le code contenait déjà la sémantique demandée par Marie pour l'énergie (Q1, `energyRules.ts`) — aucune décision à lui remonter sur ce point, seul l'affichage doit évoluer.
- EN ATTENTE : validation tactile du correctif de sélection de texte pendant le drag planning (2026-07-25), toujours non confirmée trois sessions plus tard.
- EN ATTENTE : retour de Marie sur les 4 écarts assumés et sur la démonstration de la grille révélée pendant le drag.

## Prochaine étape exacte
[P1] Communiquer à Marie les points de `a_communiquer_2026-07-28.md`. Une fois son retour recueilli sur les écarts assumés, démarrer la Phase V5-0 (refacto socle du système d'état et de navigation, sous Opus) de `roadmap_v5.0.md` — réf : `roadmap_v5.0.md` Phase V5-0.

## Question bloquante pour la session suivante
Aucune — les arbitrages nécessaires au démarrage du code ont été tranchés avec l'utilisateur cette session. Q2/Q3 restent ouvertes mais ne bloquent pas la Phase V5-0.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) : son contenu est repris dans `Archives/roadmap_v4.1.md` ; l'item d'auto-scroll qu'il évoquait est désormais porté par la Phase V5-1 de `roadmap_v5.0.md`. Peut être vidé une fois cette phase close.
