# Contexte — RETOURS

## Objectif

Remplacer progressivement le Google Doc par des retours annotés créés dans l'application.

## État actuel

Roadmap `roadmap_retours_annotes.md` créée (6 phases `[TODO]`). Décisions produit D1 à D7
tranchées ou par défaut assumé, aucune ambiguïté restante. Aucune ligne de code écrite : la
Phase 1 (socle domaine et persistance locale) démarre à la prochaine session, sur confirmation.
Branche isolée ; la conception et le code ne sont intégrables qu'après validation explicite.

## Décisions structurantes (append only)
- 2026-09-04 (cadrage roadmap_retours_annotes.md) : D1 (capture = input file + collage
  presse-papier, pattern repris du bridge ROBERTO sans dépendance au projet Roberto), D2 (badge
  écran E## permanent), D2bis (bouton flottant global comme point d'entrée), D3 (risque accepté
  sur la policy insert Storage ouverte à anon, Edge Function écartée). Détail dans
  `roadmap_retours_annotes.md`.
