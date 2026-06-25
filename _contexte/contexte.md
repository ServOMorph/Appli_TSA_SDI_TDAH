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
Phase 6 close. MVP stable : 253 tests Vitest (252 passent — 1 préexistant E22 à corriger), 46 E2E Playwright (libellés mis à jour, à relancer). Dashboard refactorisé sans scroll : TopBar (titre « Appli pour AuDHD » + ⚙ + pills énergie/surcharge) + nav segmentée. Fix scroll latéral validé en prod. Phase 7 à démarrer.

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-24 : Phase 3 complète — E20–E25, modales M01/M04, cycle vie tâche, 168 tests 94.17 %, 31 tests manuels ok.
- 2026-06-24 : var(--color-bg) inexistant — toujours utiliser var(--color-surface) pour les fonds opaques.
- 2026-06-25 : Phase 4 complète — E30/E31, todayEnergyStatus, sélecteur date DEV, 190 tests, 17 tests manuels ok.
- 2026-06-25 : liaison énergie ↔ Action immédiate reportée en V2 (doc User Flows §9). Génération auto sous-tâches post-V1.
- 2026-06-25 : Phase 5 complète — E90/E110–E117, Settings DOM, export RGPD, 232 tests, 22 tests manuels ok.
- 2026-06-25 : E90 simplifié — "Retour au dashboard" supprimé (boucle sans issue), seul "Désactiver" disponible.
- 2026-06-25 : Phase 6 code complète — audit architecture, 99.34% couverture, build PWA, erasableSyntaxOnly fix, offline validé.
- 2026-06-25 : Tests E2E Playwright adoptés (46/46, 12.7s) — remplacent les tests manuels desktop.
- 2026-06-25 : Phase 6 close — flux validés mobile physique. crypto.randomUUID() remplacé par fallback getRandomValues (non-secure context HTTP).
- 2026-06-25 : overflow-x: clip sur html/body — bloque scroll latéral mobile (sr-only dnd-kit à -1px). Validé en prod ✅
- 2026-06-25 : Dashboard refactorisé sans scroll — TopBar (titre « Appli pour AuDHD », ⚙ réglages, pill énergie, pill surcharge) + nav segmentée (Inbox / Aujourd'hui / Plus tard). Remplace les 7 boutons empilés.
