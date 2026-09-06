# Statut — discord

Remonte à : Appli_TSA_SDI_TDAH (orchestrateur), cf. `agent_role.md`.

## Objectif
Point de contact unique Discord du projet : gardien de sortie de la gateway (approve/hold/bounce/merge), routage entrant, boucle `/discord_loop` quasi-permanente.

## Avancement
2e session du 2026-09-06 : hook `on_start.md` (§ Pré-synthèse) enrichi de 3 points — test/kill/relance `bot.py` (déjà natif, pas de changement), détection/kill d'un process `discord_loop.py wait` orphelin (PowerShell WMI, pas de PID file natif pour ce process), résumé de l'outbox Marie affiché avant la boucle. Un message pour Marie (« Tests techniques terminés ») approuvé et envoyé sur demande explicite de l'utilisateur, malgré la `pending_reply` v5.92 active (bypass ponctuel, règle inchangée).

## Blocages
- Photo/vidéo de Marie pour #3 (débordement Date/Heure) toujours manquante.
- `pending_reply` Marie active (bouton d'ajout de tâche planifiée) — toujours sans réponse.

## Prochain pas
Prochain `/start discord` : vérifier les 3 points du hook enrichi (kill/relance `bot.py`, détection/kill `discord_loop` orphelin, résumé outbox Marie affiché). Provoquer 2-3 messages Discord simultanés pour valider la section `[discord-auto]` « file d'attente des commandes ».

## Commit proposé
`close(discord): session 2026-09-06 — hook on_start enrichi (bot.py/discord_loop/résumé outbox), 2e envoi Marie sur bypass hold`

## Fichiers modifiés
- `DISCORD/_contexte/on_start.md`, `signals.md`, `contexte.md`, `statut.md`, `archive_decisions.md`

Non commité depuis discord (hors périmètre `DISCORD/`+`scripts/`, à traiter par l'orchestrateur) :
- `CHANGELOG.md` : entrée à ajouter pour l'enrichissement du hook `on_start.md` (bot.py/discord_loop/résumé outbox) et le 2e bypass de la règle `hold`.
- `tests_manuels.md` : contrôle à ajouter — hook `on_start.md` enrichi non encore observé en conditions réelles (3 points, cf. § Avancement). Se valide naturellement au prochain `/start discord`, pas de provocation manuelle nécessaire — candidat `[discord-auto]`.

## Tests et migrations
Aucune migration. Comportements observés en conditions réelles : arrêt propre du process `discord_loop.py wait` en tâche de fond via `TaskStop` au `/close` (`commands.json` resté `idle`, aucun orphelin laissé par cette session), réveil `__gateway_wake__`, sortie `TIMEOUT`, jugement `hold`/`approve` de l'outbox. Hook `on_start.md` enrichi : non testé (prochain `/start discord`).
