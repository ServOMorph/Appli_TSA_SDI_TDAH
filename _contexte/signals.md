# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique.
- Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global.

## Dernière session (2026-07-25)

## Décisions prises
- Intégrité relationnelle du Budget corrigée : migration Dexie v6 (suppressions en cascade sur livrets/catégories, périodicité `week|month` des dépôts, existant migré vers `month`).
- Phase V4.1-4 intégralement validée manuellement (points 48 à 73 de `tests_manuels.md`) ; roadmap `roadmap_v4.1.md` intégralement close (V4.1-0 à V4.1-4).
- Correctif d'ergonomie trouvé en test manuel : bouton de suppression d'une dépense renommé « Supprimer la dépense » (ambigu avec le bouton de suppression de la catégorie).
- Script de lancement dev déplacé de `scripts/run_dev.py` vers `run.py` (racine), référence corrigée dans `llms.txt`.

## Livrables produits ou modifiés
- `src/domain/entities/budgetDeposit.ts`, `src/data/db.ts` (migration v6), `src/domain/rules/budgetRules.ts` : périodicité des dépôts.
- `src/app/AppContext.tsx` : suppressions en cascade (`deleteBudgetCategory`/`deleteBudgetAccount`).
- `src/ui/screens/tools/E71Budget.tsx` : sélecteur de périodicité sur le dépôt, libellé de suppression clarifié.
- `e2e/08-tools-budget.spec.ts` (nouveau scénario T53 — cascade), tests unitaires Budget mis à jour.
- `run.py` (déplacé), `llms.txt` corrigé, `tests_manuels.md` purgé (tous les points validés).

## Hypothèses validées / invalidées
- VALIDE : migration de réparation + périodicité mensuelle par défaut pour les dépôts existants ; parcours Budget complet validé manuellement par l'utilisateur, y compris la recalculation après suppression en cascade.
- EN ATTENTE : aucune.

## Prochaine étape exacte
Décider de la prochaine feature parmi le hors périmètre V4.1 (`roadmap_v4.1.md` § Reporté hors V4.1) ; aucune roadmap active en cours.

## Question bloquante pour la session suivante
Aucune.
