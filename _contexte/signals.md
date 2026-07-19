# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-19)

## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`)
- [P1|ouvert] V4-5 — Sous-tâches planifiables (E9a, E9b, E9c)
  - fait quand: sous-tâche planifiable à son propre créneau, affichage hiérarchique sur planning/accueil/tâches du jour, point d'entrée depuis l'écran de décomposition ; gate de phase intégralement coché (tests, test manuel, doc).
  - réf: `roadmap_v4.md` § Phase V4-5
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil).
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4
- [P3|ouvert] Faire le ménage à la racine du projet
  - fait quand: fichiers/dossiers non pertinents à la racine identifiés et supprimés ou déplacés.
  - réf: `roadmap_v4.md` § Divers (hors phases)

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify
  - fait quand: doc V2 à jour, déploiement Netlify effectué.
  - réf: `Archives/roadmap_v2.md`

## Questions ouvertes
- E3 seule question restante (`roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V4-4 close** : validation manuelle intégralement passée par l'utilisateur (403/403 tests, 50/50 e2e).
- Le flux E6 « Déplacer » et E8 « Reporter » sont désormais unifiés sur un seul mécanisme : bandeau « "X" est en cours de déplacement. » (flux « tâche en main » d'E5), planning affiché en arrière-plan, navigation libre entre les jours. La modale de liste de créneaux a été **retirée** — ne pas la réintroduire pour une future feature de planning sans vérifier ce choix.
- E1 (glisser) : la cible est lue directement sous le curseur (`document.elementFromPoint` + attribut `data-slot` sur chaque gridcell), pas de calcul par distance. Zones de bord à gauche/droite de la grille (`gridRef`) : maintenir la tâche en main dans une zone ~650ms (`EDGE_DWELL_MS`) fait défiler le jour affiché, répétable ; relâcher dans une zone annule le déplacement.
- Piège identifié et corrigé : les écouteurs `window.addEventListener('pointermove'/'pointerup', ...)` posés pour la durée d'un glisser capturent une closure figée sur le rendu où le glisser a commencé — toute fonction qui doit refléter un état changeant pendant le glisser (ex. jour affiché) doit lire une **ref** (`displayDateRef`), jamais l'état React direct. Bug similaire à surveiller si de nouvelles interactions long-lived (drag, dwell) sont ajoutées à `E40Planning.tsx`.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les 18 écrans qui en dépendent.

## Dernière session (2026-07-19)

## Décisions prises
- Phase V4-4 codée et validée intégralement (E6 menu, E1 glisser, E8 report) ; roadmap V4 passe à la Phase V4-5.
- E6 « Déplacer » et E8 « Reporter » unifiés sur le flux « tâche en main » (bandeau E5), remplaçant la modale de liste de créneaux initialement codée puis retirée sur demande de l'utilisateur.
- Glisser E1 conçu en plusieurs itérations avec l'utilisateur : bascule au relâchement abandonnée au profit d'un survol continu avec zones de bord à maintien (`EDGE_DWELL_MS` = 650 ms) et lecture directe de la case sous le curseur.
- Libellé unique du bandeau (pas de distinction déplacement/report dans le texte) ; le badge « Reporté » suffit à distinguer un report.

## Livrables produits ou modifiés
- `E40Planning.tsx` : menu E6 (déplacer/renommer/supprimer), flux « tâche en main » unifié pour Déplacer/Reporter, glisser E1 (`elementFromPoint`, `data-slot`, zones de bord, overlay), badge « Reporté ».
- `AppContext.tsx` : `movingTask`/`startMoveTask`/`clearMoveTask` remplacent `reportPlanTask`/`startReportTask`/`clearReportPlanTask` ; `renameV2Task`, `deleteV2Task`, `reportV2Task` ajoutés.
- `taskRulesV2.ts`, `taskV2.ts` (entité) : `reportTaskV2`/`renameTaskV2` remplacent `postponeTaskV2` ; champ `postponed` ajouté.
- `E10Dashboard.tsx` : bouton Reporter aligné sur le flux « tâche en main ».
- `e2e/07-planning-v4.spec.ts` : T48 (menu E6), T49 (report E8), T50 (déplacement multi-jours E6).
- `validation_manuelle.md`, `roadmap_v4.md` : phase V4-4 cochée intégralement, gate clos.

## Hypothèses validées / invalidées
- VALIDE : tous les points de `validation_manuelle.md` V4-4 (1.1-1.6, 2.1-2.6, 3.1-3.3), confirmés par l'utilisateur.
- INVALIDE : mécanisme initial de glisser horizontal (pose automatique au relâchement à droite/gauche) -> pivot vers le survol continu avec zones de bord, sur demande explicite de l'utilisateur après deux reformulations.
- Bug trouvé en test utilisateur et corrigé : `reload()` de `E40Planning.tsx` lisait le jour affiché via une closure figée dans l'écouteur de pointer du glisser, rechargeant le mauvais jour après une bascule de jour pendant un glisser en cours -> corrigé via `displayDateRef`.

## Prochaine étape exacte
Démarrer la Phase V4-5 (`roadmap_v4.md`) : E9a (modèle de données sous-tâche planifiable), E9b (affichage hiérarchique), E9c (point d'entrée depuis l'écran de décomposition).

## Question bloquante pour la session suivante
Aucune.
