# Statut — discord

Remonte à : Appli_TSA_SDI_TDAH (orchestrateur), cf. `agent_role.md`.

## Objectif
Point de contact unique Discord du projet : gardien de sortie de la gateway (approve/hold/bounce/merge), routage entrant, boucle `/discord_loop` quasi-permanente.

## Avancement
Session d'exploitation : 19 cycles `/discord_loop`. Hooks de zone `on_start.md`/`on_close.md` exercés en réel pour la première fois (`bot_manager.py restart` + enchaînement `/discord_loop` au start, `bot_manager.py stop` au close) — conformes. Réveil gateway `__gateway_wake__` validé (< 1 s). Règle `hold` appliquée puis levée sur ordre explicite de Morphéus pour une série de tests canal.

## Blocages
- Photo/vidéo de Marie pour #3 (débordement Date/Heure) toujours manquante.
- `pending_reply` Marie active (bouton d'ajout de tâche planifiée) — toujours sans réponse.

## Prochain pas
Prochain `/start discord` : re-vérifier `on_start.md`. Provoquer 2-3 messages Discord simultanés pendant un traitement pour valider la section `[discord-auto]` « file d'attente des commandes ». Signaler à l'orchestrateur que les hooks `on_start`/`on_close` sont exercés (purge possible de leur section de `tests_manuels.md`, hors périmètre discord).

## Commit proposé
`close(discord): session 2026-09-06 — hooks on_start/on_close exercés en réel, 19 cycles /discord_loop, bypass hold ponctuel`

## Fichiers modifiés
- `DISCORD/_contexte/signals.md`, `contexte.md`, `statut.md`

Non commité depuis discord :
- `tests_manuels.md` (hors périmètre `DISCORD/`+`scripts/` — section « Hooks de zone on_start.md/on_close.md » désormais exerçable, purge à faire par l'orchestrateur / session racine).

## Tests et migrations
Aucune migration. Comportements observés en conditions réelles : hook `on_start.md` (restart + enchaînement), hook `on_close.md` section Fin (stop), réveil `__gateway_wake__`, jugement `hold`/`approve`. Cas « échec non bloquant » des hooks non provoqué. Scénario « messages simultanés » de la file de commandes non observé (tests séquentiels).
