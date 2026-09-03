# Roadmap — Demandes Marie 23-33 (Google Doc du 2026-08-31)

- Source : Google Doc « Modifications » de Marie
  `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`
- Date de modification du Doc analysée : 2026-08-31 17:28 ; re-analyse 2026-09-03 17:20 UTC
- Date d'analyse : 2026-09-02 (`/analyser_googledoc`, depuis `/deploy` étape 0.4) ;
  re-analyse 2026-09-03 (`/analyser_googledoc`, depuis `/deploy` étape 0.4)
- Registre de suivi : `_contexte/marie_modifications_suivi.md` (lignes 23-33)

### Re-analyse du 2026-09-03

Doc modifié le 2026-09-03 17:20 UTC. L'export texte liste les **mêmes 14 demandes** (19, 21,
22, 23 à 33), formulation inchangée, pied « Dernières modifications : 32 » — aucune demande
nouvelle, retirée ni reformulée. Seul changement matériel : arrivée des **captures #3 et #32**
(transmission manuelle, `COMMUNICATION/Marie/captures/2026-09-03/`, commit 9f03d5d), qui
tranchent la décision produit 7 et débloquent la Phase 10. Traçabilité : #3 (registre ligne
19, ex-`en attente`) et #32 → `en cours` Phase 10 débloquée ; toutes les autres demandes
inchangées (23-31, 33 en Phases 1-9 `[FAIT]` ; 19/21/22 hors périmètre,
`roadmap_planning_accueil_2026-08-29.md`). Snapshot Supabase du 2026-09-03 18:44 : aucune
perte, aucune variation structurelle, `manual_test_results` = 49 (dernier 2026-08-31).

## Périmètre

Le Doc porte à présent 14 demandes : **19, 21, 22** (déjà en cours dans
`roadmap_planning_accueil_2026-08-29.md`, Phases 3-4-5 implémentées le 2026-09-02, non
déployées — hors périmètre de cette roadmap) et **23 à 33**, ajoutées le 2026-08-31.

Cette roadmap couvre uniquement **23 à 33** : 3 bugs confirmés, 1 bug à reproduire, 7 évolutions.
Catégories touchées : Accueil/Planning (23-25), Outils : Budget (26), Outils : Comptes (27-28),
Énergie (29), Paramètres/Profil (30-32), Outils : Listes (33).

## Analyse du Google Doc

