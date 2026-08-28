---
description: Analyse un Google Doc de demandes de Marie et l'intègre dans une roadmap existante ou nouvelle
argument-hint: [URL du Google Doc] [chemin optionnel de roadmap]
allowed-tools: Bash(rclone:*), Bash(pandoc:*), Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(rg:*), Bash(test:*), Bash(ls:*), Bash(find:*)
---

# /analyser_googledoc [URL] [roadmap]

## Google Doc de référence

`https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit?usp=sharing`

## Procédure

1. Localiser le Google Doc.
   - Si le premier argument est absent, utiliser le Google Doc de référence ci-dessus.
   - Extraire l'identifiant du document depuis l'URL (segment entre `/document/d/` et le `/` suivant).
   - Vérifier l'accès via le remote rclone dédié à ce projet :
     ```
     rclone backend copyid tsa_gdrive: <ID> <fichier temporaire>.txt --config .claude/rclone.conf --drive-export-formats txt
     ```
     En cas d'échec (accès refusé, ID invalide) : s'arrêter sans modifier de roadmap, signaler l'erreur précise.

2. Vérifier si le Google Doc est plus récent que la dernière distribution.
   - Identifier la dernière distribution dans `dist/` et relever sa date de modification.
   - Relever la date de modification du fichier temporaire exporté à l’étape 1 (rclone conserve la date de modification du Google Doc).
   - Si le Google Doc est antérieur ou égal à la dernière distribution : répondre « Aucun changement du Google Doc depuis la dernière distribution ; analyse arrêtée. » et s’arrêter sans lire le document ni modifier de roadmap.
   - Si le Google Doc est plus récent, poursuivre.

3. Déterminer la cible de planification.
   - Si un second argument est fourni, vérifier qu'il pointe vers une roadmap Markdown existante.
   - Sinon, demander explicitement : « Existe-t-il déjà une roadmap à compléter ? Si oui, indique son chemin ; sinon, confirme que je dois en créer une et donne son nom souhaité. »
   - Ne jamais créer ni modifier de roadmap avant cette réponse.

4. Lire le contenu exporté intégralement.
   - Le document est structuré selon les 7 catégories validées par Marie (`message_marie_categories_travail.md`) — regrouper chaque demande sous sa catégorie d'origine.
   - Relever chaque demande sans la reformuler de manière trompeuse : catégorie, comportement demandé, contraintes exprimées.
   - Signaler comme ambigu tout passage flou ou incomplet plutôt que de l'interpréter.

5. Analyser chaque demande par rapport au projet.
   - Consulter le code réel (jamais `signals.md`/`contexte.md` seuls — ces fichiers sont datés, pas courants), les tests, `CHANGELOG.md`, les roadmaps et l'historique Git nécessaires.
   - Classer chaque demande : déjà livrée, bug à reproduire, bug confirmé, évolution à concevoir, partiellement livrée, obsolète ou contradictoire avec une décision existante.
   - Ne jamais conclure « déjà livrée » sans avoir lu le code correspondant dans cette session ; citer le fichier et les lignes qui le prouvent.
   - Ne pas considérer une capture d'un ancien écran comme preuve que son modèle doit être réintroduit ; vérifier l'architecture actuelle et signaler l'écart.

6. Réconcilier le registre de suivi `_contexte/marie_modifications_suivi.md`.
   - Ce fichier est la **source de vérité durable** du suivi des demandes de Marie ; les roadmaps `roadmap_*marie*` n'en sont qu'une vue de travail éphémère, archivée après livraison. Le créer selon le format existant s'il est absent.
   - Pour chaque demande numérotée du Google Doc lu à l'étape 4 : créer sa ligne si absente, sinon recalculer son état à partir de l'analyse de l'étape 5. États autorisés : `livrée vX.Y` (avec la preuve code de l'étape 5), `en attente`, `en cours <roadmap>`, `écartée : <motif>`.
   - **Ne jamais supprimer une ligne existante.** Une demande qui a disparu du Google Doc passe à `écartée : retirée du Google Doc le AAAA-MM-JJ`, sans perdre son historique.
   - Mettre la colonne « Revue le » de chaque ligne touchée, ainsi que l'en-tête (« Dernière revue du Doc », « Dernière mise à jour de ce registre »), à la date de modification du Google Doc ; ajouter une ligne à « Historique des revues ».
   - Ne pas traiter ce registre comme une liste de tâches : il ne déclenche aucune écriture de code.

7. Mettre à jour la roadmap choisie ou en créer une, en respectant le format défini dans `CLAUDE.md` § Roadmap (une seule phase `[EN COURS]` à la fois, checkpoint `/compact` en fin de chaque phase, tests inclus dans la phase qui les motive).
   - Ajouter une section « Analyse du Google Doc » avec la traçabilité catégorie → demande → état → traitement.
   - Ajouter uniquement les demandes encore pertinentes sous forme de phases indépendantes, avec dépendances, fichiers pressentis, tests automatisés, test manuel et critère de sortie.
   - Isoler les décisions produit non tranchées dans une section dédiée ; ne pas les convertir en tâches de code.
   - Si une nouvelle roadmap est créée, indiquer la source (URL du Google Doc) et la date d'analyse.

8. File de communication pour Marie.
   - À chaque phase de la roadmap passée à `[FAIT]`, mettre à jour (ou créer) `COMMUNICATION/Marie/a_transmettre.md`.
   - Ce fichier est la source unique des **commentaires de livraison** encore à transmettre à Marie. Ranger chaque élément sous l'une des sections : « Changements livrés », « Questions où nous avons besoin de ton choix », « Écart assumé » ou « Retour d'export déjà corrigé ». **Aucune liste de tests** : les comportements à valider par Marie sont ajoutés au catalogue in-app `src/domain/data/manualTestsCatalog.ts` (écran « Tests à faire »), jamais dans ce fichier (cf. `CLAUDE.md` § Spécificités projet).
   - Une entrée par phase livrée, rédigée en français simple, sans aucun jargon technique (pas de nom de fichier, composant, fonction ou terme de code) : décrire uniquement ce qui change concrètement pour Marie dans son usage de l'application.
   - Si le document source numérote ses demandes, faire précéder chaque entrée du ou des numéros concernés (ex : « #4, #5 — ... ») pour qu'elle puisse relier le commentaire à sa propre liste.

9. Une fois toutes les phases de la roadmap passées à `[FAIT]`, proposer explicitement à l'utilisateur de lancer `/deploy`. Ne jamais le lancer automatiquement.

10. Vérifier et rapporter.
   - Exécuter `git diff --check` et afficher les fichiers modifiés.
   - Ne modifier aucun code applicatif, donnée personnelle, export Marie ou journal de tests.
   - Rapporter le chemin de la roadmap, de `COMMUNICATION/Marie/a_transmettre.md` et du registre `_contexte/marie_modifications_suivi.md`, les demandes ajoutées, celles écartées avec leur motif, le différentiel d'états du registre (avant → après), et les décisions encore attendues.
