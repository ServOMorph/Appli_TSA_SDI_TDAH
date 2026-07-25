# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique.
- Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global.
- Retours bruts non triés dans `bug et ameliorations.txt` (non commité) : drag & drop planning (impossible d'ajuster l'heure après dépôt sur un autre jour), demande de destination inutile lors de l'ajout de tâche depuis Planning (devrait forcer « Planifier »), vérifier ce comportement sur tous les écrans d'ajout de tâche, distinction visuelle insuffisante liste épinglée/non épinglée. — fait quand : trié et priorisé en tâches ou tranché comme hors périmètre — réf : `bug et ameliorations.txt` (racine, non versionné)

## Dernière session (2026-07-25, build dist v4.1)

## Décisions prises
- `outDir` de `vite.config.ts` codé en dur sur `dist/v3` (résidu de version) corrigé vers `dist/v4.1`, aligné sur la branche/version active.

## Livrables produits ou modifiés
- `vite.config.ts` : `outDir: 'dist/v3'` → `outDir: 'dist/v4.1'`.
- `dist/v4.1/` : build de production généré (`npm run build`, tsc + vite + PWA), non versionné (`dist/` entier gitignored).

## Hypothèses validées / invalidées
- VALIDE : build de production fonctionnel vers `dist/v4.1/` après correction de l'outDir.

## Prochaine étape exacte
Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget (session précédente) ; trier `bug et ameliorations.txt` ; sinon décider de la prochaine feature parmi le hors périmètre V4.1 (`roadmap_v4.1.md` § Reporté hors V4.1).

## Question bloquante pour la session suivante
Aucune.
