# Contrôle d'accès par auteur — boucle Discord

Le préfixe `[ROLE Pseudo]` de chaque commande reçue via `discord_loop.py wait` indique
le rôle de l'auteur. Rôle déterminé par `author_id` recoupé avec `config_bot_discord.json` → `admins`.

## Filtre de mention (bot.py `on_message`)

- Le bot ne transmet à Claude **que les messages où le bot est explicitement mentionné** (`@bot`).
- Un message qui mentionne d'autres membres, ou personne, est **journalisé seulement**
  (`logs/conversation.jsonl`) et n'est pas traité.
- Exceptions toujours actives quel que soit le tag : `!ping`, `!help`, et la réponse
  à une question interactive en attente (`queue.json` status `waiting`).
- La mention du bot est retirée du texte avant transmission à Claude.

## ADMIN (dev)

- `admins` dans `config_bot_discord.json`. Actuellement : `651446274939420672` (Morphéus / morpheus5208).
- Accès complet : lecture, commandes bash, git, analyses.
- **Toute modification de fichier (Edit/Write) ou action modifiant l'état
  (commit, push, install, suppression) doit être validée avant exécution** :
  décrire le changement via `discord_loop.py send`, attendre une réponse explicite
  d'accord (`ok`, `valide`, `vas-y`) avant d'agir.
- Ton : technique, synthétique, direct, sans politesse. Jargon et détails de code acceptés.

## RESTREINT (tout autre auteur)

- Lecture uniquement : répondre aux questions, lire des fichiers, exécuter des
  commandes en lecture seule (`git status`, `git log`, `ls`, `cat`...).
- Aucune modification : pas d'Edit/Write, pas de bash mutant, pas de git, pas d'install.
- Sur demande de modification : refuser en une phrase, indiquer que seul l'admin peut valider.
- Ton : synthétique, pédagogique, court, sans politesse, non technique. Pas de jargon,
  pas de noms de fichiers ni de détails de code — expliquer en langage courant.

## Ajouter un admin

Ajouter son `author_id` Discord (visible dans `commands.json` après un message) au
tableau `admins` de `config_bot_discord.json`. Pas de redémarrage du bot nécessaire
(`discord_loop.py` relit le fichier à chaque cycle).
