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
Phase 6 close. MVP stable : 259 tests Vitest passent, 46 scénarios E2E Playwright passent via `npm run test:e2e`.
Phase 7 démarrée côté préparation : premier testeur distant identifié, consignes de test et confidentialité cadrées.
Déploiement test prévu via Netlify manuel : `npm run build` passe et régénère `dist/`.
Les données testeur restent locales dans son navigateur ; aucune collecte automatique.
Connexion Google écartée du périmètre immédiat, à réévaluer avec la sync V2.

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-25 : Tests E2E Playwright adoptés (46/46, 12.7s) — remplacent les tests manuels desktop.
- 2026-06-25 : Phase 6 close — flux validés mobile physique. crypto.randomUUID() remplacé par fallback getRandomValues (non-secure context HTTP).
- 2026-06-25 : overflow-x: clip sur html/body — bloque scroll latéral mobile (sr-only dnd-kit à -1px). Validé en prod ✅
- 2026-06-25 : Dashboard refactorisé sans scroll — TopBar (titre « Appli pour AuDHD », ⚙ réglages, pill énergie, pill surcharge) + nav segmentée (Inbox / Aujourd'hui / Plus tard). Remplace les 7 boutons empilés.
- 2026-06-25 : "cuillères" renommé "souffle" — terme inventé, court, compréhensible, sans référence théorique (spoon theory).
- 2026-06-25 : Bug fix addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi → sous-tâche visible dans "Que faire maintenant?" après décomposition.
- 2026-06-25 : Vitest limité aux tests `src/` ; les specs `e2e/` sont réservées au runner Playwright.
- 2026-06-25 : E120Resources ajouté — écran ressources depuis dashboard, avec fondements de conception, mode d’emploi et liens utiles en attente.
- 2026-06-25 : Orchestration `npm run test:e2e` validée — build + preview Playwright + 46/46 sans serveur manuel.
- 2026-06-25 : Phase 7 démarre par test distant — déploiement manuel Netlify, observation accompagnée, données locales navigateur.
