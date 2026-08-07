# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-07)

## Questions ouvertes
- [P1] Valider les 4 points de `tests_manuels.md` (écran Budget refondu, fiche catégorie, configuration, saisie de dépense) sur appareil réel, puis clore la Phase V5.1-0. — fait quand : les 4 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget refondu — Marie ne l'a toujours pas vu, l'écran a changé depuis la dernière fois. — fait quand : retour utilisateur recueilli — réf : `E71Budget.tsx`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P2] Trancher le retrait d'argent d'un livret : impossible aujourd'hui, `BudgetDeposit` ne porte qu'un montant de dépôt. Signalé le 2026-08-07, laissé hors périmètre de la Phase V5.1-0. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Hors périmètre, `budgetDeposit.ts`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Contexte chaud
- Branche `v5.1` active. Phase V5.1-0 codée et testée, reste la validation manuelle avant clôture.
- Les specs e2e `08-tools-budget.spec.ts` et `09-tools-folders-lists.spec.ts` visaient un bouton « Outils » de l'accueil retiré depuis la v5.13 : elles échouaient faute d'exécution e2e depuis cette date. Corrigé dans cette session — vérifier qu'aucune autre spec e2e ne porte le même angle mort avant de faire confiance à une mention « e2e non relancés » dans une future gate.

## Dernière session (2026-08-07, codage de la Phase V5.1-0)

## Décisions prises
- Rebranché sur `v5.1` (jusque-là seule `v5.0` existait malgré la roadmap ouverte).
- B7 (cohérence des deux formulaires de saisie de dépense) traité par fusion en un composant unique `BudgetExpenseModal.tsx`, plutôt que par une simple vérification comme le suggérait le texte de la checklist.
- Bouton principal de l'écran Budget libellé « Ajouter une dépense » plutôt que « + Dépense » (B6) — cohérence avec le titre du dialogue.
- Défaut 7 (solde cumulé vs mouvements filtrés par période) réglé en listant, dans l'écran de configuration, tous les dépôts d'un livret plutôt qu'un sous-ensemble par période.

## Livrables produits ou modifiés
- `E71Budget.tsx` : réécrit — onglets Semaine/Mois, chiffre « Il me reste », jauges, action unique.
- `E73CategoryDetail.tsx`, `E74BudgetSettings.tsx` : créés.
- `BudgetExpenseModal.tsx`, `BudgetGauge.tsx`, `src/ui/styles/budget.ts` : créés (composants et styles partagés).
- `budgetRules.ts` : 5 fonctions ajoutées (`getTotalSpent`, `getTotalRemaining`, `getGaugeRatio`, `getGaugeLevel`, `GAUGE_WARNING_RATIO`), aucune existante modifiée.
- `E10Dashboard.tsx` : formulaire de dépense dupliqué remplacé par `BudgetExpenseModal`.
- `navigation.ts`, `App.tsx`, `DevResetButton.tsx` : routes `budget-category-detail`/`budget-settings` câblées.
- Tests : `budgetRules.test.ts` étendu, 3 fichiers de tests d'écran (nouveaux/réécrits), `e2e/08-tools-budget.spec.ts` et `e2e/09-tools-folders-lists.spec.ts` corrigés (bouton « Outils » disparu, non détecté faute d'exécution e2e récente).
- `roadmap_v5.1.md` : Phase V5.1-0 passée `[EN COURS]`, checklist B1-B10 cochée, gate mise à jour (test manuel restant).
- `tests_manuels.md` : 4 points ajoutés (Budget, fiche catégorie, configuration, saisie de dépense).
- `CHANGELOG.md` : entrée v5.17.

## Hypothèses validées / invalidées
- VALIDE : 522/522 tests unitaires, 57/57 e2e, `tsc -b`/lint/build clean.
- EN ATTENTE : rendu visuel réel non vérifié en navigateur dans cette session — la refonte est validée par tests automatisés uniquement.

## Prochaine étape exacte
Valider les 4 points de `tests_manuels.md` sur appareil réel, puis clore la Phase V5.1-0 (roadmap passée à `[FAIT]`).

## Question bloquante pour la session suivante
Aucune.
