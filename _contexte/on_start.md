# Hooks /start — zone Appli_TSA_SDI_TDAH

## Pré-synthèse

Sauvegarder le dernier snapshot Supabase de Marie avant d'afficher la synthèse :
```bash
( set -a; . ./.env; set +a; python scripts/backup_marie_snapshot.py )
```
Non bloquant — en cas d'échec (hors ligne, Supabase indisponible), le signaler en une ligne et
poursuivre `/start`. Le script est idempotent (aucune réécriture si le snapshot courant est déjà
sauvegardé) et écrit dans `donnees_marie/` (gitignoré). Ne jamais afficher le contenu de `.env`.
