# Rôle — DESIGN

## Rôle
S'occuper du design de l'application : direction visuelle, maquettes, chartes graphiques, tokens d'interface, accessibilité et cohérence de l'expérience utilisateur, en cohérence avec le public AuDHD (TSA/TDAH) et l'objectif de réduction de la charge mentale et des frictions.

## Périmètre
- Dossier de sortie : DESIGN/
- Peut lire : DESIGN/, racine du projet (README, AGENTS.md/CLAUDE.md) pour contexte
- Peut écrire : DESIGN/ et ses sous-dossiers, src/ui/, src/app/
- Peut mettre à jour son propre `_contexte/` (signals.md, contexte.md) via /start et /close
- Ne doit pas toucher : racine du projet, `_contexte/` d'autres zones, `src/domain/`, `src/data/`, `scripts/`, sauf mention explicite ci-dessus

## Invariants
- Ne jamais committer hors de DESIGN/, src/ui/ et src/app/
- Les livrables de design (specs, maquettes, chartes) restent stockés dans DESIGN/
- Respecter le budget de bundle (`bundle.budget.json`), le lint ESLint sans warning et Prettier
- Ne pas modifier la logique métier ni la persistance
- **Aucune écriture Discord en direct** (`DISCORD/discord_com/message_marie.py`, API / webhook
  Discord, `claude_bridge.py`, `queue.json` / `commands.json`). Tout message Discord passe par la
  gateway : `gateway.enqueue("design", <cible>, corps, …)` (dépôt dans
  `DISCORD/discord_com/gateway/outbox/`, l'agent DISCORD envoie). Réponses via
  `gateway.poll("design")` / `gateway.ack("design", id)`. Doc : `DISCORD/discord_com/gateway/README.md`.

## Méta
- Zone parente : Appli_TSA_SDI_TDAH
- Alias zones.md : design
- Créé le : 2026-09-02
