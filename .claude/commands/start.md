---
description: Charge le contexte d'une zone en début de session
argument-hint: [zone]
model: haiku
---

# /start [zone]

## Zones valides et dossiers réels

Lire `.claude/zones.md` pour obtenir la table des alias → dossiers réels.


## Procédure

1. Lire l'argument fourni ($ARGUMENTS).
   - Si absent : utiliser le working directory courant comme dossier cible (zone implicite).
   - Si présent mais non reconnu dans la table ci-dessus :
     répondre "Erreur : zone inconnue. Zones valides : <liste des alias>"
     et s'arrêter.
   - Si présent et reconnu : résoudre le dossier via la table.

2. Identifier la branche Git courante et son écart avec `main` :
   ```bash
   git branch --show-current
   git rev-list --left-right --count main...HEAD
   git status --short
   ```
   - Sur `main` : définir `<contexte>` comme `<dossier>/_contexte`.
   - Sur `sync-marie` : définir `<contexte>` comme
     `<dossier>/_contexte/branches/sync-marie`. Afficher systématiquement les deux compteurs
     de divergence. Si le premier compteur (commits de `main` absents de `sync-marie`) est non
     nul, signaler explicitement qu'une intégration contrôlée de `main` est requise avant tout
     travail susceptible d'être fusionné ou déployé ; ne jamais la lancer automatiquement.
   - Sur une branche `agent/<alias>` déclarée dans `.claude/zones.md` : définir `<contexte>` comme
     `<dossier>/_contexte`, afficher l'écart avec `main` et appliquer le rôle de l'agent. Cette
     branche est isolée : ne pas fusionner, rebaser, déployer ni modifier `main`.
   - Sur toute autre branche : afficher la branche et son écart avec `main`, puis demander la
     règle de périmètre applicable avant de charger un contexte.

3. Vérifier que `<contexte>/signals.md` et `<contexte>/contexte.md` existent.
   Si absents : proposer d'initialiser la structure `_contexte/` pour cette zone (créer
   `contexte.md` et `signals.md` vides) et s'arrêter.

3b. Si `<dossier>/agent_role.md` existe : le charger et l'afficher intégralement,
    avant `signals.md`. Ce fichier n'existe que pour les zones-agents ; une zone
    racine classique n'en a pas.

3c. Si `<dossier>/_contexte/messages.processing.md` existe, l'afficher : c'est un message déjà
    pris en charge qui ne doit pas être perdu.

3d. Si `<dossier>/_contexte/messages.md` existe, le renommer atomiquement en
    `messages.processing.md`, afficher son contenu, puis supprimer le fichier de traitement
    seulement après traitement effectif. Le parent écrit les nouveaux messages dans un fichier
    temporaire du même dossier avant renommage en `messages.md` ; lui seul écrit directement ce
    fichier.

4. Charger dans l'ordre :
   1. `<contexte>/signals.md` — actions ouvertes, blocages, dernière session (priorité absolue)
   2. `<contexte>/contexte.md` — contexte stable
   3. `roadmap*.md` — si un fichier correspondant existe dans `<dossier>`, le charger

   > **Économie tokens :** si `signals.md` suffit à répondre à la question immédiate,
   > `contexte.md` peut être chargé à la demande plutôt que systématiquement.
   > En cas de doute : le charger.

