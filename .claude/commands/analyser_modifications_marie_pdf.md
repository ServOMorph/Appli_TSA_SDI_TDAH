---
description: Analyse un PDF de demandes de Marie et l’intègre dans une roadmap existante ou nouvelle
argument-hint: [chemin du PDF] [chemin optionnel de roadmap]
allowed-tools: Bash(python:*), Bash(git log:*), Bash(git diff:*), Bash(git status:*), Bash(rg:*), Bash(test:*), Bash(ls:*), Bash(find:*)
---

# /analyser_modifications_marie_pdf [PDF] [roadmap]

## Procédure

1. Localiser le PDF.
   - Si le premier argument est absent, demander son chemin absolu.
   - Vérifier que le fichier existe et est un PDF lisible. En cas d’échec, s’arrêter sans modifier de roadmap.

2. Déterminer la cible de planification.
   - Si un second argument est fourni, vérifier qu’il pointe vers une roadmap Markdown existante.
   - Sinon, demander explicitement : « Existe-t-il déjà une roadmap à compléter ? Si oui, indique son chemin ; sinon, confirme que je dois en créer une et donne son nom souhaité. »
   - Ne jamais créer ni modifier de roadmap avant cette réponse.

3. Lire le PDF intégralement.
   - Extraire le texte de chaque page et rendre toutes les pages en images pour vérifier les captures, annotations et mise en page.
   - Relever chaque demande sans la reformuler de manière trompeuse : page, zone fonctionnelle, comportement demandé et éventuelles contraintes exprimées.
   - Si le texte ou une annotation est illisible, le signaler comme ambigu au lieu de l’interpréter.

4. Analyser chaque demande par rapport au projet.
   - Consulter le code, les tests, `CHANGELOG.md`, les roadmaps et l’historique Git nécessaires.
   - Classer chaque demande : déjà livrée, bug à reproduire, bug confirmé, évolution à concevoir, obsolète ou contradictoire avec une décision existante.
   - Ne pas considérer une capture d’un ancien écran comme preuve que son modèle doit être réintroduit ; vérifier l’architecture actuelle et signaler l’écart.
   - Pour les éléments déjà livrés, identifier précisément le comportement actuel et ne pas planifier de travail redondant.

5. Mettre à jour la roadmap choisie ou en créer une.
   - Ajouter une section « Analyse du PDF » avec la traçabilité page → demande → état → traitement.
   - Ajouter uniquement les demandes encore pertinentes sous forme de phases indépendantes, avec dépendances, fichiers pressentis, tests automatisés, test manuel et critère de sortie.
   - Isoler les décisions produit non tranchées dans une section dédiée ; ne pas les convertir en tâches de code.
   - Si une nouvelle roadmap est demandée, utiliser le nom validé par l’utilisateur et indiquer la source PDF, la date d’analyse et la même traçabilité.

6. Vérifier et rapporter.
   - Exécuter `git diff --check` et afficher les fichiers modifiés.
   - Ne modifier aucun code applicatif, donnée personnelle, export Marie ou journal de tests.
   - Rapporter le chemin de la roadmap, les demandes ajoutées, celles écartées avec leur motif, et les décisions encore attendues.
