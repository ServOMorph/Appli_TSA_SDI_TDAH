# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique.
- Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global.

## Dernière session (2026-07-25, suite lisibilité UI Budget)

## Décisions prises
- Refonte de lisibilité de `E71Budget.tsx` sur retour utilisateur (« design pas très lisible ») : bug de contenu corrigé en premier (modales de suppression affichaient « seront conservées » alors que la suppression est réelle depuis la correction d'intégrité), puis hiérarchie visuelle, mise en avant colorée du reste non budgétisé, alerte visuelle sur dépassement, boutons destructifs en rouge distincts des actions neutres, distinction visuelle semaine/mois, formulaire de catégorie moins dense.
- Point « vue d'ensemble livrets » (dashboard séparé) volontairement non traité : aurait dupliqué la mise en avant du reste non budgétisé sans gain net ; à rediscuter si le besoin persiste après usage réel.

## Livrables produits ou modifiés
- `src/ui/screens/tools/E71Budget.tsx` : refonte visuelle (couleurs `--color-success`/`--color-error` déjà existantes, accent par période, boutons destructifs distincts).
- `src/ui/screens/tools/E71Budget.test.tsx`, `e2e/08-tools-budget.spec.ts` : assertions adaptées au nouvel ordre Restant/Dépensé et à la nouvelle structure du texte « Reste non budgétisé ».

## Hypothèses validées / invalidées
- VALIDE : réorganisation Restant-avant-Dépensé, couleurs vert/rouge sur le reste et le restant de catégorie, boutons destructifs en rouge — tests unitaires, e2e Budget (2/2) et suite complète (flaky pré-existant `AppContext.test.tsx` sans lien) verts après les changements.
- EN ATTENTE : retour utilisateur sur le rendu réel en navigateur (non testé visuellement dans cette session, uniquement via tests automatisés et lecture du code).

## Prochaine étape exacte
Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget ; sinon décider de la prochaine feature parmi le hors périmètre V4.1 (`roadmap_v4.1.md` § Reporté hors V4.1).

## Question bloquante pour la session suivante
Aucune.
