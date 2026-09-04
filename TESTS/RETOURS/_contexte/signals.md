# Signals — RETOURS

## Actions ouvertes

- [P1] Réaliser le flux de retours annotés dans une branche isolée.
  - fait quand: le parcours, le stockage Supabase, les tests et la demande d'intégration sont remis au coordinateur.
  - réf: ../agent_role.md, ../roadmap_retours_annotes.md

## Dernière session (2026-09-04 — cadrage : roadmap et décisions produit D1-D3)

## Décisions prises
- D1 : entrée de capture = `<input type="file">` + collage presse-papier, pattern repris du bridge ROBERTO (UI seulement, aucune dépendance au projet Roberto).
- D2 : badge de code d'écran (E##) permanent sur chaque écran, pas de réglage « mode retour » à activer.
- D2bis : point d'entrée du flux = bouton flottant global, pas une entrée dans les Paramètres.
- D3 : risque accepté sur la policy `insert` Storage ouverte à `anon` (dépôt parasite possible, pas de fuite de données) ; alternative Edge Function + URL signée écartée (hors périmètre de l'agent).

## Livrables produits ou modifiés
- `roadmap_retours_annotes.md` : créé — 6 phases `[TODO]` avec checkpoints `/compact`.
- `_contexte/messages.md` : consigne absorbée (contenu déjà dans `signals.md`/`agent_role.md`), supprimé après prise en charge.

## Hypothèses validées / invalidées
- EN ATTENTE : aucune phase de code démarrée cette session — cadrage et décisions produit uniquement.

## Prochaine étape exacte
Démarrer la Phase 1 (entité `FeedbackReport`, Dexie `version(19)`, repository, règles, tests) sur confirmation de l'utilisateur.

## Question bloquante pour la session suivante
Aucune.
