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

## Post-synthèse

Enchaîner automatiquement `/discord_loop`, sans demander de confirmation. Cette zone n'existe que
pour faire tourner la boucle Discord en service quasi-permanent (gardien de sortie de l'outbox +
vidage de `inbox/unrouted/` et `inbox/discord/`) — cf. `.claude/commands/discord_loop.md` § Service
quasi-permanent.
