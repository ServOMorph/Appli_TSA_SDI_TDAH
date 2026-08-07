# Roadmap — V5.1 (refonte ergonomique du Budget, puis outils reportés)

Version : 5.1 — créée 2026-08-07. Succède à `roadmap_v5.0.md` (V5.0 close, V5-0 à V5-3 `[FAIT]`). Branche : `v5.1`.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

Note de cadrage : la Phase V5.1-0 ci-dessous est un chantier d'une seule phase — la roadmap se justifie surtout par le backlog outils reporté plus bas, qui lui est multi-phases et serait sinon resté prisonnier d'une roadmap close.

---

## Phase V5.1-0 — Refonte ergonomique de l'écran Budget [EN COURS]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Origine : demande utilisateur du 2026-08-07 — « l'écran E71 budget n'est pas assez intuitif, l'utilisation paraît un peu compliquée ». Analyse conduite sur `E71Budget.tsx` (482 l.), `budgetRules.ts`, `useBudgetState.ts` et les quatre entités budget.

**Modèle de données inchangé.** `budgetCategory.ts`, `budgetEntry.ts`, `budgetAccount.ts`, `budgetDeposit.ts` et le schéma Dexie ne bougent pas. Aucune migration. Cette phase ne préempte donc ni `E32` (colonnes configurables) ni `E34` (livrets reliés au compte du mois), qui exigent tous deux un changement de modèle et restent au backlog ci-dessous.

Principe directeur : **séparer consulter de configurer**. L'écran principal répond à une seule question — « combien il me reste ».

### Défauts constatés à corriger

1. Aucune hiérarchie consulter/configurer : quatre boutons pleine largeur de poids identique (`E71Budget.tsx` l.309-310, l.342-343), l'action quotidienne au même niveau que les actions faites une fois ; 3 liens de gestion permanents sous chaque catégorie (l.276-286) et 2 sous chaque livret (l.330-333), soit 18 liens de configuration noyant les chiffres avec 6 catégories.
2. Chiffre-vedette hors sujet : « Reste non budgétisé » est le plus gros chiffre de l'écran (l.246) mais vaut `revenus − budgétisé − dépôts` (`getUnbudgetedRemainder`) — le montant *non alloué*, pas « ce qu'il me reste à dépenser ».
3. Deux périodes empilées intégralement (l.306-307), chacune avec son propre navigateur : écran long, deux états de navigation simultanés.
4. Aucune progression visuelle — « Restant : X (Dépensé Y) » en texte pur, à charge de calcul pour l'utilisateur.
5. Journal de dépenses déroulé inline sur l'écran principal, chaque ligne portant un lien « Supprimer la dépense » en toutes lettres (l.270-275).
6. Dates brutes `2026-08-07` (l.272, l.326), alors que V5-2b a passé la fiche tâche au format français.
7. Bloc Livrets incohérent : solde = cumul de **tous** les dépôts (`getAccountBalance`), mouvements listés juste en dessous filtrés sur la **période courante** (l.324) — deux horizons dans le même bloc.
8. Saisie rétroactive impossible : `createBudgetEntry` accepte une date (`useBudgetState.ts:122`) que le formulaire n'expose pas.

### Arbitrages validés avec l'utilisateur (2026-08-07)

- **A1** — Le chiffre-vedette devient « Il me reste » (total budgétisé en dépense sur la période − dépensé). Changement de **sens** assumé, pas seulement de mise en forme. Le « reste non budgétisé » actuel descend dans l'écran de configuration sous le libellé « Non alloué ».
- **A2** — Une seule période affichée à la fois, via un onglet segmenté Semaine / Mois. Contrepartie acceptée : comparer semaine et mois demande un basculement au lieu d'une lecture simultanée.
- **A3** — Catégories, livrets et dépôts sortent de l'écran principal vers un écran de configuration dédié.
- **A4** — Trois écrans (plutôt que des sections repliables dans un `E71` unique).
- **A5** — Chantier engagé maintenant, sans attendre le retour de Marie. Motif : l'écran actuel est assez confus pour biaiser ce retour.

### Checklist

