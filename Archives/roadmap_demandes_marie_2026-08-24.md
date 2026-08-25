# Roadmap — Demandes Marie, Google Doc « Modifications » (24 août 2026)

Source : Google Doc `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`, analysé le 24 août 2026 (compte `rayonnetoi@gmail.com`, dossier Drive `Projets/Appli/`, fichier « Modifications »).

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase ajouté au catalogue · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Périmètre

Ce même document (« Modifications ») a déjà été partiellement traité par deux roadmaps précédentes :
- `roadmap_demandes_marie_v1.md` (18/08/2026, alors en PDF) : a écarté en bloc la section Budget et le point Listes « ajouter une catégorie tronqué » comme obsolètes (ancien modèle d'écran).
- `roadmap_retours_marie_2026-08-23.md` (24/08/2026, alors en PDF) : a traité couleur de tâche, retour de détail de liste, tests déjà validés, couleur d'outil (tout livré, v5.52) ; a de nouveau classé le Budget « hors périmètre » pour le même motif.

Cette roadmap traite les points **encore non couverts**, en particulier une reprise du bloc Budget : la vérification du code réel effectuée cette session (pas seulement de l'écran) montre que la logique de calcul actuelle ne correspond toujours pas à la demande de Marie (dépenses réelles affichées au lieu des montants prévus), indépendamment de la maquette d'écran désormais obsolète. Ce point avait été écarté deux fois sur la base de l'écran uniquement — il est réouvert ici sur la base du comportement, pas de l'apparence.

Marie a numéroté ses demandes dans le document (1 à 17) après le premier passage de cette session. Comparé à la version lue initialement, deux points ont disparu de sa liste en le faisant : « encadrement + glissement du planning » (Accueil/Planning) et « ajouter modifier » (Tâches) — cohérent avec le fait que ces deux points sont déjà satisfaits dans le code actuel. Le n° de chaque demande encore présente est repris ci-dessous pour la traçabilité.

## Analyse du Google Doc

| N° | Catégorie | Demande | État constaté (code lu cette session) | Traitement |
| --- | --- | --- | --- | --- |
| 1 | Accueil/Planning | Hauteur de case proportionnelle à la durée | Déjà livré (v5.45), non re-vérifié cette session | Aucun — hors périmètre |
| 2 | Accueil/Planning | Couleur des cases outils, réglable par outil dans les paramètres | Déjà livré (v5.52), non re-vérifié cette session | Aucun — hors périmètre |
| 3 | Tâches | Débordement cadre Date/Heure | Code actuel symétrique et contraint (`DurationRoller.tsx:8-32`, `E21CreateTaskV2.tsx:291-325`) — Marie a annoté ce point « à réfléchir », signe qu'elle n'est pas certaine que ce soit réglé | Aucun correctif — à confirmer visuellement si le défaut persiste réellement |
| 4 | Tâches | Retirer « tâche du jour »/« planifier »/« liste »/« terminer » | Les 8 boutons sont tous affichés (`E22TaskDetail.tsx:569-596`) | Phase 1 |
| 5 | Tâches | Garder « décomposer »/« dupliquer » | « Décomposer » et « Dupliquer » déjà présents, à conserver | Phase 1 |
| 6 | Budget | Formule « Montant total » = revenus − prévisions « mon compte » − livrets | Structure correcte, mais « mon compte » utilise les dépenses réelles (`budgetRules.ts:87-94`) | Phase 2 |
| 7 | Budget | Pas de transactions sous « Montant total », accès en cliquant sur la case | Carte déjà sans liste de dépenses ; le clic n'ouvre que la liste des revenus | Décision produit à trancher (voir ci-dessous), non planifiée |
| 8 | Budget | « Mon compte » doit afficher les prévisions ×4/semaine, pas les dépenses | Confirmé pas fait (`E71Budget.tsx:108-110`, `E75BudgetAccount.tsx:59-73`) | Phase 2 |
| 9 | Budget | Reset des prévisions au 1er du mois | Aucun mécanisme trouvé | Phase 2 |
| 10 | Budget | Sur cette page (Mon compte), uniquement les prévisions, aucune dépense | Confirmé pas fait, mêmes fichiers que #8 | Phase 2 |
| 11 | Budget | Clic sur une case de catégorie modifie le montant prévu, valable seulement pour la semaine en cours | Non vérifié en détail cette session (`E73CategoryDetail.tsx` non audité) | Phase 2 (à qualifier) |
| 12 | Budget | Écran « Outils : Comptes » depuis l'accueil, avec jauge prévisions/dépenses | Existence et cible de navigation du tool « Comptes » non confirmées cette session | Phase 2 (à qualifier — voir décision architecture) |
| 13 | Budget | Retirer « ajouter une dépense » indépendant, ajout via clic catégorie sans re-sélection | Bouton toujours présent, re-sélection de catégorie requise (`BudgetExpenseModal.tsx`, `E75BudgetAccount.tsx:83-146`) | Phase 3 (dépend de Phase 2) |
| 14 | Budget | Récap : Budget = prévisions pures, Comptes = prévisions − dépenses | Résume 6-13 ; confirme la séparation Budget/Comptes | Phase 2 (architecture) |
| 15 | Listes | Suppression de catégorie ne supprime plus tout l'outil | Déjà fait, confirmé (`E61ListDetail.tsx:140-147`) | Aucun |
| 16 | Listes | Écran « ajouter une catégorie » tronqué | Formulaire inline sans protection de largeur explicite — déjà classé « probablement obsolète » en v1, jamais reconfirmé par Marie depuis | Phase 4 — reproduction seulement |
| 17 | Énergie | Fermeture directe sur l'accueil après « Valider » | Écran intermédiaire « Mon énergie » (bouton « Modifier ») toujours présent (`E31EnergyCheckIn.tsx:20-34`, `E30EnergyView.tsx`) | Phase 5 |

Hors numérotation (déjà livré, retiré du document par Marie lors de la renumérotation) : encadrement + glissement du planning (Accueil/Planning), ajout du bouton « Modifier » (Tâches). Le détail d'élément de liste avec description/sous-tâches (déjà livré v5.51) reste hors périmètre bien que non explicitement listé dans le document renuméroté.

## Décisions produit non tranchées

- **#7 — Contenu de « cliquer sur Montant total »** : décision reçue le 25/08 : ne rien changer. Le modal conserve son contenu actuel.
- **#12/#14 — Séparation Budget (prévisions pures) / Comptes (prévisions − dépenses)** : le document distingue « Outils : Budget » et « Outils : Comptes » comme deux espaces différents, avec une jauge sur « Comptes ». Le code actuel n'a qu'un seul tool Budget avec un sous-écran « Mon compte » — l'existence et la cible de navigation d'un tool « Comptes » séparé ne sont pas confirmées. Phase 2 clarifiera l'architecture cible avant de coder.

## Ordre et dépendances

```
Phase 1 (menu tâche) ── indépendante
Phase 2 (Budget : prévisions vs dépenses + reset mensuel) ── indépendante, la plus lourde
    └── Phase 3 (retrait « ajouter une dépense ») ── dépend de Phase 2
Phase 4 (Listes : reproduction écran tronqué) ── indépendante
Phase 5 (Énergie : fermeture directe) ── indépendante
Phase 6 (validation et préparation de livraison) ── dépend de 1 à 5
```

---

## Phase 1 — Menu d'actions de tâche simplifié [FAIT]

- [x] Sur `E22TaskDetail.tsx`, retirer les boutons « Tâche du jour », « Planifier », « Liste » de la fiche de détail d'une tâche.
- [x] Conserver « Décomposer », « Dupliquer », « Modifier », « Supprimer ». Décision utilisateur : « Supprimer » (non mentionné par Marie) est conservé.
- [x] Vérifié qu'aucune des actions retirées ne perd son point d'entrée : « Tâche du jour » et « Planifier » sont dupliqués dans `E20Inbox.tsx:153-166`. Décision reçue le 25/08 : « Terminer » est retiré ; les tâches concernées sont planifiées et se terminent en les cochant dans le planning.
- [x] Tests de `E22TaskDetail.tsx` mis à jour (suppression du test « Planifier », ajout d'un test vérifiant l'absence des 4 boutons retirés). Suite complète verte (74 fichiers, 605 tests), `tsc -b` et lint clean.
- [x] Test manuel ajouté au catalogue (`menu-actions-tache-simplifie`).

Critère de sortie : la fiche de détail d'une tâche n'affiche que Décomposer/Dupliquer/Modifier/Supprimer ; aucune fonctionnalité perdue ailleurs dans l'app.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Budget : prévisions plutôt que dépenses réelles [FAIT]

Bloc le plus lourd de cette roadmap — touche le cœur du calcul Budget (`budgetRules.ts`) et plusieurs écrans qui en dépendent.

- [x] Architecture tranchée avec l'utilisateur (#12/#14). Constat de code : aucun tool « Comptes » séparé n'existait ; un seul tool « Budget » avec sous-écrans en drill-down, plus un widget dashboard « Comptes » qui ouvrait jusqu'ici directement la saisie rapide de dépense. Décision : ce widget « Comptes » navigue désormais vers l'écran existant prévu/dépensé/jauge (`E75BudgetAccount.tsx`, route `budget-account`), sans créer de nouveau système de tool. Conflit détecté en cours de route entre #8/#10 (« Mon compte » = prévisions seules) et #14 (« Comptes » = prévisions − dépenses), qui ciblaient le même écran : résolu en créant un nouvel écran dédié `E78BudgetPrevisions.tsx` (route `budget-previsions`) pour « Mon compte » au sein du tool Budget, pendant que `E75BudgetAccount.tsx` (inchangé dans son contenu, renommé « Comptes », retour vers l'accueil) reste la cible du widget dashboard.
- [x] **Écart avec `roadmap_budget_v3.md`** (livrée le 17/08, confirmée par Marie à l'époque via `Archives/message_marie_budget_refonte.md`) : cette roadmap avait délibérément basé « Montant total » et « Mon compte » sur les dépenses réelles. Le document du 24/08 demande l'inverse. Confirmé avec l'utilisateur que le document du 24/08 fait foi (retour d'usage après la livraison de la v3) : le calcul repasse sur les prévisions.
- [x] `budgetRules.ts` : `getMonCompteUsage` (dépenses réelles pondérées) remplacée par `getMonComptePrevisions` (montants prévus par catégorie, ×4 si hebdomadaire) ; `getMontantTotal` mise à jour en conséquence (#6, #8, #10).
- [x] `E71Budget.tsx` : tuile « Mon compte » et détail du « Montant total » basés sur les prévisions ; la tuile navigue vers le nouvel écran `budget-previsions`.
- [x] Nouvel écran `E78BudgetPrevisions.tsx` : « Mon compte » affiche Semaine/Mois côte à côte, montant prévu par sous-catégorie uniquement (aucune dépense, aucune jauge) (#8, #10).
- [x] `E75BudgetAccount.tsx` renommé « Comptes », reste inchangé sur le fond (prévu/restant/jauge par sous-catégorie, ajout de dépense), reste la cible du widget dashboard « Comptes » (#12, #14).
- [x] `E10Dashboard.tsx` : widget « Comptes » navigue vers l'écran au lieu d'ouvrir la saisie rapide ; code mort retiré (modale de saisie rapide, message « aucune catégorie »).
- [x] #9 (reset des prévisions au 1er du mois) résolu comme effet de bord du passage aux prévisions : les montants prévus sont des valeurs statiques par catégorie, recalculées à chaque affichage, sans aucune accumulation dans le temps — il n'y a donc plus rien à remettre à zéro. Aucun mécanisme de reset séparé n'a été ajouté (aurait été de la sur-ingénierie sans utilité).
- [x] **#11 transféré** : décision reçue le 25/08 : une modification de montant prévu doit s'appliquer jusqu'à la fin de la semaine de la catégorie sélectionnée, puis le montant habituel doit reprendre. Le périmètre des catégories mensuelles reste à confirmer avec Marie ; la décision et l'implémentation sont transférées à la roadmap des retours du 25/08.
- [x] Tests : `budgetRules.test.ts`, `E71Budget.test.tsx`, `E75BudgetAccount.test.tsx`, `E10Dashboard.test.tsx` mis à jour ; nouveau `E78BudgetPrevisions.test.tsx`. Suite complète verte (75 fichiers, 610 tests), `tsc -b` et lint clean.
- [x] Tests manuels : `utiliser-le-budget` mis à jour (Mon compte = prévisions seules) ; nouveau test `utiliser-comptes` (widget Comptes, vérifie explicitement que le Montant total ne bouge pas après une dépense).

Critère de sortie : « Montant total » et « Mon compte » reflètent les prévisions (pas les dépenses réelles) ; rien à remettre à zéro chaque mois, les prévisions étant déjà statiques.

Écarts assumés à mentionner dans le fichier de commentaires : #7 ne change pas (décision reçue le 25/08) ; #9 satisfait sans mécanisme dédié (explication ci-dessus) ; #11 reste à implémenter dans une phase dédiée ; le choix « Comptes = widget inchangé » de `roadmap_budget_v3.md` est explicitement abandonné au profit du document du 24/08.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Ajout de dépense directement depuis une catégorie [FAIT]

Dépend de Phase 2.

- [x] Retiré le bouton indépendant « Ajouter une dépense » de l'écran « Comptes » (`E75BudgetAccount.tsx`), ainsi que la modale et l'état associés (`createBudgetEntry` n'y est plus utilisé).
- [x] `BudgetExpenseModal.tsx` : remplacé les props `categories`/`defaultCategoryId` (avec pastilles de sélection) par une prop unique `category` (catégorie déjà déterminée par l'appelant) ; le sélecteur de catégorie a été entièrement retiré du composant, `onSubmit` ne transmet plus l'id de catégorie (déjà connu de l'appelant).
- [x] `E73CategoryDetail.tsx` (fiche de catégorie, point d'entrée déjà existant via le clic sur une sous-catégorie dans « Comptes », inchangé) : ajout du bouton « Ajouter une dépense » et de la modale, catégorie pré-déterminée par l'écran, sans champ de sélection. Le clic sur une catégorie garde donc son comportement (ouverture de la fiche), qui porte maintenant aussi l'ajout de dépense — aucun point d'entrée perdu (fiche catégorie : renommer/modifier montant/supprimer/historique inchangés).
- [x] Tests : `E75BudgetAccount.test.tsx` (retrait des deux tests de saisie de dépense, ajout d'un test confirmant l'absence du bouton), `E73CategoryDetail.test.tsx` (nouveau test de saisie de dépense sans sélecteur). Suite complète verte (75 fichiers, 610 tests), `tsc -b` et lint clean.
- [x] Test manuel `utiliser-comptes` mis à jour (le parcours « Ajouter une dépense » passe désormais par la fiche de catégorie, pas par un bouton sur l'écran Comptes).

Critère de sortie : il n'existe plus de bouton « Ajouter une dépense » générique ; ajouter une dépense se fait uniquement via le clic sur une catégorie (fiche catégorie), sans re-sélection de catégorie dans le formulaire.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Listes : écran « ajouter une catégorie » (reproduction) [FAIT]

Point déjà classé « probablement obsolète » dans `roadmap_demandes_marie_v1.md` (écran plein-page du PDF remplacé par un formulaire inline) mais jamais reconfirmé par Marie depuis. Reproduction uniquement, pas de correctif à l'aveugle.

- [x] Rejouer le parcours « Ajouter une catégorie » dans un outil de type liste sur mobile (clavier virtuel ouvert), avec plusieurs tailles d'écran.
- [x] Débordement reproduit à 320, 375 et 430 px : l'écran conservait une largeur de 480 px et tronquait le formulaire. `E61ListDetail.tsx` contraint maintenant l'écran à la largeur disponible et empile le champ puis les actions.
- [x] Test de régression ajouté dans `E61ListDetail.test.tsx` ; test manuel `ajouter-une-categorie-de-liste-sur-mobile` ajouté au catalogue.

Critère de sortie : reproductible et corrigé. Le formulaire ne déborde plus à 320, 375 et 430 px, y compris avec une hauteur d'écran réduite simulant le clavier ouvert.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Énergie : fermeture directe après validation [FAIT]

- [x] Dans `E31EnergyCheckIn.tsx`, après `confirm()`/`saveTodayEnergy`, naviguer directement vers le dashboard au lieu de `energy-view`.
- [x] `E30EnergyView.tsx` (« Mon énergie ») garde un point d'entrée via le badge énergie de l'accueil. Il permet de consulter l'état du jour puis de choisir « Modifier » ; l'écran n'est pas mort.
- [x] Tests de `E31EnergyCheckIn.tsx` et `E10Dashboard.tsx` mis à jour.
- [x] Test manuel `consulter-et-modifier-l-energie` mis à jour.

Critère de sortie : cliquer sur « Valider » lors du choix d'énergie ramène directement à l'accueil.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Validation et préparation de livraison [FAIT]

- [x] Suite complète exécutée : 75 fichiers, 611 tests verts ; `tsc -b` et lint verts.
- [x] `manualTestsCatalog.ts` est à jour pour les comportements modifiés (actions de tâche, Budget/Comptes, ajout de catégorie de liste sur mobile, énergie).
- [x] `COMMUNICATION/Marie/a_transmettre.md` mis à jour, une entrée simple par demande livrée.
- [x] Entrée `v5.56` ajoutée au changelog.
- [x] `/deploy` à proposer à l'utilisateur.

Critère de sortie : contrôles automatisés verts, tests manuels rejoués, documentation alignée, fichier de commentaires Marie à jour.
