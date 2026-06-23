# Appli TSA/SDI/TDAH — AuDHD

Application neuroinclusive (web PWA + mobile) pour personnes AuDHD (TSA sans déficience intellectuelle + TDAH, 14–40 ans).

## Objectif

Agir comme un système externe de fonctions exécutives : réduire la charge mentale quotidienne, soutenir les routines, maintenir les relations sociales, gérer l'énergie. Pas un outil de productivité classique.

## État actuel

Documentation produit complète et cohérente. Stack technique arrêtée. Roadmap créée (15 phases). Aucun code produit. Prêt à démarrer Phase 0 (initialisation socle technique).

## Stack

- React + TypeScript, PWA (Vite)
- Stockage local : IndexedDB via Dexie.js
- Chiffrement : Web Crypto API (AES-GCM / PBKDF2)
- Mobile futur : Capacitor (même codebase web)
- Sync cloud : post-MVP, Supabase région UE

## Structure

```
_docs/              Documentation produit (cahier des charges + 6 docs de dev)
_contexte/          Contexte de session (protocole vibecoding)
CHANGELOG.md
```

## Prochaine étape

Phase 0 — Initialiser le projet React/TS/PWA : Vite, ESLint, Prettier, Vitest, structure de dossiers découplée (`domain/`, `data/`, `ui/`, `crypto/`, `app/`).

## Licence

MIT — voir [LICENSE](LICENSE).
