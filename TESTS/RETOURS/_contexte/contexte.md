# Contexte — RETOURS

## Objectif

Remplacer progressivement le Google Doc par des retours annotés créés dans l'application.

## État actuel

Le flux de retours annotés est implémenté et commité dans la branche isolée `agent/retours`
(Phases 1 à 6). Il couvre la capture, l’annotation, le code d’écran permanent, la persistance
Dexie v19, la synchronisation opportuniste et la lecture développeur. La migration
`supabase/feedback.sql` n’est pas appliquée. TESTS doit relire, intégrer sur une branche de
test, revérifier la suite complète et le budget bundle, puis valider sur téléphone réel.

## Décisions structurantes (append only)
- 2026-09-04 (cadrage roadmap_retours_annotes.md) : D1 (capture = input file + collage
  presse-papier, pattern repris du bridge ROBERTO sans dépendance au projet Roberto), D2 (badge
  écran E## permanent), D2bis (bouton flottant global comme point d'entrée), D3 (risque accepté
  sur la policy insert Storage ouverte à anon, Edge Function écartée). Détail dans
  `roadmap_retours_annotes.md`.
- 2026-09-04 (implémentation) : l’image aplatie et les métadonnées sont persistées localement
  avant l’envoi ; les échecs réseau restent silencieux et rejouables. Le bucket privé conserve
  une policy d’insertion `anon` sans lecture, modification ni suppression ; le risque de dépôt
  parasite est explicitement accepté. La migration SQL et l’intégration restent contrôlées par TESTS.
- 2026-09-05 (clôture) : le commit de clôture du 2026-09-04 ne portait que la roadmap et les
  décisions ; l’implémentation (Phases 1-6) est restée non commitée jusqu’à ce jour — corrigé
  par ce commit.
