# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-24)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 2 (Onboarding + Dashboard)
  - fait quand: écrans E01–E04 et E10 créés, parcours onboarding complet jusqu'au dashboard, tests ≥ 85 %
  - réf: `roadmap.md` Phase 2, `_docs/docs de dev/3- ARCHITECTURE DES ÉCRANS.md`
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 1 complète : schéma Dexie, 5 repositories CRUD, domaine pur, 71 tests, couverture 98.26 %
- fake-indexeddb : utiliser `import 'fake-indexeddb/auto'` dans setup.ts (register() n'existe pas)
- AppDatabase accepte un name optionnel pour isoler les tests (new AppDatabase(`test-${++n}`))
- Champs sensibles chiffrés : Task.title, SubTask.title, EnergyEntry.value (password optionnel)
- Isolement domaine/infra validé : src/domain/ ne contient aucun import Dexie/crypto/data
- App tourne sur localhost:5173 (template Vite par défaut — sera remplacé Phase 2)
- `run.py` à la racine pour lancer `npm run dev`

## Dernière session (2026-06-24)

# Session du 2026-06-24

## Décisions prises
- Phase 1 complète : couche données & domaine opérationnelle, isolement domaine/infra strict validé
- Chiffrement transparent des champs sensibles au niveau repository (optionnel via password)
- fake-indexeddb utilisé via `import 'fake-indexeddb/auto'` dans setup.ts (pas de register())
- AppDatabase accepte un name optionnel pour isoler les tests (une DB par beforeEach)

## Livrables produits ou modifiés
- `src/domain/entities/` (5 fichiers) : types purs User, Task, SubTask, EnergyEntry, Settings
- `src/domain/rules/taskRules.ts` + tests : canAddToToday, sortByPosition, nextPosition, completeTask
- `src/domain/rules/energyRules.ts` + tests : hasCheckedInToday, getLatestFilledValue, getTodayEntry
- `src/domain/rules/actionImmediateRules.ts` + tests : cascade Action immédiate MVP
- `src/data/db.ts` + tests : schéma Dexie v1, 5 tables, name optionnel
- `src/data/repositories/` (5 repositories + tests) : CRUD complet + chiffrement transparent
- `docs/adr/ADR-003-domaine-infra.md` : règle isolement domaine/infra + vérification grep
- `src/test/setup.ts` : ajout `fake-indexeddb/auto`
- `package.json` / `package-lock.json` : ajout devDependency `fake-indexeddb`

## Hypothèses validées / invalidées
- VALIDE : 71/71 tests passent, couverture 98.26 % global (seuil 85 % respecté)
- VALIDE : isolement domaine/infra — grep confirme zéro import interdit dans src/domain/
- VALIDE : fake-indexeddb fonctionne via import auto dans le setup global
- INVALIDE : register() from 'fake-indexeddb' → n'existe pas, utiliser l'import auto

## Prochaine étape exacte
Phase 2 — Onboarding + Dashboard : créer les écrans E01–E04 (bienvenue, profil, estimation énergie, première tâche) et E10 (dashboard) avec Action immédiate, cuillères, tâches du jour.

## Question bloquante pour la session suivante
Aucune
