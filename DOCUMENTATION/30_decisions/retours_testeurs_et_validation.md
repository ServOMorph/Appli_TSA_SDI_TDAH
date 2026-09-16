# Retours testeurs et validation

Statut : actuel
Dernier contrôle : 2026-09-16
Sources : `.claude/CLAUDE.md`, `scripts/reply_feedback_report.py`, `src/data/sync/feedbackClient.ts`, `src/data/db.ts`

## Contexte

Le catalogue de tests manuels intégré à l'application a été retiré. Le code conserve la boucle de
retours : un testeur ouvre un retour, l'agent peut y déposer une réponse, puis le testeur valide
lui-même la résolution.

## Décision

La validation des retours passe par le fil de discussion associé au retour, et non par une liste
proactive de tests à refaire. Le script `reply_feedback_report.py` ne clôt jamais un retour : il
dépose uniquement une réponse d'agent. La clôture utilise le mécanisme applicatif de validation
du testeur.

La réponse d'agent reste synthétique, sans jargon, sans nom de fichier ni de commit, avec une
idée par phrase. Son exécution est explicite en session ; aucune automatisation ne la rattache au
déploiement ou à la clôture d'une roadmap.

## Options écartées

- Recréer une liste de tests à refaire dans les documents de communication.
- Clôturer un retour à la place du testeur après le dépôt d'une réponse.
- Automatiser la réponse aux retours lors d'un déploiement ou d'une clôture.

## Conséquences

- Les anciennes mentions de l'écran « Tests à faire » sont obsolètes lorsqu'elles décrivent le
  processus de validation actuel.
- Un retour reste ouvert après une réponse de l'agent tant que le testeur ne l'a pas validé.
- Les instructions `AGENTS.md` et `GEMINI.md` contiennent encore l'ancien processus ; leur
  harmonisation requiert un arbitrage explicite avant toute modification.

## Date et source de l'arbitrage

Décision du 2026-09-15 consignée dans `.claude/CLAUDE.md`, recoupée avec l'absence du catalogue
dans le code et avec le script de réponse actuel.
