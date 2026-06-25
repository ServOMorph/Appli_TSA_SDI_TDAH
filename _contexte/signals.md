# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 6 close — MVP stable, 46/46 E2E Playwright + 241 tests Vitest (99.34%), validé mobile physique
- UX polish réalisée : drag-and-drop E22, braille dots, boutons retour harmonisés, fix navigation taskDetailOrigin
- Tous les écrans ont désormais le même pattern "← Retour" en haut (bouton natif, aria-label="Retour")

## Dernière session (2026-06-25)

# Session du 2026-06-25 — polish UX post-Phase 6

## Décisions prises
- Drag-and-drop des sous-tâches dans E22 (pas E23 — E23 sert à la décomposition)
- taskDetailOrigin dans AppContext pour mémoriser l'écran d'origine et corriger la navigation retour
- Bouton supprimer (×) à droite des sous-tâches E22 (remplace la checkbox)
- Harmonisation boutons "← Retour" en haut sur tous les écrans (pattern E22 comme référence)
- "Terminer" et "Supprimer" conservés tous les deux dans E22 (fonctions distinctes)

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx` : braille dots ⠿ sur cartes + setTaskDetailOrigin
- `src/ui/screens/tasks/E22TaskDetail.tsx` : DnD sous-tâches, bouton ×, fix retour taskDetailOrigin, refreshDashboard
- `src/ui/screens/tasks/E23Decompose.tsx` : braille dots ⠿ sur sous-tâches
- `src/app/AppContext.tsx` : taskDetailOrigin state + setTaskDetailOrigin exposé
- `src/test/testUtils.tsx` : taskDetailOrigin + setTaskDetailOrigin dans makeAppContext
- `src/ui/screens/settings/E110–E117` : bouton "← Retour" déplacé en haut
- `src/ui/screens/energy/E30–E31` : bouton "← Retour" déplacé en haut
- `src/ui/screens/settings/E110–E117.test.tsx` : getByRole au lieu de getByText pour Retour

## Hypothèses validées / invalidées
- VALIDE : pattern taskDetailOrigin minimal suffit pour corriger la navigation retour sans refacto du routeur
- VALIDE : refreshDashboard() après deleteSubTask corrige l'affichage périmé dans E10

## Prochaine étape exacte
Phase 7 — Recruter 5 à 10 utilisateurs AuDHD réels, organiser les sessions de test, documenter les frictions.

## Question bloquante pour la session suivante
Aucune
