# Migration des instructions d'agents

Statut : actuel
Dernier contrôle : 2026-09-16
Sources : `.claude/memory.md`, `.claude/CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.claude/zones.md`

## Contexte

La mémoire projet impose de répercuter toute modification de `.claude/CLAUDE.md` dans `AGENTS.md`
et `GEMINI.md`. Ces trois fichiers divergent actuellement : `.claude/CLAUDE.md` contient des
règles supplémentaires sur la base de connaissances, les retours testeurs, le mode urgent et la
validation conversationnelle ; `AGENTS.md` et `GEMINI.md` conservent notamment l'ancien catalogue
de tests à faire.

La zone documentation autorise la création de cette documentation, mais ne donne pas à elle seule
le droit de choisir le contenu canonique ou d'écraser les instructions des autres agents.

## Décision

Le 2026-09-16, l'utilisateur a choisi `.claude/CLAUDE.md` comme contenu canonique. Les trois
fichiers d'instructions ont reçu ce même contenu, normalisé en UTF-8 avec une fin de ligne finale,
et ont la même empreinte SHA-256.

Les règles extraites sont d'abord documentées dans les décisions du dossier `30_decisions/`. Après
arbitrage, les trois fichiers devront recevoir exactement le même contenu, puis seuls les blocs
migrés pourront être remplacés par des renvois vers cette documentation.

## Conséquences

- Les règles supplémentaires de `.claude/CLAUDE.md` sont actives pour les trois assistants.
- Aucun bloc d'instruction n'a été supprimé ou remplacé par renvoi documentaire.
- Toute évolution future de `.claude/CLAUDE.md` doit continuer à être répercutée dans les deux
  miroirs et comparée par empreinte.

## Date et source de l'arbitrage

Arbitrage rendu le 2026-09-16 : `.claude/CLAUDE.md` est la source canonique choisie par
l'utilisateur. La synchronisation binaire des trois fichiers a été réalisée le même jour.
