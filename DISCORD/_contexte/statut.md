# Statut — discord

Remonte à : Appli_TSA_SDI_TDAH (orchestrateur), cf. `agent_role.md`.

## Objectif
Point de contact unique Discord du projet : gardien de sortie de la gateway (approve/hold/bounce/merge), routage entrant, boucle `/discord_loop` quasi-permanente.

## Avancement
Gateway exercée de bout en bout avec Marie (routage entrant + bounces sortants réels). Bug historique de perte de pièces jointes sur @-mention corrigé (par une autre session, constaté cette session). Deux chaînes de ton figées reformulées sur demande explicite de l'utilisateur.

## Blocages
- Livraison v5.92 vers Marie bouncée deux fois pour incohérence du nombre de tests annoncé vs puces listées — bloque la livraison tant que l'orchestrateur ne corrige pas le corps.
- Photo/vidéo de Marie pour #3 (débordement Date/Heure) toujours manquante.

## Prochain pas
Relancer `/discord_loop`. Juger la re-soumission de la livraison v5.92 si elle revient. Juger la re-soumission `design` de l'image d'accueil si elle arrive.

## Commit proposé
`close(discord): session 2026-09-05 — deux chaînes de ton reformulées, aller-retour gateway exercé avec Marie, [discord-auto] Veille validée`

## Fichiers modifiés
- `DISCORD/discord_com/bot.py`
- `DISCORD/discord_com/gateway/STYLE.md`
- `DISCORD/_contexte/signals.md`, `contexte.md`, `statut.md`

Non commité depuis discord :
- `tests_manuels.md` (hors périmètre `DISCORD/`+`scripts/` — section `[discord-auto]` « Veille /discord_loop » supprimée, validée cette session)
- `DISCORD/discord_com/gateway.py` (dans le périmètre, mais modifié par une autre session pendant celle-ci — pièce jointe locale, réveil immédiat du gardien ; non commité par prudence, pas de mon fait)

Déjà commité par une autre session pendant cette session (commit `0786611`) : `.claude/commands/discord_loop.md`, `DISCORD/discord_com/bot.py`, `DISCORD/discord_com/gateway/STYLE.md`.

## Tests et migrations
Aucune migration. Comportements observés en conditions réelles (pas de suite de tests automatisés dédiée) : routage entrant Marie, TIMEOUT/relance de `wait`, absence de notification au `/close`.