| N° | Catégorie | Demande (résumé) | État actuel dans le code | Classement | Phase |
| --- | --- | --- | --- | --- | --- |
| 23 | Accueil / Planning | Tâche sans couleur : le texte reste noir quand la tâche est cochée et barrée (ne pas passer en blanc) | `plannedTaskTintStyle` (`src/ui/styles/ambiance.ts:19`) force `color: '#fff'` dès que `completed`. `PlanningBoard.tsx:200` (`rowTintStyle`) passe `'var(--color-surface)'` comme couleur pour une tâche sans couleur → fond quasi blanc + texte blanc barré = illisible. | Bug confirmé | 1 |
| 24 | Accueil / Planning | Le nom de la tâche figure toujours en haut de la case, même pour les grandes cases | `rowStyle` (`PlanningBoard.tsx:143-165`) = flex `alignItems: 'center'` ; sur une case haute (jusqu'à `ROW_MAX_HEIGHT = 160`) le titre est centré verticalement. | Évolution | 3 |
| 25 | Accueil / Planning | Heure de début en haut de la case, heure de fin en bas (selon la durée) ; interdire une tâche sans durée | La case n'affiche que `scheduled_start` (`PlanningBoard.tsx:533`), unique label centré. `scheduled_end` existe sur `Task` mais n'est pas rendu. À la création (`E21CreateTaskV2.tsx:143,148`) `durationMinutes` démarre à `null` et `canSubmit` ne l'exige pas. | Évolution + décision produit | 3 |
| 26 | Outils : Budget | Dans la page « budget », le montant prévu de « Mon compte » s'affiche en positif et en vert, comme « Livrets » | `E71Budget.tsx:107` affiche `-monComptePrevisions` avec `amountTone()` → rouge (`var(--color-error)`) car négatif. « Mes livrets » (`:117`) : `var(--color-success)` + valeur positive. | Évolution + tension (voir décisions) | 6 |
| 27 | Outils : Comptes | Renommer l'outil « Compte » / carte « Comptes » en « Mon compte » | Carte accueil codée en dur `Comptes` (`E10Dashboard.tsx:135`), `<h1>` `Comptes` (`E75BudgetAccount.tsx:100`), route `budget-account`. | Évolution (label) | 4 |
| 28 | Outils : Comptes | En haut de « Mon compte », la somme de toutes les catégories (= prévision « Mon compte » du Budget) ; chaque dépense la décrémente — uniquement ici, pas dans « Budget » (somme fixe, à reconfigurer chaque mois) | `E75BudgetAccount` n'a aucun total en tête, seulement les colonnes Semaine/Mois avec `remaining = budgeted - spent` par sous-catégorie. Côté Budget, `getMonComptePrevisions` (`budgetRules.ts:98`) utilise déjà `category.amount` (fixe, jamais les dépenses). | Évolution | 5 |
| 29 | Énergie | Depuis la page de modification de l'énergie, « Retour » revient à l'accueil sans afficher « Mon énergie » | Le badge énergie va déjà droit au check-in (`E10Dashboard.tsx:72` → `energy-checkin`). Mais dans `E31EnergyCheckIn`, « ← Retour » (`:49`) et « ignorer » (`:33`) renvoient vers `energy-view` (E30 « Mon énergie »). | Bug / évolution | 8 |
| 30 | Paramètres / Profil | Modifier la couleur d'un outil met aussi à jour la couleur de sa carte sur l'accueil | `updateToolColor` enregistre bien la couleur ; le composant `ToolCard` l'applique (`ToolWidgetCard.tsx:38`, `pastelBackground`). Mais l'accueil rend un `<Card>` nu sans style de couleur (`E10Dashboard.tsx:148`). | Bug confirmé | 2 |
| 31 | Paramètres / Profil | L'outil « Compte » manque dans les réglages de couleur ; tous les outils, même futurs, doivent y apparaître | « Couleur des outils » (`E112Accessibility.tsx:124`) itère `tools` (entités `Tool`). La carte « Comptes » est codée en dur, pas un `Tool` → absente. | Évolution + décision archi | 7 |
| 32 | Paramètres / Profil | Tous les cadres de l'écran « Paramètres » débordent à droite ; ils doivent tenir dans l'écran | `<main>` sans `width` explicite (enfant flex de `#root`), `maxWidth: 480` + `margin: 0 auto` ; rangée « Taille du texte » non `flex-wrap`. Captures Marie du 2026-09-03 : débordement dans Paramètres > Accessibilité, cartes coupées à droite. | Bug confirmé (captures 2026-09-03) | 10 |
| 33 | Outils : Listes | Les sous-tâches d'un élément de liste apparaissent dans la page de la catégorie, pliables/dépliables/cochables (comme au planning) | `E62ListItemDetail` gère les sous-tâches (`getListItemSubTasks`, `toggleListItemSubTask`, `addListItemSubTask`, `deleteListItemSubTask`). `E61ListDetail` (page de catégorie) liste les éléments sans jamais charger leurs sous-tâches. | Évolution | 9 |

### Écarts avec des décisions / livraisons antérieures

- **#26 vs #6 / #8 (livrées v5.56)** : #6/#8 ont défini « Mon compte » comme un **poste déduit**
  du Montant total (revenus − livrets − prévisions Mon compte), d'où l'affichage actuel en
  négatif/rouge. #26 demande un affichage positif/vert sur la carte. Marie est propriétaire du
  produit : revirement d'affichage assumé. Tension à trancher sur la ligne de détail du Montant
  total (`E71Budget.tsx:93`) — voir décisions produit.
- **#29 vs #17 (livrée v5.56)** : #17 (« Valider ferme et revient à l'accueil ») est satisfaite
  (`E31EnergyCheckIn.tsx:28`). #29 étend au bouton « Retour » (et « ignorer »), qui pointent
  encore vers « Mon énergie ». Complément, pas contradiction.
- **#30 / #31 vs #2 (livrée v5.58)** : #2 a livré le réglage de couleur par outil dans
  Paramètres > Accessibilité. #30 corrige la non-application sur l'accueil, #31 corrige
  l'absence de la carte « Comptes » dans la liste. Compléments d'un travail livré incomplet.
- **#32 recoupe #3** (`en attente`, correctif v5.64 jugé insuffisant le 2026-08-31) : même
  symptôme de débordement horizontal, probablement même cause. Traités ensemble en Phase 10.
- **#25 recoupe #1 (livrée v5.45)** : #1 = hauteur de case ∝ durée (déjà en place,
  `ROW_HEIGHT_PER_MINUTE`). #25 s'appuie dessus pour positionner l'heure de fin en bas de case.

