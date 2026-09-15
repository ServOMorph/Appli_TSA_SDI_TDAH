# Pause Discord — Arrêt du service

Arrête la boucle `discord_loop` et le bot Discord temporairement. Poste un message de pause sur le canal de supervision.

## Utilisation

```
/discord_pause
```

## Processus

### Étape 1 : Tuer la boucle `discord_loop`

```powershell
Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
  Where-Object { $_.CommandLine -match 'discord_loop\.py.*wait' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

### Étape 2 : Poster le message de pause

```bash
python DISCORD/discord_com/gateway.py enqueue --source discord --to morpheus \
  --kind info --text "Service Discord en pause."
```

### Étape 3 : Arrêter le bot

```bash
python DISCORD/discord_com/bot_manager.py stop
```

### Étape 4 : Confirmation utilisateur

Afficher : « Service Discord en pause. Relancez avec `/discord_relance` quand prêt. »

## Pour relancer

Utiliser `/discord_relance`.
