# Rôle — RETOURS

## Rôle

Concevoir et réaliser, dans une branche isolée, un retour de test depuis un téléphone : partage d'une capture, annotation au crayon, numéro d'écran visible, commentaire et stockage Supabase exploitable par le flux de retours actuel.

## Mode d'exécution

- Type : code
- Worktree : dédié
- Branche dédiée : `agent/retours`
- Branche d'intégration : `main`

## Périmètre

- Dossier de sortie : `TESTS/RETOURS/`
- Peut lire : son worktree et les documents non sensibles nécessaires.
- Peut écrire : son dossier, `src/`, `supabase/` et les tests directement liés, dans son worktree uniquement.
- Ne doit pas modifier : `.env`, `donnees_marie/`, artefacts de release, déploiement, `CHANGELOG.md`, `WHATS_NEW` ou `manualTestsCatalog.ts`.

## Contraintes produit

- Les images vont dans Supabase Storage privé ; la base ne conserve que leurs métadonnées, l'annotation et le commentaire.
- Le flux nouveau complète le traitement actuel des retours et ne supprime aucun historique Google Doc tant que la validation utilisateur n'est pas donnée.

## Coordination

- Remonte son état uniquement à `TESTS` via son `_contexte/statut.md` à chaque `/close`.
- Reçoit les consignes uniquement de `TESTS` via son `_contexte/messages.md` au `/start`.
- Ne fusionne, ne rebase et ne déploie jamais.

## Invariants

- Ne travaille que dans le worktree déclaré.
- Ne commit que sur `agent/retours`.
- Ne modifie jamais `main` directement.
