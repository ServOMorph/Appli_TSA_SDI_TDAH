---
description: Traite l'arrivée d'un nouvel export de Marie — analyse, détection de pertes/frictions, ingestion du journal de tests
argument-hint: [chemin de l'export JSON]
model: sonnet
allowed-tools: Bash(python scripts/ingest_manual_tests.py:*), Bash(cp:*), Bash(mv:*), Bash(ls:*), Bash(test -f:*), Bash(rclone:*), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

# /traiter_export_marie [chemin]

> **Repli manuel — hors flux nominal.** Depuis la bascule du 2026-09-01 (`roadmap_sync_marie.md` Phase 5), les données de Marie arrivent par synchronisation
> automatique (Supabase). `/start` archive le dernier snapshot daté dans `donnees_marie/` (`scripts/backup_marie_snapshot.py`) et `/deploy` étape 0 analyse ce snapshot. Cette
> commande ne sert plus qu'aux cas résiduels : Marie transmet encore un export JSON manuel, ou il faut ré-ingérer un ancien export. Elle n'est plus appelée par `/deploy`.

## Procédure

1. Localiser l'export.
   - Si $ARGUMENTS est fourni : l'utiliser comme chemin source.
   - Sinon : demander à l'utilisateur le chemin du fichier reçu (hors dépôt — jamais dans
     `donnees_marie/` avant cette commande).

2. Lire l'export source et en extraire `export_date` et `version`.
   - JSON invalide ou clés `export_date`/`version` absentes : s'arrêter, signaler le fichier
     comme corrompu ou hors format attendu.

3. Comparer à `donnees_marie/` (donnée sensible, lecture déjà couverte par l'exécution de cette
   commande — ne jamais y écrire hors de cette étape).
   - Lister les exports déjà présents, identifier le plus récent par `export_date` (pas par nom
     de fichier ni date de modification).
   - Si l'export source a un `export_date` antérieur ou égal au plus récent déjà présent :
     s'arrêter, signaler qu'il n'apporte rien de nouveau (doublon ou export plus ancien).
   - Sinon : c'est le nouvel export à traiter. Le copier dans `donnees_marie/` sous un nom
     normalisé `export-audhd-<export_date AAAA-MM-JJ>-<HHhMM>.json` (dérivé de `export_date`, pas
     de l'heure de réception) — ne jamais écraser un fichier existant du dossier.

4. Analyser le payload complet par rapport au dernier export précédemment traité (celui identifié
   à l'étape 3 avant la copie) :
   - pour chaque table du JSON (pas seulement `manual_test_results`) : comparer les identifiants
     présents pour détecter une perte de données (entrée disparue sans suppression volontaire
     plausible) ;
   - repérer les changements structurels (nouveau champ, champ disparu, migration de schéma) et
     vérifier qu'ils correspondent à une évolution connue du code (`git log`, `CHANGELOG.md`) —
     sinon les signaler comme incohérence ;
   - toute perte ou incohérence trouvée : la documenter précisément (table, identifiant, nature de
     l'écart) pour le rapport de l'étape 8.

5. Repérer les frictions signalées par Marie :
   - tous les commentaires non vides des résultats `nok` de `manual_test_results` ;
   - pour chaque nouveau commentaire (résultat absent du journal `_contexte/marie_tests_journal.json`
     avant ingestion), déterminer s'il décrit un bug applicatif réel, un problème de formulation du
     test dans `manualTestsCatalog.ts`, ou une demande d'évolution — sans corriger le code ni le
     catalogue automatiquement.
   - Pour chaque nouveau retour qui reste utile à communiquer, ajouter une entrée courte dans
     `COMMUNICATION/Marie/a_transmettre.md`, sous « Retour d'export déjà corrigé » ou « Questions où nous avons
     besoin de ton choix ». Ne pas y recopier les retours déjà clos ou invalidés. Un comportement à faire
     revalider par Marie va dans le catalogue in-app `manualTestsCatalog.ts`, jamais dans ce fichier
     (cf. `CLAUDE.md` § Spécificités projet).

6. Ingérer les résultats de tests :
   ```
   python scripts/ingest_manual_tests.py <export copié à l'étape 3>
   ```
   Rapporter le nombre d'entrées ajoutées et déjà connues (sortie du script).

7. Revue du Google Doc de Marie : exécuter la procédure `.claude/revue_googledoc.md`. Reprendre son
   compte-rendu dans le rapport de l'étape 8. Cette revue ne bloque pas la commande : elle détecte
   un éventuel changement du Doc et réconcilie le registre, sans créer de roadmap.

8. Rapporter à l'utilisateur, sans corriger automatiquement :
   - version et date de l'export traité, nom du fichier créé dans `donnees_marie/` ;
   - résultat de l'ingestion (ajoutés / déjà connus) ;
   - toute perte ou incohérence de données détectée à l'étape 4 ;
   - chaque friction détectée à l'étape 5, avec sa nature (bug applicatif / formulation de test /
     demande d'évolution) et une proposition de traitement ;
   - le compte-rendu de la revue du Google Doc (étape 7) : Doc inchangé, ou différentiel d'états du
     registre et nouvelles demandes ;
   - si rien à signaler : le dire explicitement plutôt que rester silencieux sur ce point.

9. Ne jamais committer `donnees_marie/` (gitignoré). Si `_contexte/marie_tests_journal.json` ou
   `_contexte/marie_modifications_suivi.md` ont été modifiés, ne pas les committer automatiquement —
   le signaler dans le rapport et laisser le commit à la charge du prochain `/close`.
