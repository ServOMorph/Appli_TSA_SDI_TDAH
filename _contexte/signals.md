# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Démarrer Phase 6 (Consolidation MVP : refacto, couverture globale, offline)
  - fait quand: audit architecture fait, couverture ≥ 85 % global, tests PWA offline validés, README à jour
  - réf: `roadmap.md` Phase 6
- [P2|ouvert] Tests utilisateurs AuDHD réels (Phase 7 — post-MVP)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- Phase 5 complète : 232 tests, 22 tests manuels validés
- Settings persistés via SettingsRepository, appliqués au DOM via useEffect dans AppContext
- Font sizes : small=13px, medium=16px, large=22px
- CSS stimulation : `html[data-stimulation="calm"]` → boutons teal, `html[data-stimulation="dynamic"]` → boutons violet
- E90OverloadRecovery : "Retour au dashboard" supprimé (créait une boucle), seul "Désactiver" disponible
- "Activer mode surcharge" ajouté au dashboard normal (bouton nav en bas)

## Dernière session (2026-06-25)

# Session du 2026-06-25 — Phase 5

## Décisions prises
- Phase 5 complète : paramètres, accessibilité, surcharge, export RGPD opérationnels
- Font sizes : small=13px / medium=16px / large=22px (écarts perceptibles)
- Stimulation mode : différenciation CSS visuelle via `html[data-stimulation]` (teal / violet / default)
- E90 simplifié : suppression du bouton "Retour au dashboard" qui créait une boucle impossible à sortir
- "Activer mode surcharge" ajouté dans la nav normale du dashboard

## Livrables produits ou modifiés
- `src/ui/screens/settings/E110Settings.tsx` + tests : menu paramètres, 6 entrées
- `src/ui/screens/settings/E111Profile.tsx` + tests : profil, stockage local
- `src/ui/screens/settings/E112Accessibility.tsx` + tests : taille texte, dark mode, reduce-motion
- `src/ui/screens/settings/E113Stimulation.tsx` + tests : mode calm/standard/dynamic
- `src/ui/screens/settings/E114Organisation.tsx` + tests : placeholder V1
- `src/ui/screens/settings/E116Privacy.tsx` + tests : suppression données (M06)
- `src/ui/screens/settings/E117Export.tsx` + tests : export JSON RGPD (M05)
- `src/ui/screens/overload/E90OverloadRecovery.tsx` + tests : centre récupération, flux simplifié
- `src/app/AppContext.tsx` : +8 screens, settings state, updateSettings, exportData, deleteAllData, font sizes
- `src/App.tsx` : +8 routes settings + overload-recovery
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton "Activer mode surcharge" + "Centre récupération"
- `src/ui/components/DevResetButton.tsx` : SCREEN_CODES E90–E117
- `src/test/testUtils.tsx` : settings/updateSettings/exportData/deleteAllData dans makeAppContext
- `src/index.css` : dark-mode, reduce-motion, stimulation mode CSS

## Hypothèses validées / invalidées
- VALIDE : 232/232 tests passent, couverture maintenue ≥ 85 %
- VALIDE : 22 tests manuels validés (accessibilité, surcharge, export, suppression)
- VALIDE : export JSON RGPD déclenche bien le téléchargement fichier
- VALIDE : deleteAllData remet l'app à l'état initial (welcome)

## Prochaine étape exacte
Phase 6 — Consolidation MVP : audit architecture, couverture globale ≥ 85 %, tests offline PWA, README final.

## Question bloquante pour la session suivante
Aucune
