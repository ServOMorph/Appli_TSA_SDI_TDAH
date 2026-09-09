# Hooks /close — zone discord

## Fin

Exécuter dans l'ordre. Chaque étape est non bloquante : en cas d'échec, l'afficher en une ligne
et passer à la suivante. L'ordre compte — le message de pause a besoin de `bot.py` vivant.

### 1. Message de pause sur le canal de supervision

Seulement si `bot.py` tourne encore (c'est lui qui poste `queue.json` sur Discord) :
```bash
python DISCORD/discord_com/bot_manager.py status
```
- Exit 0 (`[OK] bot.py actif`) :
  ```bash
  python DISCORD/discord_com/discord_loop.py send "J'en ai plein le c... je vais me faire un café et je reviens"
  ```
  `send` attend jusqu'à 10 s que `bot.py` prenne le message avant de rendre la main : ne pas
  passer à l'étape 2 avant qu'il ait rendu.
- Exit 1 (`bot.py inactif`) : sauter cette étape. Ne rien déposer dans `queue.json`, sinon le
  message partirait au prochain démarrage de `bot.py`.

Le message part sur `config_bot_discord.json > channel_id`, égal au canal de supervision tant que
la fusion `channel_id == channels.supervision` tient (décision Morphéus 2026-09-08). Si un
`#supervision` distinct est créé un jour, cette étape et l'étape 3e de `discord_loop.md` devront
cibler `channels.supervision` explicitement (`queue.json` ne porte pas de canal aujourd'hui).
Chaîne figée, identique au message d'arrêt `stop` (`gateway/STYLE.md` § channel).

### 2. Arrêt du process `discord_loop.py wait`

Si la tâche de fond `discord_loop.py wait` est encore suivie par la session courante : l'arrêter
via `TaskStop`. Puis, par sécurité (orphelin non suivi), le tuer par ligne de commande
(PowerShell, Windows-safe) :
```powershell
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match 'discord_loop\.py.*wait' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### 3. Arrêt de `bot.py`

```bash
python DISCORD/discord_com/bot_manager.py stop
```
Non bloquant en cas d'échec (bot déjà arrêté).
