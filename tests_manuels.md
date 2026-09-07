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

## Import invalide et rechargement

- Depuis « Export et import des données », sélectionner un JSON contenant une version future ou une liste invalide.
- Confirmer le remplacement : l’erreur apparaît et le bouton redevient disponible.
- Recharger l’application : les données présentes avant la tentative sont intactes.

## Horizon d'une série récurrente

- Créer une tâche quotidienne récurrente planifiée le 06/09/2026, sans fin.
- Dans le planning, vérifier les occurrences du 06/09/2026 au 05/12/2026 incluses, et l'absence d'occurrence le 06/12/2026.

## Opérations de série atomiques (Phase 5)

- Créer une tâche récurrente planifiée, puis depuis une occurrence : modifier un champ « pour toute la série », puis supprimer « toutes les occurrences ».
- Après chaque geste, vérifier dans le planning qu'il ne reste ni occurrence partielle ni série incohérente, et que la règle de récurrence n'est pas orpheline (aucune tâche fantôme, recharger l'appli).
- Contrôle console (facultatif) : `indexedDB` → store `taskRecurrences` ne contient aucune règle sans occurrence après la suppression de série.

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

## Bornage des requêtes réseau et reprise après coupure (Phase 6)

- Avec un backend de synchronisation configuré, couper le réseau (DevTools > Network > Offline
  ou coupure système) puis déclencher un envoi de retour annoté.
- Vérifier que la tentative se règle d'elle-même après ~30 s (délai `DEFAULT_NETWORK_TIMEOUT_MS`)
  sans figer l'application : le retour passe en « Échec d'envoi », l'appli reste réactive.
- Rétablir le réseau, relancer l'envoi : le retour part sans doublon (l'image déjà déposée n'est
  pas renvoyée) et passe en « Envoyé ».
- Contrôle console (facultatif) : aucune requête `fetch` vers `/rest/v1/rpc/` ou
  `/storage/v1/object/feedback/` ne reste « pending » indéfiniment après la coupure.

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
