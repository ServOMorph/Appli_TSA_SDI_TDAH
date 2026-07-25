# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v4.1.md` § Q à trancher
- [P2] Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global. — fait quand : cadrage repris explicitement par l'utilisateur — réf : `roadmap_v4.1.md` § Reporté hors V4.1
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget (points 2-7, session 2026-07-25) — non vérifié en navigateur, uniquement tests auto + lecture du code. — fait quand : retour utilisateur recueilli — réf : `roadmap_v4.1.md` Phase V4.1-3/4, `E71Budget.tsx`

## Dernière session (2026-07-25, correctif sélection texte drag planning)

## Décisions prises
- Correctif hors roadmap, à la demande de l'utilisateur : pendant un drag-and-drop dans `E40Planning`, le long-press déclenchait une sélection de texte du navigateur sur l'écran. Traité immédiatement (bug bloquant l'usage tactile), sans ouvrir de phase dédiée.

## Livrables produits ou modifiés
- `E40Planning.tsx` : `slotCellStyle` — ajout `userSelect: 'none'`, `WebkitUserSelect: 'none'`, `touchAction: 'none'` sur les cellules du planning. `handleTaskPointerDown` — `window.getSelection()?.removeAllRanges()` au déclenchement du drag (purge une sélection déjà amorcée). `<main>` — `userSelect: 'none'` appliqué tant que `isDragging` est vrai (le pointeur sort des cellules pendant le drag, écoute sur `window`).

## Hypothèses validées / invalidées
- EN ATTENTE : correctif non vérifié en navigateur/appareil tactile réel dans cette session (uniquement `tsc -b` clean + suite unitaire 474/474 verte, sans régression).

## Prochaine étape exacte
[P1] Faire valider par l'utilisateur en test manuel tactile que le drag-and-drop dans Planning ne sélectionne plus le texte de l'appli. Si confirmé, enchaîner sur la Phase V4.1-6 (`roadmap_v4.1.md`) : auto-scroll vertical de la grille pendant un drag. — réf : `roadmap_v4.1.md` Phase V4.1-6, `E40Planning.tsx`

## Question bloquante pour la session suivante
Aucune.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) peut être vidé/supprimé une fois V4.1-6 close — son contenu est désormais intégralement repris dans `roadmap_v4.1.md`.
