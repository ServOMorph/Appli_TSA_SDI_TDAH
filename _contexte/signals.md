# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7
- [P1|ouvert] Valider E2E Playwright après refacto dashboard
  - fait quand: `npm run test:e2e` passe 46/46
  - réf: `e2e/` — libellés mis à jour (Tableau de bord → Appli pour AuDHD, Mon énergie → pill, Activer mode surcharge → Activer le mode surcharge)
- [P2|ouvert] Fix test préexistant `E22TaskDetail > affiche les sous-étapes chargées`
  - fait quand: test passe dans `npm run test`
  - réf: `src/ui/screens/tasks/E22TaskDetail.test.tsx` — lié aux modifs non commitées de subTaskRepository / actionImmediateRules (hors refacto UI)

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Dashboard refactorisé : TopBar (nom + pill énergie + pill surcharge + roue ⚙), nav compactée (1 bouton + rangée segmentée 3 sections)
- Fix scroll latéral validé en build prod (overflow-x: clip, DevResetButton absent) ✅
- run_dev.py / run_prod.py (+ --host) disponibles à la racine

## Dernière session (2026-06-25)

# Session du 2026-06-25 — refacto dashboard UI + outils de lancement

## Décisions prises
- Dashboard sans scroll : TopBar (titre « Appli pour AuDHD » + roue ⚙ + pills énergie/surcharge) + nav segmentée (Inbox / Aujourd'hui / Plus tard) remplace les 7 boutons empilés
- `run_dev.py` / `run_prod.py` remplacent `run.py` pour lancer dev et prod séparément avec `--host`
- Fix scroll latéral validé en build prod (overflow-x: clip, DevResetButton absent) ✅

## Livrables produits ou modifiés
- `src/ui/components/TopBar.tsx` : nouveau composant (titre, pill énergie, pill surcharge, roue ⚙)
- `src/ui/screens/dashboard/E10Dashboard.tsx` : refacto complète (TopBar, nav segmentée, marginTop auto)
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : tests adaptés (26/26)
- `e2e/*.spec.ts` + `e2e/helpers/reset.ts` : libellés remappés (Tableau de bord, Mon énergie, Activer mode surcharge)
- `src/app/AppContext.tsx` : fix TS `taskId` → `_taskId`
- `run_dev.py` / `run_prod.py` : scripts de lancement avec `--host`
- `SERVEURS.md` : liens localhost PC + mobile

## Hypothèses validées / invalidées
- VALIDE : fix scroll latéral (overflow-x: clip) confirmé en build prod sans DevResetButton
- VALIDE : dashboard tient sans scroll avec TopBar + nav segmentée
- EN ATTENTE : E2E Playwright 46/46 à relancer sur le build prod (libellés mis à jour)

## Prochaine étape exacte
1. Lancer `npm run test:e2e` pour valider les 46 E2E avec les nouveaux libellés
2. Corriger le test préexistant E22TaskDetail (subTaskRepository)
3. Démarrer Phase 7 : recruter 5 à 10 utilisateurs AuDHD réels

## Question bloquante pour la session suivante
Aucune
