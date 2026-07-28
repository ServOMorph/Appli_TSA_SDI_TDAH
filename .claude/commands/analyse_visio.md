---
description: Analyse la transcription d'une visio testeur, ses captures d'écran, le code actuel, arbitre les décisions bloquantes, et produit captures + constats + roadmap versionnée + points à communiquer
argument-hint: <dossier-réunion>
model: opus
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
---

# /analyse_visio <dossier-réunion>

Cette commande ne modifie ni le code ni l'historique git. Elle produit **4 fichiers** : captures appariées + constats + roadmap + points à communiquer.

## Règle de non-duplication (prioritaire sur tout le reste)

Chaque information n'est écrite qu'**une seule fois** :
- Une capture est décrite intégralement dans `captures_*.md` et référencée partout ailleurs par son seul ID (ex: `C12`), jamais redécrite.
- Un constat est décrit intégralement dans `constats_*.md` et référencé partout ailleurs par son seul ID (ex: `B1`), jamais reformulé.
- L'analyse du code n'est pas un document séparé : les fichiers impactés sont portés directement sur les items de la roadmap ; la refacto préalable devient la phase 0.
- Pas de section de justification en prose : une décision d'ordre = une ligne maximum, et seulement si l'ordre n'est pas évident d'après le graphe de dépendances.

**Exception unique et délibérée** : `a_communiquer_*.md` reformule en langage non technique des éléments décrits ailleurs. C'est sa raison d'être — il s'adresse au testeur, pas à l'équipe. Il porte les IDs en référence discrète pour la traçabilité, mais son texte est autonome et ne suppose aucun autre fichier lu.

## Procédure

0. Vérifier le modèle actif. Si ce n'est pas Opus : demander de basculer via `/model opus` et s'arrêter. Sinon poursuivre sans le mentionner.

1. Lire l'argument ($ARGUMENTS).
   - Si absent : "Erreur : dossier de réunion requis (ex: /analyse_visio 2026-06-07)" et s'arrêter.
   - Résoudre `Note de réunion/<argument>/`. Si introuvable : "Erreur : dossier introuvable : Note de réunion/<argument>/" et s'arrêter.

2. Inventorier les sources, **en récursif** — les sous-dossiers sont libres et leur orthographe n'est pas garantie :
   - Transcription : Glob `**/input_*.txt`. Plusieurs → le plus récent (mtime). Aucun → "Erreur : aucun fichier input_*.txt trouvé dans ce dossier" et s'arrêter.
   - Horodatage : Glob `**/output_*.jsonl` (champs `horodatage` + `segment`), `**/session_*.json` (`heure_debut`, `heure_fin`), `**/state_*.json` (`position`).
   - Captures de séance : Glob `**/*.png`, `**/*.jpg`, `**/*.jpeg`.
   - Documents amont et partagés : Glob `**/en amont/*` et tout document hors séance.

   **Garde-fous, à exécuter avant toute analyse :**

   - **Intégrité de l'horodatage.** Comparer `state_*.json` → `position` à la taille en octets de `input_*.txt`. En dessous de **95 %**, l'analyseur temps réel n'a pas traité toute la séance : son `horodatage` porte un retard cumulatif pouvant atteindre plusieurs dizaines de minutes. Dans ce cas, **l'appariement horodaté est disqualifié** — le noter et appliquer l'étape 4 en méthode ordinale seule. Ne jamais supposer que le retard est de quelques secondes sans avoir fait ce calcul.
   - **Volume de captures.** Au-delà de **40 images**, prévenir l'utilisateur du coût avant de commencer et écrire `captures_*.md` **par lots au fil de la lecture** plutôt qu'en une fois à la fin, pour que le travail survive à une coupure de contexte.
   - **Documents non lisibles directement** (`.docx`, `.pdf`, `.xlsx`, `.pptx`) : les lister et **demander à l'utilisateur s'ils doivent être analysés**. Ne jamais les ignorer silencieusement, ne jamais décider seul de les écarter.
     S'il valide, extraire le texte sans dépendance externe, en écrivant le résultat dans un fichier UTF-8 plutôt qu'en le lisant sur la sortie console (qui mange les accents sous Windows) :
     ```
     python -c "
     import zipfile, re
     xml = zipfile.ZipFile(SRC).read('word/document.xml').decode('utf-8')
     xml = re.sub(r'</w:p>', '\n', xml)
     xml = re.sub(r'<w:tab/>', '\t', xml)
     txt = re.sub(r'<[^>]+>', '', xml)
     for a, b in (('&amp;','&'),('&lt;','<'),('&gt;','>'),('&quot;','\"'),('&apos;',\"'\")):
         txt = txt.replace(a, b)
     open(DST, 'w', encoding='utf-8').write(txt)
     "
     ```
     (`word/document.xml` vaut pour `.docx` ; pour `.pptx` itérer sur `ppt/slides/slide*.xml`, pour `.xlsx` sur `xl/sharedStrings.xml`.) Puis lire `DST` avec Read.