## Décisions produit non tranchées

À confirmer avec Marie, ou trancher en implémentation + validation manuelle. Ne pas coder
avant arbitrage sur les points marqués « bloquant ».

1. **#25 — périmètre de la durée obligatoire** (TRANCHÉ 2026-09-02, Marie via Discord) : durée
   obligatoire **uniquement pour les tâches planifiées** (avec horaire). Une tâche d'inbox reste
   créable sans durée. Marie a répondu « seulement planning » à la question du 2026-09-02.
   `canSubmit` de `E21CreateTaskV2` / `E24EditTask` : exiger `durationMinutes` seulement quand
   `isPlanned`.
2. **#25 — durée par défaut / saisie** (non bloquant) : proposer une durée pré-remplie
   (ex. 30 min) plutôt qu'un champ vide bloquant, pour ne pas alourdir la création. À régler en
   implémentation, gate = test manuel Marie.
3. **#26 — ligne de détail du Montant total** (TRANCHÉ 2026-09-02, utilisateur) : la ligne
   « … · −X mon compte » (`E71Budget.tsx:93`) **reste en négatif**. Seule la carte « Mon
   compte » (`:106-108`) passe en positif + vert, comme « Mes livrets ». La ligne décrit une
   soustraction, la garder cohérente avec le calcul.
4. **#27 — cohabitation de deux écrans « Mon compte »** (TRANCHÉ 2026-09-02, utilisateur) :
   `E75BudgetAccount` (route `budget-account`, ouvert depuis l'accueil) est renommé « Mon
   compte » (#27). `E78BudgetPrevisions` (route `budget-previsions`, ouvert depuis la page
   Budget, prévisions pures) est renommé **« Prévisions »** pour lever l'ambiguïté.
5. **#31 — « Comptes » : vrai outil ou cas particulier** (TRANCHÉ 2026-09-02, utilisateur) :
   **câblage particulier**. « Mon compte » reste une carte codée en dur ; on ajoute une entrée
   fixe dans « Couleur des outils » et on stocke sa couleur dans les réglages. Pas de migration
   de schéma (local + Supabase de Marie). La demande « même les nouveaux outils » est déjà
   satisfaite pour les vraies entités `Tool`.
6. **#29 — devenir de l'écran « Mon énergie » (E30)** (TRANCHÉ 2026-09-02, Marie via Discord) :
   **suppression complète de E30**. Marie a répondu « retirer » à la question du 2026-09-02.
   Retirer l'écran `E30EnergyView`, sa route `energy-view` (`navigation.ts`, `App.tsx`,
   `DevResetButton.tsx`) et tous les accès entrants (`rg -n "energy-view" src` avant de coder).
7. **#32 — reproduction** (TRANCHÉ 2026-09-03) : captures reçues de Marie (transmission
   manuelle, archivées sous `COMMUNICATION/Marie/captures/2026-09-03/`, commit 9f03d5d).
   `parametres-accessibilite_deborde.png` : le débordement est dans **Paramètres >
   Accessibilité uniquement** (précision Discord de Marie du 2026-09-03 17h17). Phase 10
   débloquée.

## Ordre et dépendances

```
Phase 1  — #23 : texte des tâches sans couleur lisible une fois cochées   (bug, isolé)
Phase 2  — #30 : couleur d'outil appliquée sur la carte d'accueil          (bug, isolé)
Phase 3  — #24 + #25 : nom + heure de début en haut de case, heure de fin en bas, durée obligatoire
Phase 4  — #27 : renommage « Comptes » → « Mon compte »                    (label)
Phase 5  — #28 : total en tête de « Mon compte », décrémenté par les dépenses   (dépend de 4)
Phase 6  — #26 : « Mon compte » en positif + vert dans la page Budget
Phase 7  — #31 : « Comptes » dans les réglages de couleur des outils       (dépend de 2 et 4)
Phase 8  — #29 : retour depuis la modification d'énergie → accueil
Phase 9  — #33 : sous-tâches d'un élément de liste dans la page de catégorie
Phase 10 — #3 + #32 : reprise des débordements horizontaux (formulaire tâche + écran Paramètres)
```

