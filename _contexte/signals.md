# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique.
- Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global.
- Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget (points 2-7, session 2026-07-25) — non vérifié en navigateur, uniquement tests auto + lecture du code. — fait quand : retour utilisateur recueilli — réf : `roadmap_v4.1.md` Phase V4.1-3/4, `E71Budget.tsx`

## Dernière session (2026-07-25, tri `bug et ameliorations.txt` + roadmap)

## Décisions prises
- Les 4 retours bruts de `bug et ameliorations.txt` triés et transformés en 2 phases roadmap (aucun écarté hors périmètre) : correctifs UI groupés (V4.1-5) séparés du drag planning plus délicat (V4.1-6).

## Livrables produits ou modifiés
- `roadmap_v4.1.md` : ajout Phase V4.1-5 (ajout de tâche contextuel selon écran d'origine + distinction visuelle liste épinglée) et Phase V4.1-6 (auto-scroll vertical de la grille pendant le drag planning), toutes deux `[TODO]`.

## Hypothèses validées / invalidées
- EN ATTENTE : aucun code modifié cette session (analyse + planification uniquement) — confirmation à obtenir avant de démarrer V4.1-5.

## Prochaine étape exacte
Démarrer la Phase V4.1-5 (`roadmap_v4.1.md`) : nav « + » contextuel selon l'écran d'origine, généralisation de `effectiveDestination` dans `E21CreateTaskV2.tsx`, accent visuel sur liste épinglée dans `E60Lists.tsx`.

## Question bloquante pour la session suivante
Aucune.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) peut être vidé/supprimé une fois V4.1-5 et V4.1-6 closes — son contenu est désormais intégralement repris dans `roadmap_v4.1.md`.
