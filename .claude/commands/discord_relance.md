# Relance Discord — Reprise du service

Relance la boucle `discord_loop` et le bot Discord. Poste un message de reprise sur le canal de supervision.

## Utilisation

```
/discord_relance
```

## Processus

Équivalent aux étapes du hook `/start discord` (Post-synthèse) :

### Étape 1 : Relancer le bot

```bash
python DISCORD/discord_com/bot_manager.py restart
```

### Étape 2 : Tuer les processus orphelins `discord_loop`

```powershell
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match 'discord_loop\.py.*wait' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### Étape 3 : Poster le message de reprise

```bash
python DISCORD/discord_com/gateway.py enqueue --source discord --to morpheus \
  --kind info --text "Service Discord reprend."
```

### Étape 4 : Relancer la boucle `discord_loop`

```bash
python DISCORD/discord_com/discord_loop.py wait 3600
```

Lancer en tâche de fond avec `run_in_background: true`.

### Étape 5 : Confirmation utilisateur

Afficher : « Service Discord relancé. »

## Pour mettre en pause

Utiliser `/discord_pause`.
