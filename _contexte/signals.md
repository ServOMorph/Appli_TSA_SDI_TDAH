# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-24)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 4 (Décomposition & SubTasks avancée)
  - fait quand: E23 enrichi, génération automatique de sous-tâches, tests ≥ 85 %, test manuel validé
  - réf: `roadmap.md` Phase 4
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 3 complète : 168 tests, couverture 94.17 %, 31 tests manuels validés
- AppContext étendu : inboxTasks, todayTasks, laterTasks, moveTask, completeTask, deleteTask, selectTask, getSubTasks, toggleSubTask
- Screens ajoutés : E20 (Inbox), E21 (CreateTask), E22 (TaskDetail), E23 (Decompose), E24 (Today), E25 (Later)
- DevResetButton : affiche aussi le code écran (E01…E25) sous le bouton Reset DB
- Modales M01/M04 : backgroundColor var(--color-surface), overlay rgba(0,0,0,0.75), zIndex 1000
- Bug var(--color-bg) inexistant corrigé → var(--color-surface) = #1e293b en dark mode
- Button.tsx : opacity 0.4 + cursor not-allowed sur disabled
- Routing : Screen étendu à 'inbox' | 'task-create' | 'task-detail' | 'task-decompose' | 'today' | 'later'

## Dernière session (2026-06-24)

# Session du 2026-06-24 — Phase 3

## Décisions prises
- Phase 3 complète : gestion tâches inbox/today/later opérationnelle, 31 tests manuels validés
- DevResetButton déplacé dans AppScreens() (a accès à useApp) — DevScreenBadge abandonné, E-code dans l'overlay
- var(--color-bg) n'existe pas dans index.css — variable correcte : var(--color-surface)
- Limite 3 tâches aujourd'hui appliquée côté UI (modale M04 pour remplacement)
- Tâches E10 non cliquables par design — accès détail via E20 ou E24 uniquement

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : state machine étendue, 11 screens, logique tâches complète
- `src/ui/screens/tasks/E20Inbox.tsx` + tests : liste inbox, déplacement today/later, modale M04
- `src/ui/screens/tasks/E21CreateTask.tsx` + tests : formulaire création tâche
- `src/ui/screens/tasks/E22TaskDetail.tsx` + tests : détail, sous-tâches, terminer, supprimer
- `src/ui/screens/tasks/E23Decompose.tsx` + tests : décomposition manuelle en sous-tâches
- `src/ui/screens/tasks/E24Today.tsx` + tests : liste today, terminer, retirer
- `src/ui/screens/tasks/E25Later.tsx` + tests : liste later, déplacer vers today, modale M04
- `src/ui/components/Button.tsx` : disabled state (opacity 0.4, cursor not-allowed)
- `src/ui/components/DevResetButton.tsx` : SCREEN_CODES mapping, affichage E-code
- `src/App.tsx` : renderScreen() helper, DevResetButton dans AppScreens

## Hypothèses validées / invalidées
- VALIDE : 168/168 tests passent, couverture 94.17 %
- VALIDE : 31 tests manuels passent (cycle complet tâche, modales, dark mode)
- INVALIDE : var(--color-bg) — n'existe pas dans index.css (var(--color-surface) est le bon)
- VALIDE : state machine React useState suffit pour Phase 3

## Prochaine étape exacte
Phase 4 — voir roadmap.md

## Question bloquante pour la session suivante
Aucune
