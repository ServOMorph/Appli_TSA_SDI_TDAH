# Statut — discord

Remonte à : Appli_TSA_SDI_TDAH (orchestrateur), cf. `agent_role.md`.

## Objectif
Point de contact unique Discord du projet : gardien de sortie de la gateway (approve/hold/bounce/merge), routage entrant, boucle `/discord_loop` quasi-permanente.

## Avancement
Session 2026-09-09 / 2026-09-10 — purement opérationnelle, aucun livrable de code.
- Boucle `/discord_loop` en service (nombreux cycles `TIMEOUT` horaires nuit du 9 au 10, rien reçu).
- Jugement gardien : demande `20260909T100248_019203` (relance des 12 tests v5.92, orchestrateur -> marie, `kind: info`) -> `approve`. Contrôles : pas de doublon (dernière relance = 2026-09-01 / v5.69), version cohérente avec `_contexte/dernier_deploiement.md` (v5.92 / 2026-09-05), `state.json` = `pending_replies: []`. Deux retouches de forme STYLE.md § marie sans changement de fond (retrait « Relance : », « déployer » -> « mettre en ligne »). Envoyée par `bot.py` (Discord `1547194409135644723`, 2026-09-09 10:38 UTC).
- Réponse de Marie à la relance (« je les ai déjà fait ces tests... les tests n'apparaissent pas car déjà validé ») : relance sans `--expect-reply` -> tombée en commande `/discord_loop`, routée à la main vers `inbox/orchestrateur/20260909T160323_961174`, orchestrateur notifié.
- Correction d'un `wait` détaché par `&` (process orphelin PID 526) : tué, relancé seul en tâche de fond.

## Blocages
- `discord_member_id` de Satine non câblé (member_id provisoire = `MORPHEUS_USER_ID`, collision) — à faire quand elle rejoint le serveur.
- Photo/vidéo de Marie pour #3 (débordement Date/Heure) toujours manquante.
- Ingestion du snapshot v5.92 de Marie (~9 résultats de test non ingérés) — à la charge de l'orchestrateur (`/deploy` étape 0.4), pas de la zone discord.

## Prochain pas
Phase 5 passe 3 (brief `5079c0b`, décisions Morphéus) : `bot.py` `on_message` multi-canal + routage entrant PAR CANAL (contourne la collision) + balayage `inbox/testeurs/<code>/` dans `/discord_loop` + tests events mockés. Puis franchir le checkpoint `/compact` de la Phase 5.

## Commit proposé
`close(discord): session 2026-09-10 — relance v5.92 approuvée + réponse Marie routée (session opérationnelle)`

## Fichiers modifiés
- Session : aucun fichier versionné (`DISCORD/` et `scripts/` intacts).
- `/close` : `DISCORD/_contexte/` (signals, contexte, statut).

## Tests et migrations
Aucune migration, aucun test lancé (pas de code touché). Comportements observés en conditions réelles : réveil `__gateway_wake__`, sortie `TIMEOUT` répétée, jugement de l'outbox, routage manuel d'une réponse Marie non attendue, détachement d'un `wait` lancé via `&`.
