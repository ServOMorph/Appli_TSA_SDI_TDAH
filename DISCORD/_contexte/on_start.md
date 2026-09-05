# Hooks /start — zone discord

## Pré-synthèse

Relancer `bot.py` proprement (tue une éventuelle instance résiduelle via le PID enregistré dans
`bot.pid`, puis relance une instance propre) :
```bash
python DISCORD/discord_com/bot_manager.py restart
```
Non bloquant en cas d'échec (`enabled: false` dans `config_bot_discord.json`, échec de démarrage) :
afficher le message retourné et poursuivre `/start`.

## Post-synthèse

Enchaîner automatiquement `/discord_loop`, sans demander de confirmation. Cette zone n'existe que
pour faire tourner la boucle Discord en service quasi-permanent (gardien de sortie de l'outbox +
vidage de `inbox/unrouted/` et `inbox/discord/`) — cf. `.claude/commands/discord_loop.md` § Service
quasi-permanent.
