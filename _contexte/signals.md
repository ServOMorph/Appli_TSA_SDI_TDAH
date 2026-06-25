# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 5 (Paramètres, accessibilité, surcharge, export)
  - fait quand: E111–E117, E90, export JSON RGPD, tests ≥ 85 %, test manuel validé
  - réf: `roadmap.md` Phase 5
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 4 complète : 190 tests, 17 tests manuels validés
- E30 (EnergyView) + E31 (EnergyCheckIn) créés dans `src/ui/screens/energy/`
- todayEnergyStatus: 'filled' | 'skipped' | null ajouté à AppContext (distingue skipped de non-fait)
- DevResetButton : sélecteur date simulée via localStorage('dev_fake_date') pour tester J+1
- DevResetButton : SCREEN_CODES complété avec E30/E31
- Liaison énergie ↔ Action immédiate : confirmé reportée en V2 (doc User Flows §9)
- Génération auto sous-tâches : post-V1 (nice-to-have, décidé cette session)

## Dernière session (2026-06-25)

# Session du 2026-06-25 — Phase 4

## Décisions prises
- Phase 4 complète : gestion énergie quotidienne opérationnelle (E30, E31, skip)
- Génération auto sous-tâches (E23 enrichi) → post-V1, nice-to-have
- todayEnergyStatus ajouté à AppContext car todayEnergy: null ne distingue pas skipped de non-fait
- Liaison énergie ↔ Action immédiate confirmée reportée en V2 (doc User Flows §9, ligne 364)
- DevResetButton enrichi : sélecteur date simulée (localStorage) pour tests J+1 en DEV

## Livrables produits ou modifiés
- `src/ui/screens/energy/E30EnergyView.tsx` + tests : affichage énergie du jour (3 états), 7 tests
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` + tests : formulaire check-in grille 1-10, 8 tests
- `src/app/AppContext.tsx` : Screen + 'energy-view'/'energy-checkin', todayEnergyStatus state
- `src/App.tsx` : +2 routes energy-view / energy-checkin
- `src/ui/screens/dashboard/E10Dashboard.tsx` : badge cliquable, encart CTA, "Énergie ignorée", bouton "Mon énergie"
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : +5 cas énergie
- `src/ui/components/DevResetButton.tsx` : sélecteur date simulée + E30/E31 dans SCREEN_CODES
- `src/test/testUtils.tsx` : todayEnergyStatus: null dans makeAppContext

## Hypothèses validées / invalidées
- VALIDE : 190/190 tests passent, couverture maintenue ≥ 85 %
- VALIDE : 17 tests manuels validés (check-in, skip, cycle complet, J+1)
- VALIDE : liaison énergie ↔ Action immédiate = affichage seul en MVP (doc confirme V2)
- VALIDE : todayEnergyStatus nécessaire pour distinguer skipped de non-fait

## Prochaine étape exacte
Phase 5 — Paramètres, accessibilité, surcharge, export. Démarrer par E111 (profil) ou E90 (surcharge).

## Question bloquante pour la session suivante
Aucune
