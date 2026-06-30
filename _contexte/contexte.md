# Contexte — Appli_TSA_SDI_TDAH

## Objectif (immuable sauf décision explicite)
Créer une application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans DI + TDAH, 14–40 ans) : réduire la charge mentale quotidienne, soutenir les fonctions exécutives, offline-first, confidentialité renforcée.

## Stack / contraintes techniques (stable, rarement modifié)
- Frontend : React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js (source de vérité V1)
- Chiffrement local : Web Crypto API, AES-GCM, clé PBKDF2
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : reportée post-MVP — Supabase région UE envisagé, Firebase écarté
- Offline-first strict : fonctionne sans serveur ni compte en V1

## État actuel (réécrit intégralement à chaque /close)
V2 en cours sur branche `v2` — Phases V2-0 à V2-3 closes (2026-06-30). Tag `v1.0-mvp` posé, `dist_v1/` archivé (rollback V1 opérationnel).
`db.ts` version(2) : TaskV2 + List + ListItem + Routine + RoutineStep en parallèle de v1. Tests 313/313.
Flux d'ajout refondu : E21CreateTaskV2 avec 3 destinations obligatoires (Todo / Planifier / À planifier plus tard).
Maquettes Marie disponibles (`Note de réunion/` — 3 captures). Prochaine action : Phase V2-4 — vue Planning (calendrier en cases).

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-29 : Session test Marie — Netlify déployé et fonctionnel ; retours documentés dans `Note de réunion/`.
- 2026-06-29 : `roadmap_v2.md` créée (11 phases) ; `roadmap.md` archivé dans `Archives/roadmap_v1.md`.
- 2026-06-29 : Reset données accepté par Marie — schéma Dexie v2 propre, sans migration de compatibilité v1.
- 2026-06-29 : V2-0 close — tag `v1.0-mvp`, branche `v2`, `dist_v1/` archivé ; rollback V1 en une commande.
- 2026-06-29 : V2-1 close — vocabulaire UI : souffle→énergie, Inbox→Todo, Plus tard→À faire plus tard (259/259 tests).
- 2026-06-29 : V2-2 close — schéma Dexie v2 parallèle (TaskV2, List, ListItem, Routine, RoutineStep) + règles métier + 301/301 tests.
- 2026-06-30 : V2-3 close — flux d'ajout refondu (E21CreateTaskV2, 3 destinations obligatoires, createTaskV2Dest) + 313/313 tests.
