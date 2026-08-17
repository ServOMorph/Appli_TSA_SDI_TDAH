# Roadmap — Refonte Budget v3

Catégorie Marie : **Outils : Budget**
Demande initiale et confirmation intégrale : `message_marie_budget_refonte.md`

## Résumé du besoin confirmé par Marie
- Accueil inchangé : dossiers « Budget » et « Comptes » séparés.
- Budget non configuré : un seul bouton « Configurer le budget » → saisie des revenus du
  mois → « Montant total ». Une fois configuré, bouton devenu « Modifier le budget »,
  accès complet aux entrées de « Montant total » (modification/suppression).
- « Montant total » réparti vers « Mon compte » ou un « Livret » (deux cases, même ligne,
  sous « Montant total »).
- Livrets créés en amont (paramètres). Clic sur un livret → montant/motif/date, retire du
  « Montant total », ajoute au livret. Transactions modifiables.
- « Mon compte » : sous-catégories (ex. courses, plaisir) rangées en « Semaine » ou « Mois ».
  Clic → montant/date/motif/sous-catégorie. Effet sur « Montant total » : sous-catégorie
  « Mois » retire le montant une fois ; sous-catégorie « Semaine » retire le montant × 4,
  à chaque dépense ajoutée.
- Affichage : Montant total centré en haut ; en dessous, même ligne, Mon compte / Mes
  livrets. Clic Mon compte → Semaine et Mois côte à côte, sous-catégories dessous (montant
  prévu/restant par sous-catégorie, pas de total Semaine/Mois). Clic Mes livrets → liste
  des livrets ou proposition de configuration si aucun.
- Totaux affichés uniquement pour : Montant total, Mon compte, Mes livrets (somme), chaque
  livret, chaque sous-catégorie.
- Jauge de progression des dépenses (actuelle `BudgetGauge`) conservée, appliquée par
  sous-catégorie (confirmé par Marie — pas de jauge globale dans le nouvel écran).
- « Comptes » (widget accueil, raccourci saisie dépense) : aucun changement.

## Phase 1 — Modèle de données & règles métier [FAIT]
- `BudgetCategoryKind` : retirer la valeur morte `'income'` (plus aucune écriture ni lecture
  ne l'utilise depuis la Phase 4 de `roadmap_budget_v2.md`).
- `BudgetDeposit` : ajouter `label?: string` (motif) ; retirer le champ `period` (non
  pertinent pour un livret, résidu de l'ancien modèle fusionné).
- Migration Dexie correspondante (retrait `period` sur `budgetDeposits`, valeurs existantes
  conservées sans perte de données).
- `budgetRules.ts` : remplacer `getTotalAccountUsage`/conversion par nombre réel de semaines
  du mois par la nouvelle règle fixe : dépenses catégorie « mois » soustraites ×1, dépenses
  catégorie « semaine » soustraites ×4, appliqué par transaction (`BudgetEntry`) et non plus
  par montant budgété. `getMontantTotal` mis à jour en conséquence.
- Tests unitaires des règles modifiées et de la migration.
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 565/565 tests, `tsc -b` et lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Configuration initiale & gestion de « Montant total » [FAIT]
- Écran Budget : état non configuré (aucune entrée « Montant total ») → bouton unique
  « Configurer le budget », rien d'autre à l'écran.
- Formulaire de saisie des revenus du mois (réutilise `BudgetIncomeModal`, étendu pour le
  mode édition avec titre/valeurs par défaut).
- Liste complète des entrées « Montant total » (fenêtre « Modifier le budget ») avec
  modification et suppression de chaque entrée (`updateBudgetIncomeEntry` ajouté au state et
  au repository).
- Bouton « Configurer le budget » → « Modifier le budget » une fois au moins une entrée
  présente. L'icône ⚙ (accès catégories/livrets) renommée « Paramètres du budget » pour ne
  plus entrer en collision avec ce libellé.
- Tests unitaires (E71Budget réécrit) + entrée `manualTestsCatalog.ts` dédiée, mises à jour
  des tests manuels existants référençant l'ancien libellé de l'icône ⚙.
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 568/568 tests, `tsc -b` et
  lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Écran principal Budget (nouvelle structure) [FAIT]
- Montant total centré en haut, seule information affichée avec son détail sur l'écran
  principal (avec la gestion « Modifier le budget » déjà en place depuis la Phase 2).
- Ligne Mon compte / Mes livrets sous Montant total, chacune avec son propre total,
  navigation par clic vers deux nouveaux écrans dédiés (`budget-account`, `budget-livrets`).
- Ancien affichage plat de l'écran principal (tabs Semaine/Mois, jauge globale, liste de
  catégories, bouton « Ajouter une dépense ») déplacé tel quel dans le nouvel écran
  « Mon compte » (`E75BudgetAccount.tsx`), qui sera affiné en Phase 4 (Semaine/Mois côte à
  côte, jauge par sous-catégorie uniquement).
- Nouvel écran « Mes livrets » (`E76BudgetLivrets.tsx`) : total et solde de chaque livret,
  ou proposition de configuration si aucun livret n'existe ; sera affiné en Phase 5 (clic sur
  un livret → formulaire de transaction).
