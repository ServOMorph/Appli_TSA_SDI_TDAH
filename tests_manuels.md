# Tests manuels développeur en attente

File d'attente des contrôles manuels non validés, réservés au développeur (fichiers locaux,
détails d'implémentation, régressions de protocole). Après validation d'un test, supprimer
immédiatement sa section. Quand la file est vide, vider intégralement ce fichier.

Un titre de section marqué `[discord-auto]` désigne un test dont la condition se vérifie
d'elle-même au fil de l'usage normal de `/discord_loop`, sans que quiconque ait besoin de la
provoquer — la session `discord` le valide et supprime la section dès qu'elle observe la
condition décrite (`.claude/commands/discord_loop.md` § Tests manuels délégués). Un sous-point
annoté « (hors délégation, à provoquer manuellement) » à l'intérieur d'une section `[discord-auto]`
reste un test dev classique, jamais validé passivement. Ajouter un futur test `[discord-auto]` ne
demande d'éditer que ce fichier — jamais `discord_loop.md`.

## Hook `on_start.md` discord enrichi (3 points) [discord-auto]

Ajouté le 2026-09-07 (commit `3846793`, enrichissement du hook). Non encore observé en conditions
réelles. Se valide au prochain `/start discord`, sans provocation manuelle.

À observer :
- `bot_manager.py restart` : arrêt puis relance effective de `bot.py` (ou message non bloquant si
  `enabled: false` / échec de démarrage) ;
- détection d'un éventuel process `discord_loop.py wait` orphelin d'une session précédente et son
  arrêt (aucun faux positif sur la session courante) ;
- résumé de l'outbox `to == marie` affiché avant l'enchaînement de la boucle (nombre de `pending`
  et `held`, motifs de `hold`).

## Bornage des requêtes réseau et reprise après coupure (Phase 6) — à porter au catalogue in-app

Pas testable en dev (aucun backend de synchronisation configuré localement). À convertir en
parcours du catalogue in-app (`src/domain/data/manualTestsCatalog.ts`) au prochain `/deploy`,
regroupé avec la question ouverte [P1] « Marie confirme-t-elle que "Relancer" fait passer ses
retours en "Envoyé" ? » (`_contexte/signals.md`). Comportement à faire valider par Marie :
- couper le réseau (mode avion), déclencher un envoi de retour annoté : la tentative se règle
  d'elle-même après ~30 s sans figer l'appli, le retour passe « Échec d'envoi » ;
- rétablir le réseau, relancer : le retour part sans doublon (image déjà déposée non renvoyée)
  et passe « Envoyé ».

## Bot Discord — file d'attente des commandes en conditions réelles [discord-auto]

Ajouté le 2026-09-02 (commit `2b75711`). `bot.py` empile désormais dans `commands.json` → `queue[]`
tout message reçu pendant que Claude traite déjà une commande, et `boucle_polling` promeut la file
en FIFO dès le retour à `idle`. Testé seulement en isolation (script hors ligne), pas encore avec
le vrai bot et Discord.

À observer au fil de l'usage de `/discord_loop` :
- 2-3 messages reçus pendant un traitement en cours → chacun reçoit « 📥 En file d'attente (N) »,
  aucun n'est rejeté ; à la fin du traitement, repris un par un dans l'ordre d'arrivée, avec le bon
  auteur affiché (`[RESTREINT Rayonne Toi]` / `[ADMIN …]`) ;
- `!ping` / `!help` répondent toujours immédiatement même file non vide ;
- cas dégradé (hors délégation, à provoquer manuellement) : tuer la session pendant un traitement
  → `commands.json` reste en `processing`, la file se remplit sans être promue (angle mort connu,
  cf. question ouverte P3 de `signals.md`).
