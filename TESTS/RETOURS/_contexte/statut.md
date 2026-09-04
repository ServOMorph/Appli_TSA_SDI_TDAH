# Statut — RETOURS

## Objectif
Concevoir et réaliser le flux de retours annotés depuis le téléphone (capture, annotation au
crayon, numéro d'écran visible, commentaire, stockage Supabase Storage privé), dans la branche
isolée `agent/retours`.

## Avancement
Session de cadrage : analyse du code existant (sync Supabase, navigation, écran voisin
`E121ManualTests`) et rédaction de `roadmap_retours_annotes.md` (6 phases `[TODO]`). Décisions
produit tranchées avec l'utilisateur :
- D1 : capture = `<input type="file">` + collage presse-papier (pattern repris du bridge ROBERTO,
  UI seulement, aucune dépendance au projet Roberto).
- D2 : badge de code d'écran (E##) permanent sur chaque écran.
- D2bis : point d'entrée = bouton flottant global (pas une entrée Paramètres).
- D3 : risque accepté sur la policy `insert` Storage ouverte à `anon` (dépôt parasite possible,
  pas de fuite de données ; alternative Edge Function écartée, hors périmètre de l'agent).
- D4-D7 (défauts non contestés) : image envoyée aplatie + traits vectoriels en JSON, compression
  client obligatoire, écriture locale d'abord + envoi opportuniste rejouable, coexistence pleine
  avec le flux Google Doc tant que non validé.

Aucune ligne de code écrite. Aucun commit de contenu applicatif — seuls les fichiers de contexte
et la roadmap.

## Blocages
Aucun.

## Prochain pas
Phase 1 de `roadmap_retours_annotes.md` : entité `FeedbackReport`, migration Dexie `version(19)`,
repository, règles de validité, tests. Checkpoint `/compact` après chaque phase.

## Commit proposé
`close(retours): session 2026-09-04 — roadmap et décisions produit D1-D3`
(fichiers `_contexte/`, `roadmap_retours_annotes.md` — aucun code applicatif).

## Fichiers modifiés
- `roadmap_retours_annotes.md` (créé)
- `_contexte/signals.md`, `_contexte/contexte.md`, `_contexte/statut.md`
- `_contexte/messages.md` (supprimé, consigne absorbée)

## Tests et migrations
Aucun — aucune ligne de code écrite cette session.

## Points à valider par le coordinateur
Décisions D1-D3 ci-dessus tranchées directement par l'utilisateur ; à titre informatif pour
`TESTS`, pas de question en attente.
