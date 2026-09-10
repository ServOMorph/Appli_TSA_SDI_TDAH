# Hooks /start — zone discord

## Pré-synthèse

### 1. Bot Discord (`bot.py`)

Test/kill/relance déjà géré nativement par `bot_manager.py` (PID Windows-safe via `bot.pid` +
`tasklist`/`taskkill`) :
```bash
python DISCORD/discord_com/bot_manager.py restart
```
Non bloquant en cas d'échec (`enabled: false` dans `config_bot_discord.json`, échec de démarrage) :
afficher le message retourné et poursuivre `/start`.

### 2. Boucle `discord_loop` (process `discord_loop.py wait`)

Pas de PID file natif (ce process est lancé par Claude via le tool Bash `run_in_background`, pas
par un manager) : une session précédente fermée sans `/close`/`stop` peut laisser une instance
orpheline. Chercher par ligne de commande (PowerShell, Windows-safe) et tuer si trouvée :
```powershell
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match 'discord_loop\.py.*wait' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```
La relance (`discord_loop.py wait 3600` en tâche de fond) est faite par la boucle `/discord_loop`
elle-même (Post-synthèse ci-dessous) — ne pas la relancer ici.

### 3. Messages pour Marie (état de l'outbox)

Avant d'enchaîner la boucle, afficher un résumé de l'outbox filtré sur `to == marie` :
```bash
python DISCORD/discord_com/gateway.py list
```
Signaler dans la synthèse `/start` : nombre de messages `pending` et `held` vers Marie, avec leur
motif de `hold` s'il y en a. Ne pas les juger ici (le jugement de l'outbox — approve/hold/bounce —
reste l'étape 3a-bis de la boucle `/discord_loop`, pas de ce hook).

### 4. Messages de Marie non rejoués (angle mort du rattrapage)

Quand `bot.py` était hors service à la réception d'un message qui @-mentionne le bot (pas de
`pending_reply` en cours), `rattraper_messages_manques()` le journalise dans
`conversation.jsonl` mais ne le route vers aucune inbox (log serveur uniquement, perdu pour
la session). Après le restart de l'étape 1 (laisser le temps à `on_ready` de tourner — les
étapes 2 et 3 suffisent généralement), vérifier s'il en reste pour Marie :

```bash
python DISCORD/discord_com/marie_non_traites.py --dry-run
```

`"messages": []` → rien à faire, poursuivre normalement.

Sinon : les afficher intégralement (contenu + horodatage) **à la fin** de la synthèse `/start`,
juste avant `🎉🎉🎉`, et demander explicitement à l'utilisateur comment les traiter — ne pas
supposer une action. Ne relancer la commande sans `--dry-run` (qui marque les messages comme
signalés) qu'une fois l'utilisateur reçu et pris en compte cette liste ; tant que ce n'est pas
fait, ils doivent réapparaître à chaque `/start` suivant.

## Post-synthèse

S'il reste des messages de Marie non traités signalés à l'étape 4 sans réponse de l'utilisateur
sur la suite à leur donner, ne pas enchaîner : attendre sa réponse avant de continuer.

Sinon, enchaîner automatiquement `/discord_loop`, sans demander de confirmation. Cette zone
n'existe que pour faire tourner la boucle Discord en service quasi-permanent (gardien de sortie
de l'outbox + vidage de `inbox/unrouted/` et `inbox/discord/`) — cf.
`.claude/commands/discord_loop.md` § Service quasi-permanent.
