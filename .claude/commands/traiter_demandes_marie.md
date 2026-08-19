---
description: Traite un document de demandes Marie reçu par Google Drive (Flux B ROBERTO) — archive, analyse, plan d'action groupé, roadmap versionnée jusqu'à la dist
argument-hint: [chemin-fichier]
model: opus
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
---

# /traiter_demandes_marie [chemin-fichier]

Implémente le **Flux B** de `roadmap_roberto_workflow.md` (Google Drive) — cette commande ne modifie ni le code ni l'historique git. Elle produit **2 livrables** : constats + roadmap, plus une copie archivée du document source.

## Règle de non-duplication (prioritaire sur tout le reste)

Chaque information n'est écrite qu'**une seule fois** :
- Un constat est décrit intégralement dans `constats_<date>.md` et référencé partout ailleurs par son seul ID, jamais reformulé.
- L'analyse du code n'est pas un document séparé : les fichiers impactés sont portés directement sur les items de la roadmap.
- Le « plan d'action » demandé n'est pas un fichier à part : c'est le regroupement et l'ordre des phases de la roadmap elle-même (étape 9). Un document intermédiaire dupliquerait la roadmap dès qu'elle serait écrite.

## Procédure

0. Vérifier le modèle actif. Si ce n'est pas Opus : demander de basculer via `/model opus` et s'arrêter (roadmap = migration structurelle, cf. `CLAUDE.md` § Modèles recommandés). Sinon poursuivre sans le mentionner.

1. Résoudre le fichier à traiter.
   - Si $ARGUMENTS fourni : l'utiliser comme chemin.
   - Sinon : demander explicitement à l'utilisateur le chemin du fichier de demandes à traiter. Ne jamais deviner ni chercher un fichier récent dans `Downloads` ou ailleurs — l'utilisateur remet le fichier à chaque fois, il n'y a pas de détection automatique de nouveauté sur ce flux.
   - Vérifier que le fichier existe. Si introuvable : "Erreur : fichier introuvable : <chemin>" et s'arrêter.

2. Archiver une copie brute, jamais modifiée, avant toute lecture analytique :
   - Créer `ROBERTO/flux_b_drive/entrees/` si absent.
   - Copier le fichier vers `ROBERTO/flux_b_drive/entrees/<AAAA-MM-JJ>_<nom-original>` (date du jour, nom original conservé). Ne jamais écraser une entrée existante du même jour portant un nom différent ; en cas de collision exacte de nom, suffixer `_2`, `_3`, etc. plutôt qu'écraser.
   - Si le fichier source vit dans un dossier listé comme donnée sensible dans `CLAUDE.md`, s'arrêter et demander confirmation explicite avant de le lire ou de le copier.

3. Lire le document intégralement (toutes pages/captures, y compris annotations manuscrites). Si le format n'est pas nativement lisible (`.docx`, `.xlsx`, `.pptx`) : demander confirmation avant d'extraire le texte (même procédure que `/analyse_visio` étape 2, extraction sans dépendance externe via `python -c` + fichier UTF-8 intermédiaire).