- Fallback de retour de `budget-category-detail` mis à jour vers `budget-account` (origine
  réelle de navigation désormais).
- Tests unitaires (E71Budget scindé, nouveaux E75BudgetAccount/E76BudgetLivrets) + mise à
  jour du test manuel catalogue « Utiliser le budget ».
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 573/573 tests, `tsc -b` et
  lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 4 — Drill-down « Mon compte » [FAIT]
- `E75BudgetAccount.tsx` réécrit : Semaine et Mois affichées simultanément côte à côte
  (deux colonnes), suppression des onglets et de la carte agrégée « Il me reste » (aucun
  total Semaine/Mois affiché, conforme au besoin confirmé).
- Chaque sous-catégorie affiche son montant prévu, son montant restant et sa jauge
  `BudgetGauge` individuelle ; navigation ouverte vers `budget-category-detail` conservée.
- Chaque colonne a sa propre navigation de période (précédente/suivante), indépendante de
  l'autre colonne.
- Formulaire « Ajouter une dépense » conservé (`BudgetExpenseModal`) : la règle ×1 (mois)
  / ×4 (semaine) sur Montant total est déjà appliquée en lecture par `getMonCompteUsage`
  (Phase 1), aucune logique supplémentaire requise à la création d'une dépense.
- Accès à la configuration des sous-catégories ajouté sur cet écran (icône ⚙️
  « Paramètres du budget » → `budget-settings`), réutilisant tel quel `E74BudgetSettings.tsx`
  existant plutôt que de dupliquer sa logique.
- Tests unitaires (`E75BudgetAccount.test.tsx` réécrit) + mise à jour du test manuel
  catalogue « Utiliser le budget ».
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 573/573 tests, `tsc -b` et
  lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 5 — Drill-down « Mes livrets » [FAIT]
- Nouvel écran `E77BudgetLivretDetail.tsx` : solde du livret, liste de ses mouvements
  (dépôts/retraits), chacun modifiable (montant/motif/date/type) via `updateBudgetDeposit`
  (nouvelle fonction, `budgetDepositRepo.update` déjà disponible) ou supprimable.
- `E76BudgetLivrets.tsx` : chaque livret de la liste ouvre désormais sa fiche détaillée
  (`budget-livret-detail`) ; total « Mes livrets » (somme de tous les livrets) conservé ;
  icône ⚙ « Paramètres du budget » ajoutée (même schéma que la Phase 4), bouton « Gérer les
  livrets » retiré (redondant avec le clic direct sur un livret et l'icône ⚙).
- `E74BudgetSettings.tsx` : la gestion des mouvements (liste, ajout, suppression) déplacée
  vers `E77BudgetLivretDetail.tsx` pour éviter deux formulaires différents (l'un sans date,
  l'autre avec) ; l'écran ne garde que la configuration des livrets (créer/renommer/supprimer),
  avec un clic sur un livret ouvrant désormais sa fiche détaillée.
- Nouvelle route `budget-livret-detail` (`navigation.ts`, `App.tsx`, `DevResetButton.tsx`).
- Tests unitaires (`E77BudgetLivretDetail.test.tsx` créé, `E76BudgetLivrets.test.tsx` et
  `E74BudgetSettings.test.tsx` mis à jour) + mise à jour du test manuel catalogue
  (« Retirer de l'argent d'un livret », nouveau test « Modifier un mouvement de livret »,
  étapes ajoutées à « Utiliser le budget »).
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 577/577 tests, `tsc -b` et
  lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 6 — Nettoyage & clôture [FAIT]
- `E71Budget.tsx`, `E73CategoryDetail.tsx`, `E74BudgetSettings.tsx` restent tous les trois
  utilisés (écrans vivants, référencés depuis `App.tsx`) : aucun fichier mort à supprimer.
- `budgetRules.ts` : suppression des fonctions devenues mortes après les Phases 1-5
  (`getCurrentPeriodBounds`, `getRemainingForCategory`, `getTotalBudgeted`, `getTotalSpent`,
  `getTotalRemaining`, plus leurs tests) — remplacées en pratique par `getSpentForCategory`
  et `getMonCompteUsage`.
- Widget accueil « Comptes » (`E10Dashboard.tsx`) : utilise `createBudgetEntry` de façon
  indépendante des entités `BudgetAccount`/`BudgetDeposit` modifiées en Phase 5 — aucune
  régression, confirmé par la suite de tests complète.
- `manualTestsCatalog.ts` : déjà à jour depuis la Phase 5 (nouveaux tests livrets ajoutés,
  aucun test Budget obsolète identifié après revue — le test de vérification de la migration
  des revenus de Marie reste pertinent tant qu'elle n'a pas confirmé cette migration en prod).
- `WHATS_NEW` mis à jour (réorganisation Montant total / Mon compte / Mes livrets, fiche
  livret avec mouvements modifiables).
- Checkpoint gate : tests unitaires verts, `tsc -b`/lint clean. — 571/571 tests, `tsc -b` et
  lint clean.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
