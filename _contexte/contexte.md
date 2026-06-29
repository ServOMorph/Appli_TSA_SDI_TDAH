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
Phase 7 en cours : première session test avec Marie complétée (2026-06-29, 35 min, Netlify fonctionnel).
Retours utilisateur documentés et analysés ; `roadmap_v2.md` créée (11 phases).
V2 prête à démarrer : Phase V2-0 (tag + branche + archive dist) est la prochaine action.
Marie accepte le reset données ; schéma Dexie v2 peut repartir proprement sans contrainte de compatibilité.
MVP V1 stable archivé : `Archives/roadmap_v1.md`, tag `v1.0-mvp` à poser en V2-0.

## Décisions structurantes (append only — 10 entrées max, archiver au-delà)
- 2026-06-25 : "cuillères" renommé "souffle" — terme inventé, court, compréhensible, sans référence théorique (spoon theory).
- 2026-06-25 : Bug fix addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi → sous-tâche visible dans "Que faire maintenant?" après décomposition.
- 2026-06-25 : Vitest limité aux tests `src/` ; les specs `e2e/` sont réservées au runner Playwright.
- 2026-06-25 : E120Resources ajouté — écran ressources depuis dashboard, avec fondements de conception, mode d’emploi et liens utiles en attente.
- 2026-06-25 : Orchestration `npm run test:e2e` validée — build + preview Playwright + 46/46 sans serveur manuel.
- 2026-06-25 : Phase 7 démarre par test distant — déploiement manuel Netlify, observation accompagnée, données locales navigateur.
- 2026-06-25 : Onboarding ajusté pour test utilisateur — image bienvenue générée, bouton `Entrer`, profils sans âges affichés, écran mobile sans scroll vérifié.
- 2026-06-29 : Session test Marie — Netlify déployé et fonctionnel ; retours documentés dans `Note de réunion/`.
- 2026-06-29 : `roadmap_v2.md` créée (11 phases) ; `roadmap.md` archivé dans `Archives/roadmap_v1.md`.
- 2026-06-29 : Reset données accepté par Marie — schéma Dexie v2 propre, sans migration de compatibilité v1.