Phases 1, 2, 3, 6, 8, 9 sont mutuellement indépendantes. Phase 5 dépend de 4 (nom stable).
Phase 7 dépend de 2 (mécanisme d'application de couleur sur l'accueil) et de 4 (nom « Mon
compte »). Phase 10 est en dernier car elle attend une capture de Marie et n'est pas bloquante
pour le reste.

---

## Phase 1 — #23 : texte des tâches sans couleur lisible une fois cochées [FAIT]

**Objectif** : une tâche du planning sans couleur choisie, une fois cochée, garde son texte en
`var(--color-text)` (noir en clair) barré — pas en blanc.

**Fichiers pressentis**
- `src/ui/styles/ambiance.ts` : `plannedTaskTintStyle(completed, color)` — ne forcer `#fff`
  que si la couleur effective n'est pas « surface / aucune couleur ». Introduire une notion de
  couleur « neutre » (comparaison à `var(--color-surface)` / `null`), ou passer la couleur
  brute de la tâche (`null`) plutôt que le fallback `'var(--color-surface)'` et décider ici.
- `src/ui/screens/dashboard/PlanningBoard.tsx` : `rowTintStyle` (`:199-201`) — revoir le
  fallback passé (`block.item.color ?? 'var(--color-surface)'`).
- Vérifier le rendu « terminé » ailleurs si `plannedTaskTintStyle` est réutilisé
  (`rg plannedTaskTintStyle src`).

**Tests automatisés**
- `ambiance.test.ts` (créer si absent) : `plannedTaskTintStyle(true, <neutre>)` → `color` non
  blanc, `textDecoration: 'line-through'` ; `plannedTaskTintStyle(true, '#c0392b')` → `#fff`.
- `PlanningBoard.test.tsx` : une tâche sans couleur cochée rend un texte de couleur héritée /
  `var(--color-text)`, pas `#fff`.

**Test manuel Marie** : parcours catalogue `couleur-tache-sans-couleur-choisie` — le versionner
(`revision +1`) pour le remettre dans « Tests à faire », énoncé « cocher une tâche sans couleur,
le texte doit rester lisible (noir barré) ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours mis à jour ; entrée `WHATS_NEW`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — #30 : couleur d'outil appliquée sur la carte d'accueil [FAIT]

**Objectif** : quand une couleur d'outil est réglée dans Paramètres > Accessibilité, la carte
de cet outil sur l'accueil prend cette couleur (aujourd'hui elle reste blanche).

**Fichiers pressentis**
- `src/ui/screens/dashboard/E10Dashboard.tsx` (`:145-154`) : le `rootTools.map` rend un
  `<Card>` nu ; soit utiliser le composant `ToolCard` (`ToolWidgetCard.tsx`), soit appliquer
  `style={tool.color ? { backgroundColor: pastelBackground(tool.color) } : undefined}` comme
  lui. Attention au `widgetBtnStyle` (fond transparent du bouton interne — OK).
- Vérifier la cohérence visuelle avec les cartes « Comptes » et dossiers (`📁`) voisines dans
  la même grille.

**Tests automatisés**
- `E10Dashboard.test.tsx` : un outil avec `color` défini → la carte porte
  `background-color` = `pastelBackground(color)` ; sans couleur → pas de fond custom.

**Test manuel Marie** : parcours `couleur-de-fond-par-outil` — versionner et reformuler pour
couvrir « la carte sur l'accueil change de couleur, pas seulement le réglage ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours à jour ; `WHATS_NEW`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — #24 + #25 : mise en page verticale de la case du planning + durée obligatoire [FAIT]

**Décision produit 1 tranchée** (2026-09-02, Marie) : durée obligatoire **pour les tâches
planifiées uniquement**.