3. Lire intégralement la transcription (par pages successives si tronquée — jamais la première page seule).

4. Apparier chaque capture à son passage de transcription.

   **Méthode primaire — ordinale par annonce, vérifiée par le contenu.** C'est la seule fiable en toutes circonstances :
   - Heure de capture = suffixe `HHMMSS` du nom de fichier ; à défaut, mtime. Recouper avec une horloge visible dans l'image quand il y en a une (barre d'état d'un téléphone partagé).
   - Extraire dans l'ordre les **annonces de capture** de l'animateur (`je capture`, `je fais une capture`, `je vais faire un screen`), en excluant les mentions purement méta (« il faudra que je fasse des captures »). Fusionner les mentions distantes de moins de ~5 lignes : elles décrivent un même événement.
   - Le nombre d'annonces est presque toujours **inférieur** au nombre de fichiers : une annonce donne souvent lieu à plusieurs clichés. Ne pas forcer une bijection.
   - **Lire les images et trancher par le contenu.** L'image est la vérité terrain : le passage de transcription décrit ce qui est montré, l'appariement se confirme ou s'infirme là. Une annotation manuscrite apparue entre deux clichés date le second de façon certaine.

   **Méthode d'appoint — horodatage**, utilisable **uniquement** si le garde-fou d'intégrité de l'étape 2 est passé :
   - Table d'ancres : chaque `horodatage` du `.jsonl` mappé sur le n° de ligne correspondant dans `input_*.txt` (un `segment` est la concaténation de lignes consécutives d'un même locuteur).
   - Le `.jsonl` peut ne contenir qu'un seul locuteur ; dater les lignes de l'autre par encadrement.
   - Fenêtre `[T-90s, T+30s]`, jamais d'égalité stricte : `horodatage` est une heure de traitement, pas d'énoncé.

   Lire les captures **par lots chronologiques**, en s'appuyant sur le passage apparié pour interpréter ce qui est montré.

5. Produire `Note de réunion/<dossier>/captures_<date-du-jour>.md` :
   - En tête, **la méthode d'appariement réellement employée** et le résultat du garde-fou d'intégrité. Si l'horodatage a été disqualifié, le dire et donner le chiffre.
   - Une entrée par capture, par ordre chronologique : `### C<n> — <heure> — l.<lignes> — [confiance : haute | moyenne | à vérifier] Titre` suivi de **1 à 3 lignes maximum** : ce qu'elle montre · ce qu'elle confirme ou contredit dans la transcription · l'ID de constat qu'elle illustre.
   - Une confiance moyenne ou basse est notée telle quelle, **jamais lissée**.
   - Documents partagés hors séance (feuilles manuscrites, photos) : même traitement, IDs `F<n>`, sans appariement horaire. Signaler quand ils représentent un état **antérieur** aux annotations faites en séance.
   - **Aucun constat ni analyse de code dans ce fichier.**

