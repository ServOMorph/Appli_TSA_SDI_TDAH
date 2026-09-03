# Signals — discord   (MAJ 2026-09-03)

## Actions ouvertes
- [P1|ouvert] Adoption gateway par l'orchestrateur (hors zone discord)
  fait quand: `agent_role.md` orchestrateur + design interdisent l'écriture Discord directe, `deploy.md`/`analyser_googledoc.md` n'appellent plus message_marie.py/claude_bridge, CLAUDE.md aligné sur "canal Marie = Discord via gateway"
  réf: scratchpad message_orchestrateur.txt (livré), DISCORD/discord_com/gateway/README.md
- [P1|ouvert] Valider le chemin réel d'envoi : gateway.py drain (POST Discord réel) + réception d'une vraie réponse Marie routée vers inbox/orchestrateur/
  fait quand: un aller-retour complet Marie observé via la gateway, pending purgé
  réf: DISCORD/discord_com/gateway.py (drain, route_inbound), tests unitaires test_gateway.py
- [P2|ouvert] Compléter STYLE.md sections `morpheus` et `channel` avec les préférences de Morphéus (ton, niveau de détail ; audience du canal). Emojis déjà tranché : aucun dans le corps.
  fait quand: les deux sections n'ont plus la mention "à compléter / valider par Morphéus"
  réf: DISCORD/discord_com/gateway/STYLE.md
- [P2|ouvert] `DISCORD/discord_com/bot.pid` apparaît en fichier non suivi et n'est pas gitignoré (contrairement à queue.json/commands.json) — trancher : l'ajouter au .gitignore de discord_com ou le supprimer
  fait quand: `git status --short` ne liste plus bot.pid dans DISCORD/
  réf: DISCORD/discord_com/.gitignore, signals racine (action de nettoyage d'arbre déjà tracée côté racine)

## Contexte chaud
- STYLE.md livré (`DISCORD/discord_com/gateway/STYLE.md`) : forme des messages sortants par destinataire, relu avant chaque `approve`. Câblé dans `gateway/LOOP.md` § 1. Rappel équivalent ajouté à `.claude/commands/discord_loop.md` étape 3a-bis mais NON COMMITÉ (fichier partagé, modifs concurrentes de la session orchestrateur "service permanent").
- Session orchestrateur concurrente en cours (roadmap_gateway_discord_service.md, hooks SessionStart/Stop) : arbre de travail encombré — `.claude/CLAUDE.md`, `close.md`, `start.md`, `discord_loop.md`, `gateway.py`, `test_gateway.py`, `gateway/README.md`, `hook_gateway_poll.py`, `settings.json`, `historique_whatsapp.md`, `tests_manuels.md` modifiés hors cette session. Ne pas les committer depuis discord.
- `gateway/state.json` : `pending_replies` vide (constaté 2026-09-03 en fin de session). Aucune réponse Marie en attente d'appariement.
- Bot Discord : lu actif au début de session (PID 79532, `queue.json` idle) ; non revérifié en fin de session.
- Veille `/discord_loop` : `discord_loop.py wait` prend un timeout ; boucle en `run_in_background` avec `wait 3600`.
- Décision Morphéus 2026-09-02 : canal Marie = Discord via gateway (ROBERTO = secours/vocal) ; identité « Rayonne Toi » (id 1368654289584656394) = Marie.
- Presse-papier inaccessible depuis les sessions Claude Code de ce poste : livrer les messages via fichier.
- queue.json / commands.json gitignorés dans discord_com (état runtime du bot).

## Dernière session (2026-09-03, 2e du jour)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

### Décisions prises
- Créer `gateway/STYLE.md` : guide de forme des messages Discord sortants, un bloc par destinataire, relu avant chaque `approve`. Ne touche jamais au fond (question, options, faits, chiffres, liens).
- Identité sortante = « El Patrone », jamais « Claude » / « Claude Code » — contrainte commune à tous les destinataires.
- Ouverture imposée : Marie → « Salut Poulette ! » ; Morphéus → « Salut ma poule ! ». Divergence assumée avec CLAUDE.md § Messages pour Marie (« pas de salutation ») : STYLE.md prime sur la forme, CLAUDE.md reste la référence du fond.
- Aucun emoji dans le corps des messages (encadrement `💻🤖` + tag Marie exceptés, posés par la gateway).

### Livrables produits ou modifiés
- `DISCORD/discord_com/gateway/STYLE.md` : créé. Préambule + préséance, contraintes communes, `marie` (complet), `morpheus` et `channel` (valeurs par défaut, à compléter).
- `DISCORD/discord_com/gateway/LOOP.md` : § 1 — relecture STYLE.md obligatoire avant `approve`.
- `.claude/commands/discord_loop.md` : étape 3a-bis — même consigne (NON COMMITÉ, voir Contexte chaud).

### Hypothèses validées / invalidées
- EN ATTENTE : sections `morpheus` et `channel` de STYLE.md à compléter par Morphéus — non bloquant, valeurs par défaut en place.
- EN ATTENTE (report) : aller-retour Discord réel Marie via la gateway (drain + réponse routée) — toujours non exercé.

### Activité `/discord_loop` de la session
- Livraison v5.84 → Marie : jugée, `approve`, partie via `bot.py`.
- 1 entrant Marie capté via @-mention (précision #32 « rubrique accessibilité uniquement ») : re-routé `inbox/orchestrateur/`, consigné dans `historique_whatsapp.md`, commité `72bc468`.

### Prochaine étape exacte
Compléter `morpheus` / `channel` dans STYLE.md avec les réponses de Morphéus, puis appliquer STYLE.md à la prochaine demande outbox au prochain `/discord_loop`.

### Question bloquante pour la session suivante
Aucune.
