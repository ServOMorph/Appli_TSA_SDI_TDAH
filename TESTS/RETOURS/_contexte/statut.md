# Statut — RETOURS

## Objectif
Concevoir et réaliser le flux de retours annotés depuis le téléphone (capture, annotation au
crayon, numéro d'écran visible, commentaire, stockage Supabase Storage privé), dans la branche
isolée `agent/retours`.

## Avancement
Le flux est implémenté et **commité** dans la branche `agent/retours` : saisie d'une capture,
annotation, commentaire, code d'écran visible, persistance Dexie, envoi opportuniste et lecture
développeur. Les retours restent locaux tant que Supabase est absent ou indisponible.

**Correctif de clôture (2026-09-05)** : le commit de clôture annoncé le 2026-09-04 n'avait en
réalité jamais été fait — seul un commit de roadmap/décisions (`2240123`) existait, tout le code
restait en working tree non commité. Corrigé par le commit de cette session.

## Migrations à intégrer

- Navigateur : Dexie passe à la version 19 et crée `feedbackReports` (`created_at`, `sync_status`).
- Supabase : appliquer manuellement `supabase/feedback.sql` après `supabase/schema.sql`.
  Le fichier crée `feedback_reports`, `submit_feedback`, le bucket privé `feedback` et une policy
  d'insertion `anon` sans droit de lecture, de modification ou de suppression.

## Intégration demandée

Relire et intégrer la branche `agent/retours` sans fusion automatique. Appliquer le SQL dans un
environnement Supabase contrôlé avant toute mise à disposition du backend.

## Commit de clôture

`close(retours): session 2026-09-05 — commit du flux de retours annotés reste de clôture 2026-09-04`

## Fichiers modifiés
- `src/` : domaine, Dexie, navigation, interface de capture et synchronisation.
- `supabase/feedback.sql` : table, RPC et bucket privé.
- `scripts/read_feedback_reports.py` et `scripts/_supabase.py` : lecture développeur.
- `TESTS/RETOURS/README.md` : procédure d'intégration et de lecture.
- Tests Vitest, Playwright et `scripts/test_read_feedback_reports.py` liés au flux.

## Tests et migrations

Résultats du 2026-09-04, **non re-vérifiés lors de la clôture du 2026-09-05** (aucun nouveau
développement, uniquement le commit du travail déjà réalisé) — à revérifier par TESTS avant
intégration :
- `python scripts/test_read_feedback_reports.py` : 6 tests passants.
- `python scripts/test_backup_marie_snapshot.py` : 31 tests passants.
- `tsc -b`, `npm run lint` et `npm run bundle:check` : passants.
- Vitest : 95 fichiers, 748 tests passants. Les avertissements React existants restent affichés.
- Playwright ciblé T58 : passant sur un aperçu isolé avec Supabase intercepté.
- La campagne Playwright complète n'est pas verte : des scénarios hors retours expirent dans les
  suites Budget, énergie, planning et surcharge. T58 est passant dans cette même campagne.

Les scripts Python utilisent uniquement des données synthétiques et ne contactent pas Supabase.

## Points à valider par le coordinateur

- D1 : sur téléphone, choisir une capture depuis la galerie puis vérifier collage presse-papier et
  repli vers le sélecteur de fichier.
- D2 : vérifier le badge E## permanent et le préremplissage du code dans un retour ouvert depuis
  plusieurs écrans.
- D3 : accepter explicitement le risque résiduel de dépôt parasite : la clé anon permet un dépôt
  dans `feedback`, sans lecture ni suppression. Une Edge Function avec URL signée réduirait ce
  risque, mais elle est hors périmètre de cette livraison.
- D4 : vérifier que l'image téléchargée est aplatie et lisible, avec les traits aussi présents dans
  les métadonnées JSON.

Parcours in-app à ajouter par le coordinateur, hors périmètre de cet agent : création avec image,
annotation, collage, état hors ligne, relance après réseau et affichage du badge sur les écrans.
