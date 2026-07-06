---
description: Analyse la transcription d'une visio testeur, le code actuel, et produit constats + plan + roadmap versionnée
argument-hint: <dossier-réunion>
model: opus
allowed-tools: Read, Glob, Grep
---

# /analyse_visio <dossier-réunion>

Cette commande ne modifie ni le code ni l'historique git. Elle ne produit que des documents d'analyse et de planification.

## Procédure

0. Vérifier le modèle actif. Si ce n'est pas Opus : informer l'utilisateur que cette commande nécessite Opus (analyse longue : transcription + code + captures d'écran) et lui demander de basculer via `/model opus` avant de continuer, puis s'arrêter. Si Opus est déjà actif, poursuivre directement sans le mentionner.

1. Lire l'argument fourni ($ARGUMENTS).
   - Si absent : répondre "Erreur : dossier de réunion requis (ex: /analyse_visio 2026-06-07)" et s'arrêter.
   - Résoudre `Note de réunion/<argument>/`. Si le dossier n'existe pas : répondre "Erreur : dossier introuvable : Note de réunion/<argument>/" et s'arrêter.

2. Localiser le fichier de transcription dans ce dossier :
   - Glob `input_*.txt`. S'il y en a plusieurs, prendre le plus récent (mtime).
   - Si aucun : répondre "Erreur : aucun fichier input_*.txt trouvé dans ce dossier" et s'arrêter.

3. Localiser les captures d'écran du dossier : Glob `*.png`, `*.jpg`, `*.jpeg`. Lire chacune (Read).

4. Lire intégralement la transcription (si tronquée par la taille, la lire par pages successives — ne pas se contenter de la première page).

5. Produire `Note de réunion/<dossier>/constats_<date-du-jour>.md` :
   - Liste exhaustive et détaillée de toutes les demandes, remarques, bugs et pistes évoquées par le testeur, une entrée par item, avec citation ou paraphrase fidèle et numéro de ligne de la transcription en référence.
   - Classer par nature : bug confirmé / décision produit à prendre / fonctionnalité manquante / nettoyage UI / point à retester.
   - Intégrer l'analyse de chaque capture d'écran comme entrées à part (ce qu'elle montre, ce qu'elle confirme ou contredit dans la transcription).

6. Analyser le code actuel de l'application (`src/`, en priorité les domaines/écrans concernés par les constats de l'étape 5) et produire `Note de réunion/<dossier>/analyse_code_<date-du-jour>.md` :
   - État actuel des zones de code impactées par les constats.
   - Dette technique ou incohérences détectées, pertinentes pour les changements à venir.
   - Proposition de refacto préalable, pour que l'implémentation de la version suivante parte sur des bases saines (ce sera la première section de la roadmap, étape 8).

7. Déterminer le numéro de version suivant :
   - Glob `roadmap_v*.md` à la racine du projet, extraire le numéro le plus élevé trouvé (N).
   - Version proposée : N+1.
   - Annoncer cette version dans la réponse avant de produire les fichiers suivants (ex: "Roadmap V3 (succède à roadmap_v2.md)").

8. Produire `Note de réunion/<dossier>/plan_implementation_<date-du-jour>.md` :
   - Ordre d'implémentation des changements listés en étape 5, dépendances explicites entre eux.
   - Objectif : qu'aucune étape ne nécessite d'attendre une étape future pour être testée manuellement (contrainte explicitement demandée, cf. problème vécu pendant le développement V2).
   - Justifier l'ordre choisi (pourquoi tel point avant tel autre).

9. Produire `Note de réunion/<dossier>/roadmap_v<N+1>.md`, au format de `roadmap_v2.md` (légende de statut, gate commun par phase) :
   - Roadmap de suivi : chaque item et chaque critère de gate est une case à cocher (`[ ]` non démarrée · `[~]` en cours · `[x]` terminée), pas une simple description en prose — le fichier doit pouvoir être mis à jour phase par phase au fil de l'implémentation.
   - Ouvre sur la section refacto de l'étape 6 (analyse du code actuel + refacto proposée), à traiter avant toute nouvelle fonctionnalité.
   - Phases ensuite dans l'ordre déterminé à l'étape 8.
   - Chaque phase respecte le gate commun : livrables fonctionnels, tests (création + lancement), refacto de fin de phase, doc à jour, **test manuel de la phase**, critère de sortie — chacun sous forme de coche.
   - Ne pas dupliquer `roadmap_v2.md` : ce nouveau fichier couvre uniquement les évolutions issues de cette visio.

10. Conclure la réponse par :
    - Le récapitulatif des 4 fichiers créés (chemins complets).
    - La version de roadmap retenue et pourquoi (N+1 déduit de `roadmap_v<N>.md`).
    - Tout point de la transcription resté ambigu, à valider avec le testeur avant implémentation.
