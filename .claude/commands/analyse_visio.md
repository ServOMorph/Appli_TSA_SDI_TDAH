---
description: Analyse la transcription d'une visio testeur, le code actuel, et produit constats + roadmap versionnée
argument-hint: <dossier-réunion>
model: opus
allowed-tools: Read, Glob, Grep
---

# /analyse_visio <dossier-réunion>

Cette commande ne modifie ni le code ni l'historique git. Elle produit exactement **2 fichiers** : constats + roadmap.

## Règle de non-duplication (prioritaire sur tout le reste)

Chaque information n'est écrite qu'**une seule fois** :
- Un constat est décrit intégralement dans `constats_*.md` et référencé partout ailleurs par son seul ID (ex: `B1`), jamais reformulé.
- L'analyse du code n'est pas un document séparé : les fichiers impactés sont portés directement sur les items de la roadmap ; la refacto préalable devient la phase 0.
- Pas de section de justification en prose : une décision d'ordre = une ligne maximum, et seulement si l'ordre n'est pas évident d'après le graphe de dépendances.

## Procédure

0. Vérifier le modèle actif. Si ce n'est pas Opus : demander de basculer via `/model opus` et s'arrêter. Sinon poursuivre sans le mentionner.

1. Lire l'argument ($ARGUMENTS).
   - Si absent : "Erreur : dossier de réunion requis (ex: /analyse_visio 2026-06-07)" et s'arrêter.
   - Résoudre `Note de réunion/<argument>/`. Si introuvable : "Erreur : dossier introuvable : Note de réunion/<argument>/" et s'arrêter.

2. Localiser la transcription : Glob `input_*.txt` dans le dossier. Plusieurs → le plus récent (mtime). Aucun → "Erreur : aucun fichier input_*.txt trouvé dans ce dossier" et s'arrêter.

3. Localiser et lire les captures d'écran du dossier (Glob `*.png`, `*.jpg`, `*.jpeg`).

4. Lire intégralement la transcription (par pages successives si tronquée — jamais la première page seule).

5. Produire `Note de réunion/<dossier>/constats_<date-du-jour>.md` — exhaustif mais dense :
   - Une entrée par demande/remarque/bug/piste : `### <ID> — [P1|P2|P3] Titre — l.<réfs transcription>` suivi de **1 à 3 lignes maximum** (paraphrase fidèle ; citation seulement si la formulation exacte compte).
   - IDs préfixés par nature : B (bug), E (fonctionnalité), D/P/L/N (UI par écran), Q (décision produit / ambiguïté à valider avec le testeur).
   - Priorités : P1 bloquant/structurant · P2 important · P3 reporté.
   - Captures d'écran : une entrée chacune (ce qu'elle montre, ce qu'elle confirme/contredit).
   - **Aucune analyse de code dans ce fichier** (elle va dans la roadmap).
   - Terminer par la section `## Q — À valider avant implémentation` regroupant les ambiguïtés.

6. Analyser le code (`src/`, zones concernées par les constats) — **sans produire de fichier**. Retenir pour la roadmap :
   - fichiers impactés, par constat ;
   - existant réutilisable (champs/fonctions déjà présents non câblés) ;
   - dettes bloquantes et refacto préalable strictement nécessaire aux constats (→ phase 0).

7. Version : Glob `roadmap_v*.md` à la racine, extraire le N max. Annoncer "Roadmap V<N+1> (succède à roadmap_v<N>.md)".

8. Produire `Note de réunion/<dossier>/roadmap_v<N+1>.md` :

   **En-tête** (une seule fois) :
   - Source : constats + dossier. Ne couvre que les évolutions de cette visio.
   - Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
   - Définition du gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

   **Ordre & dépendances** : graphe ASCII compact (phase → dépend de). Une ligne de justification uniquement pour les choix non évidents.

   **Phases** — contraintes :
   - Phase 0 = refacto préalable issue de l'étape 6, sans changement de comportement visible.
   - Ordre respectant les dépendances ET la contrainte : chaque phase testable manuellement dès qu'elle est finie, sans dépendre d'une phase future.
   - Regrouper : viser ≤ 7 phases ; une phase de moins de 3 items fusionne avec une voisine compatible.
   - Chaque item : `- [ ] <ID> — action concrète (fichiers cibles)`. Pas de re-description du constat.
   - Gate par phase : **une seule ligne** — `Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : <critère spécifique>`.
   - Fin de fichier : `## Q à trancher` (IDs + ce qu'ils bloquent) et `## Reporté hors V<N+1>` (IDs seuls).

9. Conclure la réponse par :
   - Les 2 fichiers créés (chemins complets) et la version retenue.
   - Les Q à valider avec le testeur avant de démarrer.
