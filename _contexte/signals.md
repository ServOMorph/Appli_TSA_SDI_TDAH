# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-19)

## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`)
- [P1|ouvert] V4-4 — Interactions sur une tâche planifiée (E6, E1, E8)
  - fait quand: menu déplacer/renommer/supprimer codé, glisser tactile fonctionnel, « Reporter » ouvre un choix de créneau ; gate de phase intégralement coché (tests, test manuel, doc, e2e).
  - réf: `roadmap_v4.md` § Phase V4-4
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
- **Phase V4-3 close** : validation manuelle intégralement passée par l'utilisateur (386/386 tests, 47/47 e2e).
- `--bottomnav-h` n'est plus une constante CSS figée : `BottomNav.tsx` la mesure via `ResizeObserver` et la publie dynamiquement sur `documentElement`. Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les 18 écrans qui en dépendent.
- V4-4 doit remplacer le report automatique par le choix d'un créneau ; ne pas conserver le comportement actuel de `postponeTask`.
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif, piège pour les tests e2e.

## Dernière session (2026-07-19)

## Décisions prises
- Phase V4-3 validée et close ; roadmap V4 passe à la Phase V4-4.

## Livrables produits ou modifiés
- `E40Planning.tsx` : bandeau « tâche en cours de planification » sorti du flux scrollable, repositionné en fixe au-dessus du bouton « Ajouter une tâche ».
- `E10Dashboard.tsx` : espace ajouté entre le nom de tâche et l'icône batterie sur la carte « Planning du jour ».
- `BottomNav.tsx` : `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (corrige un interstice de grille visible sous le bandeau, causé par la constante CSS figée à 132px alors que la nav réelle fait ~118px).
- `validation_manuelle.md`, `roadmap_v4.md` : phase V4-3 cochée intégralement (dont B2), gate clos.

## Hypothèses validées / invalidées
- VALIDE : tous les points de `validation_manuelle.md` V4-3, y compris l'écart 2.1 une fois corrigé.
- EN ATTENTE : comportement de `--bottomnav-h` en mode surcharge (nav vide → nav plus courte), non vérifié visuellement.

## Prochaine étape exacte
Démarrer la Phase V4-4 (`roadmap_v4.md`) : E6 (menu déplacer/renommer/supprimer), E1 (glisser tactile), E8 (report via choix de créneau).

## Question bloquante pour la session suivante
Aucune.
