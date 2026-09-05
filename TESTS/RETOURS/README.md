# Retours annotés

Le flux conserve d'abord le retour dans Dexie, puis tente l'envoi au démarrage, à la création et
au retour réseau :

```text
capture + annotation + commentaire
  -> image JPEG aplatie et compressée + traits JSON
  -> Dexie feedbackReports (pending)
  -> Storage privé feedback/{device_id}/{report_id}.jpg
  -> RPC submit_feedback
  -> feedback_reports (sent), ou failed puis relance
```

L'image déjà déposée est réutilisée si la RPC échoue : aucune seconde image n'est créée lors de la
relance. Sans configuration Supabase, le retour reste local et l'application reste utilisable.

## Migration

1. Appliquer `supabase/schema.sql` si ce schéma n'est pas déjà présent.
2. Dans le SQL Editor Supabase, appliquer `supabase/feedback.sql` une fois, sans le modifier.
3. Déployer ensuite l'application normalement. La migration Dexie vers la version 19 est exécutée
   par le navigateur et ne demande aucune action serveur.

Le SQL crée la table `feedback_reports`, la RPC `submit_feedback`, le bucket privé `feedback` et
sa seule policy : insertion par `anon` limitée à ce bucket. Il ne crée aucun droit de lecture,
modification ou suppression pour `anon`.

## Lecture développeur

Définir les deux variables dans l'environnement du terminal, sans les écrire dans un fichier suivi :

```powershell
$env:SUPABASE_URL = 'https://<projet>.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY = '<cle-service-role>'
python scripts/read_feedback_reports.py --output-dir feedback-reports
```

Le script affiche les métadonnées JSON et télécharge les images privées dans le dossier demandé.
Options utiles :

```powershell
python scripts/read_feedback_reports.py --device-id <uuid> --output-dir feedback-reports
python scripts/read_feedback_reports.py --no-download
python scripts/test_read_feedback_reports.py
```

La clé `SUPABASE_SERVICE_ROLE_KEY` est nécessaire car les objets et les métadonnées ne sont pas
accessibles au rôle `anon`. Le script ne l'affiche ni ne la journalise.
