# Synthèse de recherche — jeux pour personnes TSA / SDI / TDAH

Date de collecte : 2026-10-10
Statut : collecte initiale, non exhaustive, non revue par les pairs. Fait / hypothèse distingués.

## 1. Provenance des données

| Source | Nature | Public couvert | Fiabilité |
|---|---|---|---|
| `D:\ServOMorph\IA-TSA\docs\reference\jeux_video_tsa.md` (2026-07-27) | synthèse de littérature, sources citées | enfants/jeunes TSA, besoins de soutien variés | bonne (sources primaires listées), limites reconnues par l'auteur |
| `D:\ServOMorph\IA-TSA\docs\reference\autisme_informatique.md` (2026-06-19) | synthèse numérique et TSA | TSA, contexte éducatif | moyenne (mélange sources primaires et presse) |
| `D:\ServOMorph\IA-TSA\docs\reference\analyses\analyse_activite_cause_effet.md` (2026-07-08) | analyse de pistes de conception | TSA, besoins importants | bonne sur la prévisibilité, un seul retour terrain |
| `D:\ServOMorph\IA-TSA\docs\reference\analyses\analyse_ecran_victoire.md` (2026-07-27) | analyse écran « Gagné » | TSA, contacteur une touche | idem |
| Recherche web du 2026-10-10 (3 requêtes) | résultats de moteur de recherche, snippets uniquement, pages non ouvertes | TDAH, TSA, mixte | à qualifier : sources non lues en intégralité |

Non utilisés volontairement : `IA-TSA\data\users.json`, `retours_terrain.json`, `logs\` (données de terrain potentiellement personnelles).

## 2. Biais d'adéquation à signaler

IA-TSA cible surtout des enfants/jeunes TSA avec besoins de soutien importants, en séance accompagnée. L'application hôte cible des personnes AuDHD (TSA + TDAH) qui organisent leur quotidien (source : `DOCUMENTATION/10_concepts/produit_et_domaines.md`), probablement autonomes. Les résultats IA-TSA ne se transposent donc pas tels quels (jeux dyadiques adulte + jeune, contacteur une touche). L'âge et l'autonomie du public final des jeux ne sont pas documentés : question ouverte.

## 3. Faits retenus (par thème)

### 3.1 Efficacité des jeux
- Jeux sérieux TSA : amélioration rapportée sur des cibles étroites (émotions, attention conjointe, compétences sociales), mais cibles floues, mesures hétérogènes, échantillons de 10 à 42 participants, transfert à la vie réelle non démontré (Walsh, Linehan & Ryan, 2025, *Autism*). Source : IA-TSA `jeux_video_tsa.md` §1-2.
- TDAH : les entraînements cognitifs améliorent la compétence entraînée (surtout mémoire à court terme), mais le transfert (scolaire, comportemental) est faible ou nul ; les évaluateurs non aveugles rapportent des bénéfices plus grands (effet d'attente). Source : résultats web, méta-analyse 2013 sur 25 études, citée par un site secondaire (snippet).
- TSA : l'entraînement informatisé améliore attention, mémoire de travail, inhibition sur tâches entraînées ; protocoles hétérogènes, rigueur souvent insuffisante (revue systématique, *Brain Sciences*, 2021, d'après snippet).
- Jeux sérieux pour le TDAH : preuves minces, pas de preuve substantielle sur symptômes et fonctions exécutives (mémoire de master Twente, non revue par les pairs).

**Conséquence : un jeu ne doit pas être présenté comme thérapeutique ni comme intervention validée.**

### 3.2 Principes de conception (convergents)
- Prévisibilité : mapping action → effet fixe, pas d'aléatoire visible, pas d'animation autonome (IA-TSA).
- Feedback immédiat, distinct, sans connotation d'échec ; pas d'échec punitif (IA-TSA).
- Réglages sensoriels : son, intensité, taille, mode calme (IA-TSA).
- Coopération plutôt que compétition ; progression déclenchée par l'utilisateur, jamais par un minuteur (IA-TSA).
- TDAH : retirer les éléments distrayants, mettre en avant les éléments pertinents, niveaux flexibles, durée de niveau courte, durée de session non limitée (11 lignes directrices de Silva et al., d'après snippet web ; étude contrôlée à 16 participants, charge cognitive plus faible).
- Environnement par défaut à faible stimulation, contrôle de l'utilisateur sur lumière et son, possibilité de retrait (lignes directrices PAS 6463:2022 pour salles calmes, d'après un prototype VR).
- Récompense : l'effet intrinsèque court (visuel/sonore non bloquant) prime sur le score ou le message de victoire pour certains profils TSA (IA-TSA `analyse_ecran_victoire.md`, sources JMIR 2025 et ScienceDirect).
- Cohérence avec le design system de l'application : ni spectaculaire, ni engageant par addiction, ni « ludique à tout prix » (`_docs/docs de dev/5- DESIGN SYSTEM NEURODIVERGENT.md` §2).

### 3.3 Lacunes
- Aucune source trouvée sur la population AuDHD (TSA + TDAH combinés) : toute recommandation AuDHD est une combinaison de principes TSA et TDAH, non testée.
- Aucune revue spécifique sur les jeux de fonctions exécutives chez l'adulte TDAH trouvée.

## 4. Sources

Internes (IA-TSA, lecture seule) :
- `D:\ServOMorph\IA-TSA\docs\reference\jeux_video_tsa.md`
- `D:\ServOMorph\IA-TSA\docs\reference\autisme_informatique.md`
- `D:\ServOMorph\IA-TSA\docs\reference\analyses\analyse_activite_cause_effet.md`
- `D:\ServOMorph\IA-TSA\docs\reference\analyses\analyse_ecran_victoire.md`

Projet : `DOCUMENTATION/10_concepts/produit_et_domaines.md`, `_docs/docs de dev/5- DESIGN SYSTEM NEURODIVERGENT.md`.

Web (consultées le 2026-10-10, snippets de recherche uniquement, à relire avant tout usage) :
- Walsh O., Linehan C., Ryan C. (2025), *Autism* — https://journals.sagepub.com/doi/10.1177/13623613241277309 (via IA-TSA)
- Serious Games for Executive Functions Training for Adults with Intellectual Disability: Overview — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9517401/
- Effects of Serious Games for Treating ADHD: A Meta-Analysis (mémoire, Univ. Twente) — https://essay.utwente.nl/essays/96382
- Cognitive training for attention, inhibition and working memory deficits: a potential treatment for ADHD? (Univ. Southampton) — https://eprints.soton.ac.uk/69791/
- Do cognitive training programs benefit children with ADHD? A meta-analytic review (relais Scott Barry Kaufman) — https://scottbarrykaufman.com/study-alert-do-cognitive-training-programs-benefit-children-with-adhd-a-meta-analytic-review/
- From Design Principles to Prototype: A Game for Students with ADHD and Learning Disabilities Transitioning to Post-Secondary Education (arXiv) — https://arxiv.org/pdf/2606.29482
- Prototype VR salle calme ADHD/TSA (KIT) — https://publikationen.bibliothek.kit.edu/1000183896/165485513
