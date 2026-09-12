# Hooks /start — zone Appli_TSA_SDI_TDAH

## Pré-synthèse

Sauvegarder le dernier snapshot Supabase de chaque testeur actif avant d'afficher la synthèse :
```bash
python scripts/backup_testeur_snapshots.py
```
Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne et
poursuivre `/start`. Le script lit `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` dans
l'environnement, sinon dans le `.env` à la racine (aucun sourcing shell). Il est idempotent (aucune
réécriture si le snapshot courant est déjà sauvegardé) et écrit dans `donnees_testeurs/<tester_code>/`
(gitignoré) — un appareil sans code testeur va dans `donnees_testeurs/_sans_code/`.
Ne jamais afficher le contenu de `.env` ni celui d'un snapshot.
