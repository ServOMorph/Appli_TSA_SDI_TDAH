# Gouvernance des communications Discord

Statut : actuel
Dernier contrôle : 2026-09-16
Sources : `.claude/CLAUDE.md`, `DISCORD/discord_com/gateway/README.md`

## Contexte

Les communications sortantes ne doivent pas contourner le circuit de revue de la gateway. Les
messages peuvent contenir des demandes produit ou des retours testeurs ; leur fond doit donc être
arrêté avant l'envoi.

## Décision

Toute communication Discord passe par la gateway. Un agent dépose une demande ; l'agent DISCORD
la relit et décide de l'approuver, de la différer, de la renvoyer à son auteur ou de la fusionner.
Seules les demandes approuvées sont envoyées par `bot.py`. Le mode urgent reste une exception
explicite lorsque le circuit normal est bloqué et que le message ne peut pas attendre.

Les messages destinés à Marie sont préparés avec un fond définitif, synthétique et non technique.
La mise en forme, l'encadrement et le tag sont appliqués par le circuit Discord, sans modifier ce
fond.

## Options écartées

- Appeler directement l'API, un webhook ou le client Discord.
- Écrire directement dans les fichiers internes de file d'attente.
- Lancer manuellement le drain normal de la gateway.
- Employer le mode urgent comme procédure courante.

## Conséquences

- Un message normal peut rester en attente de revue avant son envoi.
- Une réponse attendue est lue puis acquittée par l'agent concerné ; elle n'est pas traitée
  automatiquement par l'orchestrateur.
- Les procédures pratiques sont détaillées dans le [guide de la gateway](../20_guides/gateway_discord.md).

## Date et source de l'arbitrage

Règles consignées dans les instructions projet et le protocole de la gateway, dont les décisions
datées du 2026-09-02 au 2026-09-12 sont reprises dans ces sources.