6. Produire `Note de réunion/<dossier>/constats_<date-du-jour>.md` — exhaustif mais dense :
   - Une entrée par demande/remarque/bug/piste : `### <ID> — [P1|P2|P3] Titre — l.<réfs transcription>` suivi de **1 à 3 lignes maximum** (paraphrase fidèle ; citation seulement si la formulation exacte compte).
   - IDs préfixés par nature : B (bug), E (fonctionnalité), D/P/L/N (UI par écran), Q (décision produit / ambiguïté à valider avec le testeur).
   - Priorités : P1 bloquant/structurant · P2 important · P3 reporté.
   - Preuve visuelle : citer les IDs de capture (`cf. C12, C13`), **sans redécrire leur contenu**.
   - **Aucune analyse de code dans ce fichier** (elle va dans la roadmap).
   - Section obligatoire `## Sources non exploitées` : tout document listé à l'étape 2 et non analysé, avec le motif. Un trou de couverture doit survivre à la session qui l'a découvert.
   - Terminer par la section `## Q — À valider avant implémentation` regroupant les ambiguïtés.

7. Analyser le code (`src/`, zones concernées par les constats) — **sans produire de fichier**.

   **Classer chaque constat P1 contre l'existant, en trois cas :**
   - **déjà couvert** — donner la référence du code. Le constat sort de la roadmap et devient une ligne « déjà satisfait ».
   - **partiellement couvert** — quantifier l'écart. C'est l'écart, et non le constat entier, qui devient l'item ou la question.
   - **absent** — item de roadmap normal.

   **Règle bloquante** : une `Q` ne peut pas être écrite comme ouverte sans avoir vérifié que le code ne la tranche pas déjà. Si le code répond, elle est écrite comme résolue, avec la référence. Faire porter à l'utilisateur un arbitrage que le code a déjà rendu est une faute.

   Retenir par ailleurs pour la roadmap :
   - fichiers impactés, par constat ;
   - existant réutilisable (champs/fonctions déjà présents non câblés) ;
   - dettes bloquantes et refacto préalable strictement nécessaire aux constats (→ phase 0).

8. Version : Glob `roadmap_v*.md` **en récursif** (racine, `Archives/`, `Note de réunion/**`), extraire le N max toutes localisations confondues. Les versions décimales comptent (`v4.1` → `V5`). Annoncer "Roadmap V<N+1> (succède à roadmap_v<N>.md)".