4-bis. **Relevé de l'`inbox` gateway — zones `design` et `discord` uniquement.** Le nom de zone
   résolu est le nom d'agent de la gateway Discord (registre
   `DISCORD/discord_com/gateway/agents.json`). Si la zone résolue est `design` ou `discord` :
   ```bash
   python DISCORD/discord_com/gateway.py poll --zone <zone résolue> --format hook
   ```
   Si la sortie vaut autre chose que `RIEN` : afficher les messages en attente et les traiter
   dans la session (puis `ack --agent <zone> --id <id>` chacun). Étape non bloquante : gateway
   absente ou zone hors registre → sortie vide, poursuivre.
   **Zone racine (`Appli_TSA_SDI_TDAH`) : ne rien relever.** L'orchestrateur ne consulte
   `inbox/orchestrateur/` que sur demande explicite de l'utilisateur (`gateway.py poll --agent
   orchestrateur`). Toute la com Discord se gère dans la session `discord` / `/discord_loop`.

5. Afficher le contenu intégral de `signals.md` (sans résumé ni reformulation).

5b. Pour chaque action listée dans `signals.md` qui contient un champ `réf:`, lire les fichiers
    référencés avant d'afficher la synthèse. Si une action semble ambiguë mais qu'une `réf:` existe,
    lire la référence en priorité plutôt que de demander des précisions.

    Ajouter ensuite, à partir des autres fichiers chargés : la phase en cours si roadmap active,
    et le point d'attention immédiat.

5c. Pour une zone racine ou coordinatrice, agréger les `_contexte/statut.md` des agents dont
    `agent_role.md` déclare cette zone comme parent, ainsi que les équipes dont `team.md` déclare
    cette zone comme coordinateur. Les remonter séparément : aucune consigne ne contourne le
    coordinateur.

6. Afficher en fin de réponse : 🎉🎉🎉

<!-- SPECIFICITES PROJET : DEBUT (préservé par /update, ne pas toucher hors de ce bloc) -->
<!-- Convention : toute règle liée à une étape précise de la Procédure ci-dessus doit la
     référencer explicitement par son numéro (ex: "Étape 3 : ..."), plutôt que compter sur la
     position physique de cette zone (toujours en fin de fichier). -->

## Politique des branches

- `main` est la seule branche autorisée pour les évolutions produit générales, les retours et
  tests de Marie, `CHANGELOG.md`, `WHATS_NEW`, `manualTestsCatalog.ts` et tout déploiement.
- Une branche `agent/<alias>` déclarée dans `.claude/zones.md` peut contenir un travail isolé
  strictement limité à son `agent_role.md`. Elle ne modifie jamais directement `main`, ne
  déclenche aucun déploiement et n'est intégrée qu'après validation explicite de l'utilisateur.
- `sync-marie` est réservée à l'authentification sécurisée, Supabase et la synchronisation. Elle
  ne doit pas déclencher `/deploy` ni modifier les artefacts de release ou de tests de Marie.
- Une intégration de `main` dans `sync-marie` est une opération explicite, jamais implicite dans
  `/start` ou `/close`.

## Spécificités projet

- Étape 4 : si la zone résolue est `roberto`, charger en plus, après les fichiers de la zone,
  `_contexte/signals.md` et `_contexte/contexte.md` de la racine du projet (lecture seule).
- Étape 6 : si la zone résolue est `discord`, enchaîner automatiquement `/discord_loop` juste
  après l'affichage de la synthèse (`🎉🎉🎉`), sans demander de confirmation. Cette zone n'existe
  que pour faire tourner la boucle Discord en service quasi-permanent (gardien de sortie de
  l'outbox + vidage de `inbox/unrouted/` et `inbox/discord/`) — cf.
  `.claude/commands/discord_loop.md` § Service quasi-permanent.
- Étape 4 : si la zone résolue est la racine du projet (`Appli_TSA_SDI_TDAH`), lancer une
  sauvegarde du snapshot Supabase de Marie avant d'afficher la synthèse :
  `( set -a; . ./.env; set +a; python scripts/backup_marie_snapshot.py )`.
  Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne
  et poursuivre `/start`. Le script est idempotent (aucune réécriture si le snapshot courant est
  déjà sauvegardé) et écrit dans `donnees_marie/` (gitignoré). Ne jamais afficher le contenu de
  `.env`.
- Étape 4-5, zone racine uniquement : si `tests_manuels.md` existe et n'est pas vide, le lire et
  l'inclure dans la synthèse de l'étape 5 (contrôles dev en attente). Objectif : ne jamais perdre
  de vue ce qui a été validé passivement par la session `discord` entre deux `/start` — une
  section `[discord-auto]` qui a disparu depuis la dernière session signale un test délégué
  validé (cf. `.claude/commands/discord_loop.md` § 3d-bis). Ne pas recréer une section déjà
  supprimée par `discord` : lire l'état actuel du fichier comme source de vérité, jamais la
  mémoire de session.
<!-- SPECIFICITES PROJET : FIN -->