**Objectif**
- Le nom de la tâche est toujours en haut de la case, y compris pour les grandes cases (#24).
- L'heure de début est en haut de la case, l'heure de fin en bas, alignées, l'écart vertical
  suivant la durée (#25).
- Impossible de créer une tâche planifiée sans durée (#25).

**Fichiers pressentis**
- `src/ui/screens/dashboard/PlanningBoard.tsx` :
  - `rowStyle` (`:143-165`) : passer d'un flex `row / center` à une structure où la colonne
    titre est ancrée en haut (`alignItems: 'flex-start'`), l'heure de fin poussée en bas
    (`justify-content: space-between` sur un axe vertical interne, ou `margin-top: auto`).
  - Rendu de la ligne (`:524-574`) : afficher `scheduled_start` en haut et
    `scheduled_end` en bas ; garder `timeLabelStyle`. Gérer le cas `scheduled_end` absent
    (tâches anciennes) — repli sur début + durée, ou masquer.
  - Cohérence avec `E12WeekPlanning.tsx` (vue semaine, cases icône seule — a priori non
    concernée, à vérifier).
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` :
  - `canSubmit` (`:148`) : ajouter `durationMinutes != null && durationMinutes > 0` (selon la
    décision 1 : conditionné à `isPlanned` ou non).
  - Message d'aide sous le `DurationRoller` (`:323-324`) quand la durée manque.
  - Envisager une valeur par défaut non nulle (décision 2).
- `src/ui/screens/tasks/E24EditTask.tsx` : appliquer la même contrainte à l'édition.
- Vérifier que `createDetailedTask` / repositories calculent `scheduled_end` à partir de
  `startTime` + `durationMinutes` (`rg scheduled_end src/app src/domain`). Si non, l'ajouter.

**Tests automatisés**
- `PlanningBoard.test.tsx` : sur une case haute, le titre est rendu avant (DOM order) l'heure
  de fin ; l'heure de début et l'heure de fin sont toutes deux présentes.
- `E21CreateTaskV2.test.tsx` : bouton de validation désactivé tant que la durée n'est pas
  saisie (cas planifié) ; activé une fois une durée choisie.
- `E24EditTask.test.tsx` : idem à l'édition.
- Règle de calcul `scheduled_end` si ajoutée : test unitaire dédié.

**Test manuel Marie** : nouveaux parcours catalogue `nom-de-tache-en-haut-de-case` et
`heures-debut-fin-sur-la-case` ; parcours de création de tâche mis à jour (« la durée est
maintenant obligatoire »).

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours ajoutés ; `WHATS_NEW` (#24, #25).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — #27 : renommage « Comptes » → « Mon compte » [FAIT]

**Décision 4 tranchée** : E75 → « Mon compte », E78 → « Prévisions ».

**Objectif** : la carte de l'accueil et l'écran associé s'appellent « Mon compte » au lieu de
« Comptes ».

**Fichiers pressentis**
- `src/ui/screens/dashboard/E10Dashboard.tsx:135` : libellé du bouton.
- `src/ui/screens/tools/E75BudgetAccount.tsx:100` : `<h1>`, plus `aria-label` éventuels.
- `src/ui/screens/tools/E78BudgetPrevisions.tsx:49` : `<h1>` « Mon compte » → **« Prévisions »**
  (décision 4). Vérifier aussi le libellé du lien d'accès depuis `E71Budget.tsx:103-108`.
- `src/domain/data/manualTestsCatalog.ts` : parcours `utiliser-comptes` et libellés associés.
- `rg -n "Comptes" src` : balayer les autres occurrences (titres, aria-labels, tests).
- Route `budget-account` : nom technique conservé (pas de renommage de route).

**Tests automatisés**
- `E75BudgetAccount.test.tsx`, `E10Dashboard.test.tsx` : assertions de libellé mises à jour.

**Test manuel Marie** : parcours `utiliser-comptes` versionné, énoncé « l'outil s'appelle
maintenant Mon compte ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours à jour ; `WHATS_NEW` (#27).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — #28 : total en tête de « Mon compte », décrémenté par les dépenses [FAIT]

**Dépend de la Phase 4.**

**Objectif** : en haut de l'écran « Mon compte » (`E75BudgetAccount`), afficher la somme des
prévisions de toutes les sous-catégories, diminuée des dépenses de la période. Côté page
Budget, la même somme reste fixe (déjà le cas).

**Fichiers pressentis**
- `src/domain/rules/budgetRules.ts` : ajouter une fonction dédiée, ex.
  `getMonCompteSolde(categories, entries, referenceDate)` = `Σ getBudgetedAmount(cat, date)`
  − `Σ getSpentForCategory(entries, cat.id, bounds)` sur les périodes semaine + mois (attention
  au poids `getMonCompteWeight` déjà utilisé côté Budget ; décider si le solde applique le même
  ×4 hebdo ou raisonne par période affichée).
- `src/ui/screens/tools/E75BudgetAccount.tsx` : bloc total en tête (avant les colonnes
  Semaine/Mois), avec `amountTone` pour la couleur.
- Ne rien changer à `E71Budget.tsx` (la valeur « Mon compte » y reste `getMonComptePrevisions`,
  fixe).

**Tests automatisés**
- `budgetRules.test.ts` : `getMonCompteSolde` — sans dépense = somme des prévisions ; avec
  dépenses = somme diminuée ; catégories vides = 0.
- `E75BudgetAccount.test.tsx` : le total affiché diminue quand une dépense est ajoutée ;
  `E71Budget.test.tsx` : la valeur « Mon compte » de la page Budget ne bouge pas dans le même
  scénario.

**Test manuel Marie** : parcours `utiliser-comptes` (rev suivante) ou nouveau
`solde-mon-compte-decremente` — « ajouter une dépense diminue le total de Mon compte, pas celui
du Budget ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours ajouté ; `WHATS_NEW` (#28).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — #26 : « Mon compte » en positif + vert dans la page Budget [FAIT]

**Décision 3 tranchée** : la ligne de détail du Montant total (`E71Budget.tsx:93`) reste en
négatif ; seule la carte change.

**Objectif** : sur la page Budget, la carte « Mon compte » affiche un montant positif en vert,
comme « Mes livrets ».

**Fichiers pressentis**
- `src/ui/screens/tools/E71Budget.tsx:106-108` : afficher `formatEuro(monComptePrevisions)`
  (positif) avec `color: 'var(--color-success)'` au lieu de `amountTone(-monComptePrevisions)`.
- `:92-93` : ligne de détail du Montant total — selon décision 3, laisser
  `${formatEuro(-monComptePrevisions)} mon compte` ou l'ajuster.
- Vérifier que `getMontantTotal` (le calcul) reste inchangé : seul l'affichage bouge.

**Tests automatisés**
- `E71Budget.test.tsx` : la carte « Mon compte » rend une valeur sans signe « − » et la classe
  / couleur de succès ; `getMontantTotal` inchangé (test de règle existant conservé).

**Test manuel Marie** : parcours `utiliser-le-budget` versionné — « Mon compte s'affiche en
vert et en positif comme Livrets ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours à jour ; `WHATS_NEW` (#26).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 7 — #31 : « Comptes » dans les réglages de couleur des outils [FAIT]

**Dépend des Phases 2 et 4. Décision 5 tranchée** : câblage particulier, pas de migration.

**Objectif** : la carte « Mon compte » apparaît dans « Couleur des outils » (Paramètres >
Accessibilité) et sa couleur s'applique à sa carte d'accueil. Énoncé général de Marie (« tous
les outils, même les nouveaux ») : déjà vrai pour les entités `Tool`, à documenter.

**Fichiers pressentis** (hypothèse « cas particulier câblé », décision 5)
- `src/domain/entities/settings.ts` (ou équivalent) : un champ pour la couleur de « Mon
  compte » (ex. `mon_compte_color`), puisque ce n'est pas un `Tool`.
- `src/app/AppContext` : setter dédié, ou généraliser `updateToolColor` à une clé spéciale.
- `src/ui/screens/settings/E112Accessibility.tsx:116-154` : ajouter une entrée fixe « Mon
  compte » dans la carte « Couleur des outils », au-dessus ou en-dessous de la liste `tools`.
- `src/ui/screens/dashboard/E10Dashboard.tsx:133-137` : appliquer la couleur à la carte « Mon
  compte » (réutiliser le mécanisme de la Phase 2).
- Si décision inverse (vrai `Tool`) : prévoir une migration de données Dexie + Supabase — plus
  lourd, à cadrer séparément.

**Tests automatisés**
- `E112Accessibility.test.tsx` : l'entrée « Mon compte » est présente même sans aucun `Tool` ;
  changer sa couleur appelle le bon setter.
- `E10Dashboard.test.tsx` : la carte « Mon compte » prend la couleur configurée.

**Test manuel Marie** : parcours `couleur-de-fond-par-outil` (rev suivante) — « la carte Mon
compte a aussi un réglage de couleur ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours à jour ; `WHATS_NEW` (#31) ;
décision 5 tracée dans ce fichier.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 8 — #29 : retour depuis la modification d'énergie → accueil + suppression de E30 [FAIT]

**Décision produit 6 tranchée** (2026-09-02, Marie) : **suppression complète de E30
« Mon énergie »**.

**Objectif** : depuis l'écran de modification de l'énergie, « Retour » (et « ignorer »)
ramènent à l'accueil ; l'écran « Mon énergie » (E30) et sa route `energy-view` sont retirés.

**Fichiers pressentis**
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` : `:49` (`goTo('energy-view')` → `goTo('dashboard')`),
  `:33` (skip → `goTo('dashboard')`). `:28` déjà correct.
- `src/ui/screens/energy/E30EnergyView.tsx` : **supprimer** le fichier + sa route `energy-view`
  (`navigation.ts`, `App.tsx`, `DevResetButton.tsx`).
- `rg -n "energy-view" src` : recenser et retirer tous les accès entrants avant suppression.

**Tests automatisés**
- `E31EnergyCheckIn.test.tsx` : « Retour » et « ignorer » appellent `goTo('dashboard')`.
- E30 retirée : nettoyer `App.test.tsx` / tests de navigation, supprimer `E30EnergyView.test.tsx`.

**Test manuel Marie** : parcours `consulter-et-modifier-l-energie` versionné — « depuis la
modification, Retour ramène direct à l'accueil ».

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours à jour ; `WHATS_NEW` (#29) ;
décision 6 tracée.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 9 — #33 : sous-tâches d'un élément de liste dans la page de catégorie [FAIT]

**Objectif** : dans la page d'une catégorie de liste, chaque élément qui a des sous-tâches les
affiche en dessous, pliables/dépliables et cochables, comme les sous-étapes d'une tâche du
planning.

**Fichiers pressentis**
- `src/ui/screens/lists/E61ListDetail.tsx` : charger les sous-tâches des `currentItems`
  (`getListItemSubTasks` par élément, ou un batch si disponible) ; état `expandedIds` local ;
  rendre une liste pliable sous chaque élément avec cases à cocher (`toggleListItemSubTask`).
  S'inspirer du bloc sous-tâches de `PlanningBoard.tsx:576-593` pour l'ergonomie (chevron
  ▸/▾, `done/total`).
- `src/app/AppContext` : vérifier qu'un accès groupé aux sous-tâches existe ou l'ajouter pour
  éviter N appels.
- `src/domain/rules/listItemSortRules.ts` : rien a priori, mais vérifier l'ordre.

**Tests automatisés**
- `E61ListDetail.test.tsx` : un élément avec sous-tâches affiche un contrôle plier/déplier ;
  déplié, les sous-tâches sont listées ; cocher une sous-tâche appelle `toggleListItemSubTask`
  et barre le libellé ; un élément sans sous-tâche n'affiche pas le contrôle.

**Test manuel Marie** : nouveau parcours `sous-taches-element-liste-dans-la-categorie`.

**Critère de sortie** : `tsc -b` + lint + suite verts ; parcours ajouté ; `WHATS_NEW` (#33).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 10 — #3 + #32 : reprise des débordements horizontaux [FAIT — non déployée, gate restant = validation sur l'appareil de Marie]

**Décision produit 7** : TRANCHÉE le 2026-09-03 — captures reçues de Marie (voir « Décisions
produit non tranchées » ci-dessus).

### Analyse des captures (2026-09-03)

Captures : `COMMUNICATION/Marie/captures/2026-09-03/parametres-accessibilite_deborde.png` et
`.../formulaire-tache_date-heure-deborde.png`.

- **#32 — Paramètres > Accessibilité** : toutes les cartes (« Réduire les animations »,
  « Mode sombre », « Couleur d'ambiance », bloc « Couleur des outils ») sont coupées au bord
  droit, marge droite nulle alors que la marge gauche est nette ; pastilles de couleur et « × »
  poussées hors champ ; bouton « Grande » de la rangée « Taille du texte » également tronqué.
  Le contenu est plus large que la fenêtre ; `body { overflow-x: clip }` masque le scroll
  horizontal sans corriger. Débordement limité à la rubrique Accessibilité (précision de Marie).
- **#3 — formulaire de tâche** : grille « Coût en énergie » — 6e et 12e case coupées ; champs
  natifs « Date » et « Heure de début » coupés au bord droit. La rangée « Durée »
  (Jours/Heures/Minutes), « Obligatoire », « Tâche récurrente » et « Valider » tiennent dans le
  cadre. Le `min-width: 0` sur `<form>` (v5.64) n'a pas suffi : la grille 6 colonnes
  (`repeat(6, 1fr)`, `1fr` = `minmax(auto, 1fr)`) et les `<input>` natifs ne rétrécissent pas
  sous leur largeur intrinsèque et débordent `<main>` (lui-même sans `width` explicite comme
  enfant flex de `#root`).

### Correctif appliqué (arbre de travail, non commité au 2026-09-03)

- `src/ui/screens/settings/E110Settings.tsx`, `E111Profile.tsx`, `E112Accessibility.tsx`,
  `E116Privacy.tsx`, `E117Export.tsx` : `width: '100%'` sur le conteneur `<main>` (déjà
  `maxWidth: 480` + `margin: 0 auto`).
- `src/ui/screens/settings/E112Accessibility.tsx` : `flexWrap: 'wrap'` sur la rangée
  « Petite / Normale / Grande ».
- `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `E24EditTask.tsx` : `width: '100%'` sur `pageStyle`
  et sur le `<form>` (`minWidth: 0` conservé) ;
  `gridTemplateColumns: 'repeat(6, minmax(0, 1fr))'` sur `energyGridStyle`. Les `<input>`
  Date/Heure ont déjà `maxWidth: 100%` + `minWidth: 0` (v5.64).

### Tests automatisés (faits)

`E110Settings.test.tsx`, `E112Accessibility.test.tsx`, `E21CreateTaskV2.test.tsx`,
`E24EditTask.test.tsx` : assertions de style (`width: 100%` sur `<main>` / `<form>`,
`maxWidth: 480px`, `flexWrap: wrap` sur la rangée de taille de texte, `maxWidth`/`minWidth` sur
les inputs Date/Heure). `tsc -b`, lint et la suite (719 tests) verts au 2026-09-03.

**Test manuel Marie** : `cadre-date-heure-dans-l-ecran` (révision 1, étapes élargies) +
nouveau `cadres-parametres-tiennent-dans-l-ecran` (`docRefs: [32]`) — ajoutés au catalogue.
Gate = validation sur l'appareil de Marie (jsdom ne mesure pas le layout réel).

**Critère de sortie** : `tsc -b` + lint + suite verts (fait) ; parcours à jour (fait) ;
`WHATS_NEW` (#3, #32) (fait) ; commit du correctif ; registre
`_contexte/marie_modifications_suivi.md` : #3 et #32 repassées à `livrée vX.Y` une fois Marie
ok (au `/close` / `/deploy`, pas en session).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite.

---

## Communication Marie

`COMMUNICATION/Marie/a_transmettre.md` : une entrée par phase passée à `[FAIT]`, préfixée du
numéro de demande (`#23 — …`), en français simple, sans jargon. Rangée sous « Changements
livrés », « Questions où nous avons besoin de ton choix » (décisions 1, 3, 6 ci-dessus si non
tranchées), ou « Écart assumé ». Aucune liste de tests (catalogue in-app uniquement).

## Après la dernière phase

Les 10 phases `[FAIT]` au 2026-09-03 (non déployées). Roadmap à archiver dans `Archives/` au
prochain `/deploy` réussi. Reconciliation registre : #23-#31, #33 → `livrée vX.Y` au déploiement ;
#3 et #32 → `livrée vX.Y` seulement après validation de Marie sur son appareil.
