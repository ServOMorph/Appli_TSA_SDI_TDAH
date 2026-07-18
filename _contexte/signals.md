# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-19)

## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`)
- [P1|ouvert] V4-3 — validation manuelle de la phase multi-créneaux et récurrence
  - fait quand: tous les points de `validation_manuelle.md` V4-3 sont cochés, dont B2 ; les écarts sont consignés ou corrigés.
  - réf: `validation_manuelle.md` ; `roadmap_v4.md` § Phase V4-3
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
- **V4-3 est codée mais non close** : 386/386 tests unitaires, 47/47 e2e et build verts ; validation manuelle requise.
- « Répéter demain » est retiré ; la tâche active est replaçable sur une plage jusqu'au bouton « Terminer ».
- V4-4 doit remplacer le report automatique par le choix d'un créneau ; ne pas conserver le comportement actuel de `postponeTask`.
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif, piège pour les tests e2e.

## Dernière session (2026-07-19)

## Décisions prises
- V4-3 est livrée côté code et automatisation ; sa clôture dépend exclusivement de la validation manuelle.

## Livrables produits ou modifiés
- `E40Planning.tsx`, `AppContext.tsx`, `E10Dashboard.tsx` : multi-créneaux, tâche active, retrait de « Répéter demain » et modale fusionnée.
- `e2e/07-planning-v4.spec.ts`, `e2e/05-overload.spec.ts` : gates e2e V4-3 ajoutés et adaptés.
- `validation_manuelle.md`, `roadmap_v4.md` : validation V4-3 et statut de phase mis à jour.

## Hypothèses validées / invalidées
- VALIDE : E2, E5, D3 et D5 passent en unitaires et e2e.
- EN ATTENTE : rendu visuel/tactile multi-créneaux, coût compté une fois et cadre Dashboard (B2).

## Prochaine étape exacte
Passer `validation_manuelle.md` pour V4-3 avant toute phase V4-4.

## Question bloquante pour la session suivante
Aucune.