- [x] `B1` + `A2` — onglet segmenté Semaine / Mois, un seul navigateur de période et un seul état de date ; `renderPeriod` appelé une fois au lieu de deux (`src/ui/screens/tools/E71Budget.tsx`)
- [x] `B2` + `A1` — bloc de tête « Il me reste » : montant restant, rappel « sur X € · Y dépensés », jauge de progression ; deux fonctions de totaux de période ajoutées à `src/domain/rules/budgetRules.ts` (dépensé total et restant total sur les catégories de dépense d'une période), sans toucher aux fonctions existantes
- [x] `B3` — jauge par catégorie remplaçant « Restant : X (Dépensé Y) » : verte, ambre au-delà de 80 % de consommation, rouge en dépassement (`E71Budget.tsx`, seuils dans `budgetRules.ts` pour être testables)
- [x] `B4` + `A4` — nouvel écran fiche catégorie `src/ui/screens/tools/E73CategoryDetail.tsx`, ouvert au tap sur une ligne de catégorie, même pattern que la fiche tâche de V5-2b : nom, montant, périodicité, historique des dépenses de la période, actions renommer / modifier le montant / supprimer (avec la confirmation existante quand des dépenses existent). Retire les liens de gestion permanents de l'écran principal.
- [x] `B5` + `A3` + `A4` — nouvel écran de configuration `src/ui/screens/tools/E74BudgetSettings.tsx`, atteint par une icône en tête de `E71Budget` : création de catégorie, gestion des livrets, ajout de dépôt, et affichage du « Non alloué » par période
- [x] `B6` — action principale unique sur l'écran principal (« Ajouter une dépense », plutôt que « + Dépense » — cohérence avec le titre du dialogue) ; les trois autres boutons pleine largeur migrent vers `E74BudgetSettings`
- [x] `B7` — formulaire de dépense enrichi : champ Date (paramètre déjà supporté par `createBudgetEntry`, jamais exposé) et sélection de catégorie en pastilles cliquables au lieu du `<select>` — un tap au lieu de deux. Fusionné en un composant unique `BudgetExpenseModal.tsx`, utilisé à la fois par `E71Budget` et par le widget Comptes de l'accueil (`E10Dashboard.tsx`) — la « cohérence à vérifier » du texte d'origine est devenue une factorisation.
- [x] `B8` — livrets condensés en une ligne de synthèse sur l'écran principal (total + accès), détail dans `E74BudgetSettings` ; incohérence solde cumulé / mouvements filtrés par période corrigée (défaut 7) : la configuration liste désormais tous les dépôts d'un livret, cohérents avec son solde cumulé.
- [x] `B9` — dates au format français partout dans le domaine budget (défaut 6)
- [x] `B10` — routes `budget-category-detail` (avec la date de la période consultée) et `budget-settings` ajoutées à la pile de navigation, retour contextuel par `back()` partout
- [x] Tests : `budgetRules.test.ts` étendu (totaux de période, seuils de jauge), `E71Budget.test.tsx`/`E73CategoryDetail.test.tsx`/`E74BudgetSettings.test.tsx`, `e2e/08-tools-budget.spec.ts` adapté au nouveau parcours

Gate : [x] tests verts (522/522 unitaires, 57/57 e2e, `tsc -b`/lint/build clean) · [ ] test manuel (`tests_manuels.md`, 4 points en attente) · [x] doc (`CHANGELOG.md` v5.17) · [x] sortie — l'écran Budget répond à « combien il me reste » sans scroll ni calcul, toute la configuration est atteignable depuis l'écran dédié, aucun écran ni action existante n'a perdu son point d'entrée

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Hors périmètre de la Phase V5.1-0 (à trancher plus tard)

- Retrait d'argent d'un livret : impossible aujourd'hui, `BudgetDeposit` ne porte qu'un montant de dépôt. Signalé à l'utilisateur le 2026-08-07, non tranché.
- Report du reliquat d'une période à la suivante. `E33` des constats du 2026-07-28 précise que le reliquat n'est **pas** reporté mais reste visible dans la cagnotte globale — à traiter avec la refonte des comptes (`E32`/`E34`).

## Backlog outils (reporté de `roadmap_v5.0.md` § Reporté en V5.1+)

Ordre de priorité tranché le 2026-07-28 : Comptage en premier. À confirmer ou réviser au retour de Marie.

- `E31`, `E31b`, `E38` — outil **Comptage** (ex-« joint »), raccourci d'incrément et vue statistique hebdomadaire (cf. C51, C52, C54, C58). **Priorité 1.**
- `E23` — outil **Météo du jour** (ex-« Sentiments ») (cf. C43, C47, C48).
- `E32`, `E33`, `E34`, `E17` — refonte des comptes en tableaux à colonnes configurables, revenu en tête, livrets reliés, saisie de dépense depuis le « + » (cf. C50). Recoupe partiellement la Phase V5.1-0, qui traite `E33` côté ergonomie mais laisse intacts `E32` et `E34` (changement de modèle requis).
- `E35` — outil Routine (cf. C55).
- `E36`, `E36b`, `E37` — outil Tableau prévisions (cf. C56, C57, C58).

## Q à trancher (reportées de V5.0)

- `Q4` — date des lignes de dépense, stockée ou non. Reporté avec la refonte des comptes.
- `Q6` — liste comptage, un incrément par jour ou horodatage complet. Reporté avec l'outil Comptage.
- Périodicité d'une catégorie de dépense modifiable après création, compte tenu de l'impact sur l'historique (héritée de `Archives/roadmap_v4.1.md`).
