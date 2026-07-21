# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

- [P0|bloquant] Corriger l’intégrité relationnelle du Budget et réparer les données existantes.
  - fait quand: une migration supprime les dépôts et écritures orphelins, la suppression confirmée d’un livret ou d’une catégorie supprime aussi ses éléments liés, la périodicité des dépôts est définie sans double déduction semaine/mois, et les tests de régression sont verts.
  - réf: `src/app/AppContext.tsx`, `src/data/db.ts`, `src/domain/rules/budgetRules.ts`, `roadmap_v4.1.md` § Phase V4.1-4
- [P1|ouvert] Reprendre et terminer la validation manuelle de la Phase V4.1-4 à partir du point 48.
  - fait quand: les points 48 à 69 de `tests_manuels.md` sont validés après réparation, le flux complet configurer/saisir/consulter/corriger fonctionne et le gate de phase est coché.
  - réf: `tests_manuels.md`, `roadmap_v4.1.md` § Phase V4.1-4

## Questions ouvertes
- Valider la règle recommandée pour les dépôts : ajouter une périodicité `week|month` et migrer les dépôts existants vers `month`.
- Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l’impact sur l’historique.
- Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global.

## Échéances

## Blocages
- Phase V4.1-4 non clôturable : un dépôt lié à un livret supprimé reste compté dans les restes semaine/mois tout en étant invisible dans l’interface.

## Contexte chaud
- Phases V4.1-0 à V4.1-3 closes ; Phase V4.1-4 implémentée mais validation manuelle arrêtée après le point 47.
- Données observées : revenu mensuel 1 500 €, dépense budgétisée 120 €, dépôt visible 50 €, mais reste affiché 1 280 € ; l’écart prouve un second dépôt orphelin de 50 €.
- Cause confirmée : `deleteBudgetAccount` conserve les dépôts ; l’UI ne les affiche plus sans livret, mais `getTotalDeposits` les additionne encore. La suppression de catégorie présente le même risque pour ses écritures.
- Les dépôts n’ont pas de périodicité et sont actuellement déduits des vues semaine et mois.
- Vérifications : tests Budget ciblés, build, lint et e2e Budget verts ; suite Vitest complète avec un échec intermittent pré-existant dans `AppContext.test.tsx`.

## Dernière session (2026-07-21, suites 7 et 8)

## Décisions prises
- Phase V4.1-3 close après validation manuelle complète.
- Phase V4.1-4 reste en cours ; aucune reprise des tests manuels avant correction de l’intégrité des données Budget.

## Livrables produits ou modifiés
- `src/ui/screens/tools/E71Budget.tsx` et `src/app/AppContext.tsx` : dépenses, dépôts, soldes, historique et corrections.
- `tests_manuels.md` : parcours numéroté de 69 actions, libellés de suppression rendus explicites.
- Tests unitaires Budget et e2e `e2e/08-tools-budget.spec.ts` ajoutés.

## Hypothèses validées / invalidées
- VALIDE : configuration Budget et usage courant jusqu’au point manuel 47 ; rafraîchissement après suppression directe d’une dépense ou d’un dépôt.
- INVALIDE : conserver les dépôts lors de la suppression d’un livret ; cela crée des données invisibles encore comptabilisées.
- EN ATTENTE : périodicité des dépôts et réparation transactionnelle des relations Budget.

## Prochaine étape exacte
Implémenter la migration de réparation, les suppressions en cascade et la règle de périodicité des dépôts, puis reprendre `tests_manuels.md` au point 48.

## Question bloquante pour la session suivante
Confirmer que les dépôts existants doivent être migrés comme dépôts mensuels.
