# Roadmap — Suivi systématique des modifications demandées par Marie

Source : demande utilisateur du 28 août 2026 (canal ROBERTO). Objectif : garantir qu'aucune
demande inscrite par Marie dans son Google Doc « Modifications » ne reste sans traitement ni
traçabilité.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.

## Constat

- `/analyser_googledoc` sait lire le Google Doc de Marie et détecte s'il a changé depuis la
  dernière distribution, mais rien ne force son exécution.
- Le seul suivi par demande vit dans les roadmaps `roadmap_demandes_marie_*` / `roadmap_retours_marie_*`,
  qui sont archivées une fois livrées : l'état consolidé « qu'a demandé Marie, où en est chaque point »
  se perd.
- `/deploy` étape 0 ne contrôle que les exports de données de Marie, jamais le Google Doc.

## Cible

1. Un registre durable `_contexte/marie_modifications_suivi.md` : une ligne par demande numérotée du
   Google Doc, avec son état (`livrée vX.Y` / `en attente` / `en cours <roadmap>` / `écartée : motif`)
   et la date de dernière revue. Indépendant des roadmaps, jamais archivé.
2. `/analyser_googledoc` réconcilie ce registre à chaque analyse.
3. Une étape commune « revue du Google Doc » : détecter si le Doc a changé depuis la dernière revue
   du registre, l'exporter, le relire et réconcilier le registre — puis s'arrêter pour présenter les
   nouveautés. Aucune création de roadmap ni décision produit dans cette étape : elles restent
   manuelles via `/analyser_googledoc`.
4. Cette étape commune est déclenchée à chaque traitement de données de Marie : `/deploy` étape 0
   **et** `/traiter_export_marie`. Sur `/deploy`, en plus : avertissement listé si des demandes
   `en attente` ne sont rattachées à aucune roadmap active ni décision tracée.

## Périmètre exclu

- Aucune modification de code applicatif.
- Aucun planificateur automatique (cron / routine) dans une première version — la cadence reste
  celle de `/deploy`, `/traiter_export_marie` et des invocations manuelles de `/analyser_googledoc`.
- L'étape commune ne crée ni ne modifie de roadmap et ne tranche aucune décision produit : elle
  détecte, relit et réconcilie le registre, puis rend la main.

## Ordre et dépendances

```
Phase 1 — Format du registre + peuplement initial
Phase 2 — Réconciliation du registre par /analyser_googledoc      (dépend de Phase 1)
Phase 3 — Étape commune « revue du Google Doc » câblée dans        (dépend de Phase 1 et 2)
          /deploy étape 0 et /traiter_export_marie
```

## Phase 1 — Format du registre et peuplement initial [ ]

- [ ] Définir le format de `_contexte/marie_modifications_suivi.md` : en-tête (URL du Google Doc,
      date de dernière revue), puis un tableau `Numéro | Catégorie | Demande (résumé court) | État | Revue le`.
      États autorisés : `livrée vX.Y`, `en attente`, `en cours <roadmap>`, `écartée : <motif>`.
- [ ] Exporter et lire le Google Doc actuel via `rclone` (procédure `/analyser_googledoc` étapes 1 et 4).
- [ ] Remplir une ligne par demande numérotée. Pour chaque `livrée`, citer le fichier et les lignes de
      code qui le prouvent (jamais `signals.md` / `contexte.md` seuls). Reporter les décisions non
      tranchées (#7, #11 et toute autre) en `en attente` avec renvoi vers la discussion existante.
- [ ] Renseigner la date de dernière revue = date de modification du Google Doc au moment de l'analyse.

Critère de sortie : le registre couvre l'intégralité des demandes numérotées du Google Doc ; chaque
état est justifié (preuve code pour les `livrée`, renvoi pour les `en attente`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Réconciliation du registre par /analyser_googledoc [ ]

- [ ] Ajouter à `.claude/commands/analyser_googledoc.md` une étape (après l'analyse des demandes) qui
      met à jour `_contexte/marie_modifications_suivi.md` : une ligne par demande du doc, état
      recalculé, date de revue mise à jour. Ne jamais supprimer une ligne existante — une demande
      retirée du doc passe à `écartée : retirée du Google Doc le AAAA-MM-JJ`.
- [ ] Documenter dans la commande que le registre est la source de vérité durable du suivi Marie, les
      roadmaps n'en étant qu'une vue de travail éphémère.
- [ ] Mettre à jour l'étape « Vérifier et rapporter » pour inclure le chemin du registre et le
      différentiel d'états.

Critère de sortie : une exécution de `/analyser_googledoc` sur le doc courant met à jour le registre
de façon cohérente, sans toucher au code applicatif ni aux données de Marie ; une seconde exécution
sans changement du doc est idempotente.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Étape commune « revue du Google Doc » câblée dans /deploy et /traiter_export_marie [ ]

- [ ] Rédiger la procédure commune « revue du Google Doc » (dans un fichier dédié réutilisable, par
      exemple `.claude/commands/_revue_googledoc.md`, ou une section citée par les deux commandes) :
      1. comparer la date de modification du Google Doc (procédure `/analyser_googledoc` étape 2) à la
         date de dernière revue du registre ;
      2. si le Doc n'a pas changé : le noter et rendre la main ;
      3. s'il a changé : l'exporter, le relire, réconcilier `_contexte/marie_modifications_suivi.md`
         (mêmes règles qu'en Phase 2 : jamais de suppression de ligne, états recalculés, date de revue
         mise à jour), puis présenter le différentiel d'états et s'arrêter. Ne créer aucune roadmap,
         ne trancher aucune décision.
- [ ] Câbler cette procédure dans `.claude/commands/traiter_export_marie.md` : l'exécuter juste après
      l'ingestion du journal de tests, avant le rapport final.
- [ ] Câbler cette procédure dans `.claude/commands/deploy.md` étape 0 : l'exécuter après le
      traitement des exports. En plus, ajouter un avertissement de type étape 4 (non bloquant seul,
      confirmation explicite requise) listant toute demande `en attente` du registre non rattachée à
      une roadmap active ni à une décision tracée.
- [ ] Ajuster la numérotation interne des sous-étapes et les renvois des deux commandes si nécessaire.

Critère de sortie : `/traiter_export_marie` et `/deploy` étape 0 déclenchent tous deux la revue du
Google Doc ; sur un Doc inchangé, la revue est silencieuse ; sur un Doc modifié, le registre est
réconcilié et la commande s'arrête pour présentation ; `/deploy` signale en plus les demandes
`en attente` orphelines avant le build. Vérification par simulation des trois cas.
