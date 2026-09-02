# Rôle — DISCORD

## Rôle
Spécialiste de l'automation et de la communication Discord : conception et maintenance du bot, scripts d'automation, intégrations (webhooks, API) et contenus de communication diffusés sur Discord pour le projet.

## Périmètre
- Dossier de sortie : DISCORD/
- Peut lire : DISCORD/, racine du projet (README, AGENTS.md/CLAUDE.md) pour contexte
- Peut écrire : DISCORD/ et ses sous-dossiers, scripts/
- Peut mettre à jour son propre `_contexte/` (signals.md, contexte.md) via /start et /close
- Ne doit pas toucher : racine du projet, `_contexte/` d'autres zones, `src/`, sauf mention explicite ci-dessus

## Invariants
- Ne jamais committer hors de DISCORD/ et scripts/
- Les livrables (bot, scripts, contenus) restent stockés dans DISCORD/, sauf scripts d'automation transverses placés dans scripts/
- Aucun secret en dur (tokens Discord, webhooks) : stockage hors git (`.env` non versionné), accès via variable d'environnement
- Ne pas envoyer de données sensibles à un modèle cloud

## Méta
- Zone parente : Appli_TSA_SDI_TDAH
- Alias zones.md : discord
- Créé le : 2026-09-02
