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
   - Sur toute autre branche : afficher la branche et son écart avec `main`, puis demander la
     règle de périmètre applicable avant de charger un contexte.

3. Vérifier que `<contexte>/signals.md` et `<contexte>/contexte.md` existent.
   Si absents : proposer d'initialiser la structure `_contexte/` pour cette zone (créer
   `contexte.md` et `signals.md` vides) et s'arrêter.

3b. Si `<dossier>/agent_role.md` existe : le charger et l'afficher intégralement,
    avant `signals.md`. Ce fichier n'existe que pour les zones-agents ; une zone
    racine classique n'en a pas.

4. Charger dans l'ordre :
   1. `<contexte>/signals.md` — actions ouvertes, blocages, dernière session (priorité absolue)
   2. `<contexte>/contexte.md` — contexte stable
   3. `roadmap*.md` — si un fichier correspondant existe dans `<dossier>`, le charger

   > **Économie tokens :** si `signals.md` suffit à répondre à la question immédiate,
   > `contexte.md` peut être chargé à la demande plutôt que systématiquement.
   > En cas de doute : le charger.

5. Afficher le contenu intégral de `signals.md` (sans résumé ni reformulation).

5b. Pour chaque action listée dans `signals.md` qui contient un champ `réf:`, lire les fichiers
    référencés avant d'afficher la synthèse. Si une action semble ambiguë mais qu'une `réf:` existe,
    lire la référence en priorité plutôt que de demander des précisions.

    Ajouter ensuite, à partir des autres fichiers chargés : la phase en cours si roadmap active,
    et le point d'attention immédiat.

6. Afficher en fin de réponse : 🎉🎉🎉

<!-- SPECIFICITES PROJET : DEBUT (préservé par /update, ne pas toucher hors de ce bloc) -->
<!-- Convention : toute règle liée à une étape précise de la Procédure ci-dessus doit la
     référencer explicitement par son numéro (ex: "Étape 3 : ..."), plutôt que compter sur la
     position physique de cette zone (toujours en fin de fichier). -->

## Politique des branches

- `main` est la seule branche autorisée pour les évolutions produit générales, les retours et
  tests de Marie, `CHANGELOG.md`, `WHATS_NEW`, `manualTestsCatalog.ts` et tout déploiement.
- `sync-marie` est réservée à l'authentification sécurisée, Supabase et la synchronisation. Elle
  ne doit pas déclencher `/deploy` ni modifier les artefacts de release ou de tests de Marie.
- Une intégration de `main` dans `sync-marie` est une opération explicite, jamais implicite dans
  `/start` ou `/close`.

## Spécificités projet

- Étape 4 : si la zone résolue est `roberto`, charger en plus, après les fichiers de la zone,
  `_contexte/signals.md` et `_contexte/contexte.md` de la racine du projet (lecture seule).
<!-- SPECIFICITES PROJET : FIN -->
