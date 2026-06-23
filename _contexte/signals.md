# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-23)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 0 de la roadmap (initialisation socle technique)
  - fait quand: `package.json` créé, app se lance en local, Dexie initialisée avec les 5 entités MVP
  - réf: `roadmap.md` Phase 0
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Stack arrêtée : React + TypeScript, PWA (Vite), IndexedDB via Dexie.js, chiffrement Web Crypto API (AES-GCM/PBKDF2), portage mobile futur via Capacitor
- `roadmap.md` créée à la racine (15 phases, MVP → V1 → V2, coches de suivi)
- Repo public GitHub prêt : MIT, .gitignore en place

## Dernière session (2026-06-23)

# Session du 2026-06-23 (suite)

## Décisions prises
- Roadmap créée : 15 phases (MVP 0–7, V1 8–12, V2 13–14), coches de suivi [ ]/[~]/[x]
- Licence MIT adoptée pour le repo public GitHub

## Livrables produits ou modifiés
- `roadmap.md` : créée à la racine, 15 phases, coches de suivi
- `LICENSE` : MIT, copyright ServOMorph 2026
- `.gitignore` : Node/Vite/Capacitor/coverage
- `_contexte/signals.md` : actions P1/P2 alignées sur la roadmap

## Hypothèses validées / invalidées
- VALIDE : roadmap unique suffisante à ce stade (pas de split)
- VALIDE : MIT est la licence appropriée pour ce projet

## Prochaine étape exacte
Démarrer Phase 0 de `roadmap.md` : init Vite + React + TypeScript, outillage (ESLint, Prettier, Vitest, Testing Library), structure de dossiers découplée.

## Question bloquante pour la session suivante
Aucune
