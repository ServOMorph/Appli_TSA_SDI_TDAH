# Décisions archivées — Appli_TSA_SDI_TDAH

## 2026-06-29 (archivé depuis contexte.md 2026-07-01)
- Session test Marie — Netlify déployé et fonctionnel ; retours documentés dans `Note de réunion/`.
- `roadmap_v2.md` créée (11 phases) ; `roadmap.md` archivé dans `Archives/roadmap_v1.md`.
- Reset données accepté par Marie — schéma Dexie v2 propre, sans migration de compatibilité v1.
- V2-0 close — tag `v1.0-mvp`, branche `v2`, `dist_v1/` archivé ; rollback V1 en une commande.
- V2-1 close — vocabulaire UI : souffle→énergie, Inbox→Todo, Plus tard→À faire plus tard (259/259 tests).

## 2026-06-25 (archivé depuis contexte.md 2026-06-29 session 2)
- "cuillères" renommé "souffle" — terme inventé, court, compréhensible, sans référence théorique (spoon theory).
- Bug fix addSubTask() — await loadAll() ajouté → todaySubTasksMap rafraîchi → sous-tâche visible dans "Que faire maintenant?" après décomposition.
- Vitest limité aux tests `src/` ; les specs `e2e/` sont réservées au runner Playwright.
- E120Resources ajouté — écran ressources depuis dashboard, avec fondements de conception, mode d'emploi et liens utiles en attente.
- Orchestration `npm run test:e2e` validée — build + preview Playwright + 46/46 sans serveur manuel.
- Phase 7 démarre par test distant — déploiement manuel Netlify, observation accompagnée, données locales navigateur.
- Onboarding ajusté pour test utilisateur — image bienvenue générée, bouton `Entrer`, profils sans âges affichés, écran mobile sans scroll vérifié.

## 2026-06-25 (archivé depuis contexte.md 2026-06-29)
- Phase 6 close — flux validés mobile physique. crypto.randomUUID() remplacé par fallback getRandomValues (non-secure context HTTP).
- overflow-x: clip sur html/body — bloque scroll latéral mobile (sr-only dnd-kit à -1px). Validé en prod ✅
- Dashboard refactorisé sans scroll — TopBar (titre « Appli pour AuDHD », ⚙ réglages, pill énergie, pill surcharge) + nav segmentée (Inbox / Aujourd'hui / Plus tard). Remplace les 7 boutons empilés.

## 2026-06-25 (antérieur)
- Phase 5 complète — E90/E110–E117, Settings DOM, export RGPD, 232 tests, 22 tests manuels ok.
- E90 simplifié — "Retour au dashboard" supprimé (boucle sans issue), seul "Désactiver" disponible.
- Phase 6 code complète — audit architecture, 99.34% couverture, build PWA, erasableSyntaxOnly fix, offline validé.
- Tests E2E Playwright adoptés (46/46, 12.7s) — remplacent les tests manuels desktop.