9. **Arbitrage interactif — avant d'écrire la roadmap.**

   Une roadmap dont les `Q` bloquantes ne sont pas tranchées n'est pas un livrable, c'est un brouillon : elle sera réécrite intégralement. Ne pas l'écrire dans cet état.

   - Identifier les `Q` qui **conditionnent le découpage en phases** (périmètre, articulation d'écrans, sort d'un module existant, profondeur d'un modèle de données). Les autres restent des questions ouvertes en fin de roadmap.
   - Les poser **une par une** via `AskUserQuestion`, chacune précédée d'un exposé court : ce que le testeur a demandé · ce que montrent les captures · ce que ça coûte · l'avis argumenté, y compris en désaccord avec le testeur.
   - Chercher activement les frictions que **personne n'a vues en séance** : une demande d'apparence cosmétique qui supprime un geste, une décision qui défait un travail livré récemment, une contrainte que le testeur a arbitrée sans savoir qu'il l'arbitrait. Ce sont les plus coûteuses et elles ne figurent jamais telles quelles dans la transcription.
   - Distinguer explicitement ce qui est **ajustable sans le testeur** de ce qui doit **lui revenir**.
   - Consigner les arbitrages en tête de roadmap, chacun avec son motif.

10. Produire `Note de réunion/<dossier>/roadmap_v<N+1>.md` :

    **En-tête** (une seule fois) :
    - Source : constats + captures + dossier. Ne couvre que les évolutions de cette visio.
    - Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
    - Définition du gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.
    - Section `## Arbitrages` issue de l'étape 9, suivie de `### Écarts assumés à signaler au testeur`.

    **Ordre & dépendances** : graphe ASCII compact (phase → dépend de). Une ligne de justification uniquement pour les choix non évidents.

    **Phases** — contraintes :
    - Phase 0 = refacto préalable issue de l'étape 7, sans changement de comportement visible.
    - Toute phase de refacto (dont la phase 0) commence par la ligne : `> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.`
    - Ordre respectant les dépendances ET la contrainte : chaque phase testable manuellement dès qu'elle est finie, sans dépendre d'une phase future.
    - Regrouper : viser ≤ 7 phases ; une phase de moins de 3 items fusionne avec une voisine compatible.
    - Chaque item : `- [ ] <ID> (cf. C<n>) — action concrète (fichiers cibles)`, la référence de capture n'étant portée que si une preuve visuelle existe. Pas de re-description du constat.
    - Une dette reprise d'une roadmap antérieure et devenue bloquante est portée comme item, avec sa référence d'origine.
    - Gate par phase : **une seule ligne** — `Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : <critère spécifique>`.
    - Fin de fichier : `## Q à trancher` (IDs + ce qu'ils bloquent), `## Reporté en V<N+1>.1+` et `## Reporté hors V<N+1>` (IDs seuls).

11. Produire `Note de réunion/<dossier>/a_communiquer_<date-du-jour>.md` — destiné au **testeur**, pas à l'équipe :
    - Langage non technique : aucun nom de fichier, de composant, d'entité ni de phase. Les IDs (`E12`, `C7`, `Q3`) apparaissent uniquement entre crochets en fin de ligne, pour la traçabilité côté équipe.
    - Formuler chaque point tel qu'il peut être dit oralement, sans réécriture.
    - Sections, dans cet ordre :
      1. **À montrer, sans en discuter avant** — les points où une démonstration tranche plus vite qu'un débat, typiquement quand le testeur a arbitré un rendu sans mesurer qu'il arbitrait aussi un geste ou une contrainte.
      2. **Écarts assumés** — chaque décision qui s'écarte de la demande, avec son motif exprimé du point de vue du testeur, et la mention explicite de ce qui est réversible.
      3. **Ce qui est repoussé, et pourquoi** — le motif prime sur la liste ; ne jamais laisser croire qu'un besoin a été oublié.
      4. **À lui demander** — les `Q` qui appellent une réponse de lui seul (nommage, priorité, préférence d'usage).
      5. **Questions à poser après usage** — celles auxquelles il ne peut pas répondre sans avoir manipulé la livraison. Les isoler évite de les poser trop tôt et d'obtenir une réponse spéculative.
    - Les sections 1 à 3 découlent des arbitrages de l'étape 9. Si l'arbitrage a été écourté, écrire les sections 4 et 5 et signaler en tête que les trois premières restent à compléter — ne pas les inventer.

12. Demander à l'utilisateur : **« Archiver l'ancienne roadmap dans `Archives/` et déplacer la nouvelle roadmap à la racine du projet ? »**
    - Le `CLAUDE.md` du projet place les roadmaps à la racine ; une roadmap laissée dans le dossier de réunion échappe à la détection de version et au protocole de session.
    - Si l'utilisateur valide : déplacer `roadmap_v<N>.md` de la racine vers `Archives/`, puis déplacer `roadmap_v<N+1>.md` du dossier de réunion vers la racine. Ne rien déplacer sans validation.

13. Conclure la réponse par :
    - Les 4 fichiers créés (chemins complets) et la version retenue.
    - Le nombre de captures appariées, dont celles en confiance moyenne ou « à vérifier », et la méthode employée.
    - Les sources non exploitées, s'il y en a.
    - Les Q restées ouvertes à valider avec le testeur.
