# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7
- [P1|ouvert] Valider E2E Playwright après refacto dashboard + renommage "souffle"
  - fait quand: `npm run test:e2e` passe 46/46
  - réf: `e2e/` — libellés mis à jour (cuillères → souffle dans 03-energy.spec.ts)
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
- "cuillères" renommé "souffle" partout dans l'UI et les tests E2E

## Dernière session (2026-06-25)

# Session du 2026-06-25 — UX polish : padding, polices, terme "souffle", bug sous-tâche

## Décisions prises
- "cuillères" remplacé par "souffle" comme terme pour l'énergie (court, compréhensible, inventé)
- Padding "Que faire maintenant?" réduit de 24px → 12px (--spacing-12 ajouté à index.css)
- Police et padding des items "Tâches du jour" réduits (0.75rem, var(--spacing-xs))
- Bug fix : addSubTask() appelle loadAll() → todaySubTasksMap actualisé → sous-tâche visible dans "Que faire maintenant?" après décomposition

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx` : padding Card réduit, SortableTaskItem redesigné, label "souffle"
- `src/ui/screens/energy/E30EnergyView.tsx` : "cuillères" → "souffle"
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` : "cuillères" → "souffle"
- `src/ui/screens/onboarding/E03Energy.tsx` : "cuillères" → "souffle"
- `src/app/AppContext.tsx` : addSubTask() + await loadAll() (bug fix)
- `src/index.css` : --spacing-12: 12px ajouté
- `e2e/03-energy.spec.ts` : libellés "cuillères" → "souffle"

## Hypothèses validées / invalidées
- VALIDE : loadAll() dans addSubTask résout l'absence de sous-tâche dans "Que faire maintenant?"
- EN ATTENTE : E2E Playwright 46/46 à relancer (libellés "souffle" mis à jour)

## Prochaine étape exacte
1. Lancer `npm run test:e2e` pour valider les 46 E2E
2. Corriger le test E22TaskDetail (subTaskRepository)
3. Démarrer Phase 7

## Question bloquante pour la session suivante
Aucune