4. Produire `ROBERTO/flux_b_drive/analyses/constats_<AAAA-MM-JJ>.md`, exhaustif mais dense :
   - Grouper les entrées par zone/écran telle que structurée dans le document source (ex: Accueil/Planning, Tâches, Budget, Listes, Autres/Énergie, Paramètres) — reprendre les intitulés du document, ne pas en inventer un découpage différent à ce stade.
   - Une entrée par demande/remarque/bug : `### <ID> — [P1|P2|P3] Titre` suivi de **1 à 3 lignes maximum** (paraphrase fidèle du document, citation entre guillemets si la formulation exacte compte pour trancher une ambiguïté).
   - IDs préfixés par zone (2 lettres reprenant l'intitulé de la section source, ex: `AP` Accueil/Planning, `TA` Tâches, `BU` Budget, `LI` Listes, `EN` Énergie, `PA` Paramètres) + numéro séquentiel.
   - Nature de chaque entrée à noter explicitement : bug (comportement actuel incorrect) / feature (nouveau comportement demandé) / ambiguïté (`Q`, décision produit à trancher).
   - Priorités : P1 bloquant/structurant (contredit un comportement documenté ou casse un usage existant) · P2 amélioration importante · P3 cosmétique/reportable.
   - Section obligatoire `## Sources non exploitées` : toute page/capture illisible ou ambiguë, avec le motif.
   - Terminer par `## Q — À valider avant implémentation`.
   - **Aucune analyse de code dans ce fichier.**

5. Analyser le code (`src/`, zones concernées par les constats) — **sans produire de fichier séparé**.
   Classer chaque constat P1 contre l'existant, en trois cas :
   - **déjà couvert** — donner la référence du code, le constat sort de la roadmap.
   - **partiellement couvert** — quantifier l'écart, c'est l'écart qui devient l'item.
   - **absent** — item de roadmap normal.

   **Règle bloquante** : une `Q` ne peut pas être écrite comme ouverte sans avoir vérifié que le code ne la tranche pas déjà.

   Retenir pour la roadmap : fichiers impactés par constat · existant réutilisable · dette bloquante nécessitant une phase 0.

6. Version : `Glob roadmap_demandes_marie_v*.md` en récursif (racine + `Archives/`), extraire le N max. Aucune trouvée → V1. Annoncer "Roadmap V<N+1> (succède à roadmap_demandes_marie_v<N>.md)" ou "Première roadmap de ce flux".

7. **Arbitrage interactif — avant d'écrire la roadmap.** Une roadmap dont les `Q` bloquantes ne sont pas tranchées n'est pas un livrable.
   - Identifier les `Q` qui **conditionnent le découpage en phases** (périmètre d'un écran, articulation entre deux demandes contradictoires, profondeur d'un modèle de données). Les autres restent des questions ouvertes en fin de roadmap.
   - Les poser **une par une** via `AskUserQuestion` : ce que Marie a demandé · ce que dit le code actuel · le coût · l'avis argumenté, y compris en désaccord avec la demande si elle est risquée ou mal posée (cf. `CLAUDE.md` § Honnêteté).
   - Chercher activement les frictions non vues par Marie : une demande cosmétique qui supprime un geste, une demande qui défait un correctif déjà livré, une contrainte tranchée sans que Marie mesure qu'elle l'arbitrait.

8. **Plan d'action = construction du regroupement des phases**, avant d'écrire le fichier :
   - Regrouper les items **par fichiers/zone de code réellement impactés**, pas par ordre d'apparition dans le document source — deux demandes venant d'écrans différents du PDF mais touchant le même composant (ex: `E70Tools.tsx` pour plusieurs cases d'outils) vont dans la même phase.
   - Construire le graphe de dépendances (une phase qui modifie un modèle de données doit précéder les phases qui l'affichent).
   - Une dette bloquante découverte à l'étape 5 devient la Phase 0 (refacto sans changement de comportement visible).
   - Viser ≤ 7 phases ; une phase de moins de 3 items fusionne avec une voisine compatible.

9. Produire `roadmap_demandes_marie_v<N>.md` à la **racine du projet** (convention `CLAUDE.md` § Roadmap) :
   - Source : `constats_<date>.md` + fichier archivé (chemin complet vers `ROBERTO/flux_b_drive/entrees/...`).
   - Légende `[ ]`/`[~]`/`[x]`, gate commun, section `## Arbitrages` (étape 7).
   - Graphe de dépendances ASCII compact entre phases.
   - Phases construites à l'étape 8. Chaque item : `- [ ] <ID> — action concrète (fichiers cibles)`.
   - Gate par phase : `Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : <critère>`. Ajouter le point correspondant à `tests_manuels.md` quand le comportement est testable par Marie.
   - **Dernière phase = « Préparation de la dist pour Marie »** : ne duplique pas la logique de `/deploy` — se contente de lister les vérifications spécifiques à cette roadmap (CHANGELOG, `WHATS_NEW`, catalogue de tests manuels) et de rappeler qu'une fois cette phase `[FAIT]`, `/deploy` livre la dist.
   - Fin de fichier : `## Q à trancher`, `## Reporté en V<N+1>.1+`, `## Reporté hors V<N+1>`.
   - Chaque phase se termine par le bloc Checkpoint standard (cf. `CLAUDE.md`), sans exception.

10. Mettre à jour `AGENT_STATE.md`, section **Flux B — Google Drive** :
    - État : développement, en cours (première exécution de ce skill) ou mis à jour (exécutions suivantes).
    - Référencer le fichier archivé (`ROBERTO/flux_b_drive/entrees/...`), `constats_<date>.md` et la roadmap active.
    - Ne pas dupliquer le détail des phases : renvoyer à la roadmap comme source de vérité (même convention que Flux C).

11. Conclure la réponse par :
    - Les fichiers créés/mis à jour (chemins complets) : copie archivée, constats, roadmap, `AGENT_STATE.md`.
    - Le nombre de constats par priorité et par nature (bug/feature/question).
    - Les `Q` restées ouvertes à valider avec Marie ou avec l'utilisateur.
    - Rappel explicite : le développement des phases se fait en session(s) normale(s) ensuite ; cette commande ne modifie aucun fichier de `src/`.
