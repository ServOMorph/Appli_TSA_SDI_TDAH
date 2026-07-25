# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v4.1.md` § Q à trancher
- [P2] Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global. — fait quand : cadrage repris explicitement par l'utilisateur — réf : `roadmap_v4.1.md` § Reporté hors V4.1
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget (points 2-7, session 2026-07-25) — non vérifié en navigateur, uniquement tests auto + lecture du code. — fait quand : retour utilisateur recueilli — réf : `roadmap_v4.1.md` Phase V4.1-3/4, `E71Budget.tsx`

## Dernière session (2026-07-25, correctif dette e2e Todo→Outils)

## Décisions prises
- Angle mort signalé en fin de session précédente (10 specs e2e cassées par le renommage Todo→Outils, Phase V4.1-0) traité immédiatement, avant de démarrer V4.1-5.

## Livrables produits ou modifiés
- `e2e/02-tasks.spec.ts`, `e2e/06-offline.spec.ts`, `e2e/07-planning-v4.spec.ts` : flux de navigation mis à jour — clic bottom nav « Outils » puis bouton « Todo » du hub (le bouton « Todo » a disparu du bottom nav depuis V4.1-0) ; suppression du clic sur le sélecteur de destination « Todo » dans `E21CreateTaskV2` (masqué depuis V4.1-0 quand l'origine est l'inbox).
- `e2e/02-tasks.spec.ts` (T14) : bug de test distinct découvert en cascade — le bouton « Retour » d'`E20Inbox` pointe vers le hub Outils depuis V4.1-0 (`goTo('dashboard')` → `goTo('tools')`), la tâche déplacée vers Aujourd'hui n'était donc plus visible après Retour. Ajout d'un clic explicite sur « Accueil » avant l'assertion.

## Hypothèses validées / invalidées
- VALIDE : les 10 échecs e2e avaient pour cause unique le renommage du bouton nav Todo→Outils (Phase V4.1-0), pas une régression fonctionnelle.
- VALIDE : suite e2e complète 53/53 verte, suite unitaire 464/466 (seul le flaky pré-existant `AppContext.test.tsx`, pollution d'ordre entre tests, sans lien).

## Prochaine étape exacte
[P1] Démarrer la Phase V4.1-5 (`roadmap_v4.1.md`) : nav « + » contextuel selon l'écran d'origine, généralisation de `effectiveDestination` dans `E21CreateTaskV2.tsx`, accent visuel sur liste épinglée dans `E60Lists.tsx`. — réf : `roadmap_v4.1.md` Phase V4.1-5

## Question bloquante pour la session suivante
Aucune.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) peut être vidé/supprimé une fois V4.1-5 et V4.1-6 closes — son contenu est désormais intégralement repris dans `roadmap_v4.1.md`.
