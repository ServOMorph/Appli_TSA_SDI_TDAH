# Contexte — RETOURS

## Objectif

Remplacer progressivement le Google Doc par des retours annotés créés dans l'application.

## État actuel

Le flux de retours annotés (Phases 1 à 6) a été relu et fusionné dans `main` par TESTS le
2026-09-05 (`tsc -b`, lint et Vitest 748/748 rejoués OK avant fusion ; `bundle:check` non
rejoué). Il couvre la capture, l'annotation, le code d'écran permanent, la persistance Dexie v19,
la synchronisation opportuniste et la lecture développeur. La migration `supabase/feedback.sql`
n'est pas appliquée : le flux reste local (sans synchro serveur) tant qu'elle ne l'est pas.

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
