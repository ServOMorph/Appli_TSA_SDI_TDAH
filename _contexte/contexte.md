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
Documentation produit complète et cohérente (6 docs de dev + cahier des charges). Stack technique arrêtée. Trous fonctionnels comblés (action immédiate, énergie skipped, notifs). Aucun code produit. Prêt à démarrer le développement du MVP.

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-23 : Initialisation du protocole vibecoding.
- 2026-06-23 : Stack arrêtée — React/TS PWA, Dexie, Web Crypto, Capacitor pour mobile futur.
- 2026-06-23 : Sync cloud reportée post-MVP (Supabase UE), Firebase écarté (RGPD).
- 2026-06-23 : Entité Event hors MVP, documentée pour V1 post-validation.
- 2026-06-23 : Cascade "Action immédiate" formalisée (déterministe, 4 étapes MVP).
- 2026-06-23 : Distinction notification push (max 2/j) vs suggestion in-app (illimitée/passive).
