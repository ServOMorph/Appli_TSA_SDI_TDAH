---
description: Analyse les retours testeurs en attente, planifie et traite leurs correctifs, répond au fil de discussion
argument-hint: [device_id]
allowed-tools: Bash(python scripts/reply_feedback_report.py:*), Bash(python scripts/read_feedback_reports.py:*), Bash(npx tsc -b:*), Bash(npx vitest run:*), Bash(npm run lint:*), Bash(npm run test:e2e:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(ls:*), Bash(test -f:*)
---

# /traiter_retours [device_id]

Traite les retours du fil de discussion testeur (E122 → E123 → E124, cf.
`Archives/roadmap_retours_conversationnels.md`) : lecture, correctif, tests, réponse. La validation
finale d'un retour reste au testeur dans E124 (CLAUDE.md § Validation des retours par Marie) — cette
commande ne clôt jamais un retour (n'appelle jamais `close_feedback_report`) et n'écrit jamais dans
`COMMUNICATION/Marie/a_transmettre.md` pour un retour individuel (réservé aux commentaires de
livraison).

## Procédure

1. Lister les retours nécessitant une réponse :
   ```
   python scripts/reply_feedback_report.py
   ```
   Si $ARGUMENTS (device_id) est fourni, ne garder que les retours de cet appareil. Si la sortie est
   « Aucun retour necessitant une reponse. » : le signaler et s'arrêter, rien à traiter.

2. Analyser chaque retour listé à l'étape 1 :
   - Pour chaque `device_id` distinct parmi ces retours, récupérer le détail complet (image
     annotée, écran, version) :
     ```
     python scripts/read_feedback_reports.py --device-id <device_id> --output-dir scratchpad/feedback-reports
     ```
     Dossier `scratchpad/` uniquement (gitignoré, jamais committé) : les images sont des captures
     personnelles du testeur, à ne jamais copier ailleurs dans le dépôt ni afficher au-delà de ce
     qui est nécessaire au diagnostic. Ignorer les lignes renvoyées qui ne sont pas dans la liste de
     l'étape 1 (retours déjà répondus ou déjà validés par le testeur, hors périmètre).
   - Si le dernier message d'un retour est une relance du testeur et que le commentaire initial
     (`comment`) ne suffit pas à la comprendre, lire le fil complet (`feedback_messages` de ce
     `report_id`, table Supabase) avant d'agir plutôt que de deviner son contenu.
   - Classer chaque retour à partir du code réel (jamais `signals.md`/`contexte.md` seuls, datés —
     et jamais conclure « déjà corrigé » sans avoir lu le code correspondant dans cette session,
     fichier et lignes à l'appui) : bug confirmé et reproductible, déjà corrigé mais pas encore
     déployé, décision produit/ambigu, hors périmètre technique (retour de compréhension, pas de
     bug).

3. Clarifications. Si un retour est ambigu, contredit une décision existante, ou relève d'un choix
   produit plutôt que d'un bug : poser la question à l'utilisateur avant de continuer (un retour à
   la fois, ou groupés si plusieurs partagent la même ambiguïté). Ne jamais deviner l'intention ni
   corriger sur une hypothèse non confirmée. Ne pas passer à l'étape 4 tant qu'au moins une
   clarification bloquante reste sans réponse.

4. Une fois tous les retours à traiter clarifiés, planifier :
   - Si une roadmap `roadmap_retours_*.md` non close existe déjà à la racine du projet, la
     compléter plutôt que d'en créer une nouvelle. Sinon, créer `roadmap_retours_<AAAA-MM-JJ>.md` à
     la racine, au format défini par `CLAUDE.md` § Roadmap.
   - Section « Retours analysés » : tableau récapitulatif (id retour tronqué à 8 caractères / écran
     / constat / traitement), même forme que `Archives/roadmap_demandes_marie_2026-09-10.md`. Un
     retour déjà corrigé mais pas déployé, ou déjà livré : le sortir des phases de code, sa réponse
     est déjà connue.
   - Découper le reste en phases en regroupant les retours qui touchent le même fichier, le même
     écran ou une cause racine commune probable — une phase par correctif indépendant, pas une phase
     par retour (chaque phase se termine par un checkpoint `/compact` obligatoire ; les multiplier
     inutilement coûte du temps et des tokens sans bénéfice). Ordonner les phases : d'abord un
     correctif dont dépendent d'autres retours de ce lot, sinon par proximité de fichiers touchés
     (limiter les allers-retours de contexte), sinon par ordre de dépôt.
   - Chaque phase : Constat (preuve dans le code, fichier:ligne), fichiers pressentis, tests
     automatisés à ajouter ou adapter, critère de sortie. Checkpoint `/compact` en fin de phase (ne
     pas le supprimer, ne pas le modifier).

5. Exécuter les phases dans l'ordre, une seule `[EN COURS]` à la fois. Pour chaque phase :
   - Corriger sans rien casser. Tests ajoutés ou adaptés dans la même phase, jamais reportés à une
     phase séparée sauf volume le justifiant (CLAUDE.md § Roadmap, Contenu des phases).
   - Gates avant de considérer la phase terminée : `npx vitest run`, `npx tsc -b`, `npm run lint` ;
     ajouter `npm run test:e2e` si le parcours touché est couvert par la suite e2e.
   - Documenter le résultat dans la phase (§ Réalisé), comme `Archives/roadmap_demandes_marie_2026-09-10.md`.
   - Une fois le correctif vérifié, déposer la réponse pour chaque retour couvert par la phase :
     ```
     python scripts/reply_feedback_report.py --report-id <id> --body <texte>
     ```
     Règle de rédaction (CLAUDE.md § Réponses aux retours testeurs) : synthétique, sans jargon, sans
     nom de fichier ni de commit, une idée par phrase. Ne jamais appeler `close_feedback_report` :
     le retour reste ouvert tant que le testeur ne l'a pas validé lui-même dans E124.
   - Checkpoint : demander à l'utilisateur de faire `/compact` avant la phase suivante, attendre sa
     réponse écrite.

6. Une fois toutes les phases traitées (ou arrêtées sur une décision produit encore ouverte),
   synthèse à l'utilisateur :
   - retours corrigés et réponse déposée (id retour, écran, résumé du correctif) ;
   - retours restés ouverts et pourquoi (décision produit en attente, hors périmètre technique,
     dépendance non résolue) ;
   - fichiers modifiés et état des gates (tests/`tsc -b`/lint, e2e si lancé) ;
   - dette ou simplification repérée en cours de route, non corrigée — à signaler, jamais à tracer
     automatiquement dans `signals.md` (mise à jour réservée à `/close`) ;
   - rappel explicite : rien n'est commité par cette commande (à la charge du prochain `/close`), et
     aucun retour n'a été validé/clos à la place du testeur.
