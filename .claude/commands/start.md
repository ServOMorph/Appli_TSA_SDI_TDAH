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

2. Vérifier que `<dossier>/_contexte/signals.md` et `<dossier>/_contexte/contexte.md` existent.
   Si absents : proposer d'initialiser la structure `_contexte/` pour cette zone (créer
   `contexte.md` et `signals.md` vides) et s'arrêter.

2b. Si `<dossier>/agent_role.md` existe : le charger et l'afficher intégralement,
    avant `signals.md`. Ce fichier n'existe que pour les zones-agents ; une zone
    racine classique n'en a pas.

2c. Si `<dossier>/_contexte/memory.md` existe : le charger (mémoire propre à cette
    zone, écrite via `/create_memory <alias_zone> <contenu>`).

3. Charger dans l'ordre :
   1. `_contexte/signals.md` — actions ouvertes, blocages, dernière session (priorité absolue)
   2. `_contexte/contexte.md` — contexte stable
   3. `roadmap*.md` — si un fichier correspondant existe dans `<dossier>`, le charger

   > **Économie tokens :** si `signals.md` suffit à répondre à la question immédiate,
   > `contexte.md` peut être chargé à la demande plutôt que systématiquement.
   > En cas de doute : le charger.

3-bis. **Hook de zone — Pré-synthèse.** Si `<dossier>/_contexte/on_start.md` existe : le charger et
   exécuter les instructions de sa section « Pré-synthèse » si elle est présente. Rien à faire si le
   fichier est absent ou si cette section n'y figure pas. Non bloquant : en cas d'échec d'une
   commande du hook, le signaler en une ligne et poursuivre `/start`. Contrat des sections :
   `on_start_TEMPLATE.md` du kit.

4. Afficher le contenu intégral de `signals.md` (sans résumé ni reformulation).

4b. Pour chaque action listée dans `signals.md` qui contient un champ `réf:`, lire les fichiers
    référencés avant d'afficher la synthèse. Si une action semble ambiguë mais qu'une `réf:` existe,
    lire la référence en priorité plutôt que de demander des précisions.

    Ajouter ensuite, à partir des autres fichiers chargés : la phase en cours si roadmap active,
    et le point d'attention immédiat.

5. Afficher en fin de réponse : 🎉🎉🎉

5-bis. **Hook de zone — Post-synthèse.** Si `<dossier>/_contexte/on_start.md` existe et contient une
   section « Post-synthèse » : l'exécuter maintenant, juste après l'affichage de l'étape 5. Rien à
   faire sinon. Non bloquant. Un hook Post-synthèse peut légitimement ne pas rendre la main
   (enchaînement d'une autre commande) — c'est permis.

<!-- SPECIFICITES PROJET : DEBUT (préservé par /update, ne pas toucher hors de ce bloc) -->
<!-- Convention : toute règle liée à une étape précise de la Procédure ci-dessus doit la
     référencer explicitement par son numéro (ex: "Étape 3 : ..."), plutôt que compter sur la
     position physique de cette zone (toujours en fin de fichier). -->

## Substitution `<contexte>` (branches Git)

Ce projet travaille sur plusieurs branches à contextes distincts. **Avant l'étape 2**, identifier
la branche courante et son écart avec `main` :
```bash
git branch --show-current
git rev-list --left-right --count main...HEAD
git status --short
```
Définir `<contexte>` :
- Sur `main` : `<dossier>/_contexte`.
- Sur `sync-marie` : `<dossier>/_contexte/branches/sync-marie`. Afficher systématiquement les deux
  compteurs de divergence. Si le premier (commits de `main` absents de `sync-marie`) est non nul,
  signaler qu'une intégration contrôlée de `main` est requise avant tout travail fusionnable ou
  déployable ; ne jamais la lancer automatiquement.
- Sur une branche `agent/<alias>` correspondant à un alias de `.claude/zones.md` (casse ignorée) :
  `<dossier>/_contexte`, afficher l'écart avec `main`, appliquer le rôle de l'agent. Branche
  isolée : ne pas fusionner, rebaser, déployer ni modifier `main`.
- Sur toute autre branche : afficher la branche et son écart avec `main`, puis demander la règle de
  périmètre applicable avant de charger un contexte.

**Étapes 2, 2c, 3, 4** : partout où une étape lit `signals.md`, `contexte.md` ou `memory.md` de la
zone (corps générique : sous `<dossier>/_contexte/` ou `_contexte/`), lire ces fichiers sous
`<contexte>/`. Sur `main`, `<contexte>` = `<dossier>/_contexte` : comportement identique au
générique.

## Politique des branches

- `main` est la seule branche autorisée pour les évolutions produit générales, les retours et
  tests de Marie, `CHANGELOG.md`, `WHATS_NEW`, `manualTestsCatalog.ts` et tout déploiement.
- Une branche `agent/<alias>` correspondant à une zone déclarée dans `.claude/zones.md` peut contenir un travail isolé
  strictement limité à son `agent_role.md`. Elle ne modifie jamais directement `main`, ne
  déclenche aucun déploiement et n'est intégrée qu'après validation explicite de l'utilisateur.
- `sync-marie` est réservée à l'authentification sécurisée, Supabase et la synchronisation. Elle
  ne doit pas déclencher `/deploy` ni modifier les artefacts de release ou de tests de Marie.
- Une intégration de `main` dans `sync-marie` est une opération explicite, jamais implicite dans
  `/start` ou `/close`.

## Spécificités projet

- Étape 2b (après) : si `<dossier>/_contexte/messages.processing.md` existe, l'afficher (message
  déjà pris en charge, à ne pas perdre). Puis, si `<dossier>/_contexte/messages.md` existe, le
  renommer atomiquement en `messages.processing.md`, afficher son contenu, et ne supprimer le
  fichier de traitement qu'après traitement effectif. Le parent écrit les nouveaux messages dans un
  fichier temporaire du même dossier avant renommage en `messages.md` ; lui seul écrit directement
  ce fichier.
- Étape 4 (avant l'affichage) : **relevé de l'`inbox` gateway.** Le nom de zone résolu est le nom
  d'agent de la gateway Discord (registre `DISCORD/discord_com/gateway/agents.json`).
  - Zones `design` et `discord` :
    ```bash
    python DISCORD/discord_com/gateway.py poll --zone <zone résolue> --format hook
    ```
    Sortie ≠ `RIEN` : afficher les messages en attente et les traiter dans la session (puis
    `ack --agent <zone> --id <id>` chacun).
  - Zone racine (`Appli_TSA_SDI_TDAH`) : même commande (`poll --agent orchestrateur --format hook`),
    mais **visibility-only** — afficher le résultat dans la synthèse de l'étape 4b, sans jamais le
    traiter ni l'`ack` automatiquement. Traiter une réponse `--expect-reply` reste une décision
    explicite de l'utilisateur (`gateway.py poll --agent orchestrateur` puis `ack`).
  Non bloquant : gateway absente ou zone hors registre → sortie vide, poursuivre.
- Étape 4b (ajout) : pour une zone racine ou coordinatrice, agréger les `_contexte/statut.md` des
  agents dont `agent_role.md` déclare cette zone comme parent, ainsi que les équipes dont `team.md`
  déclare cette zone comme coordinateur. Les remonter séparément : aucune consigne ne contourne le
  coordinateur.
- Étape 4b, zone racine uniquement : si `tests_manuels.md` existe et n'est pas vide, le lire et
  l'inclure dans la synthèse (contrôles dev en attente). Objectif : ne jamais perdre de vue ce qui a
  été validé passivement par la session `discord` entre deux `/start` — une section `[discord-auto]`
  disparue depuis la dernière session signale un test délégué validé (cf.
  `.claude/commands/discord_loop.md` § 3d-bis). Ne pas recréer une section déjà supprimée par
  `discord` : lire l'état actuel du fichier comme source de vérité, jamais la mémoire de session.
- Étapes 3-bis/5-bis : le contenu des hooks de zone `discord` et racine (relance/arrêt de `bot.py`,
  enchaînement `/discord_loop`, snapshot Supabase) vit dans `DISCORD/_contexte/on_start.md` et
  `_contexte/on_start.md` de la racine, pas ici.
<!-- SPECIFICITES PROJET : FIN -->
