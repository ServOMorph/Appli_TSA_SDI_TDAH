# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-06-25)

## Actions ouvertes
- [P1|ouvert] Tests utilisateurs AuDHD réels (Phase 7)
  - fait quand: 5 à 10 sessions de test réalisées, résultats documentés dans un fichier dédié
  - réf: `roadmap.md` Phase 7

## Questions ouvertes

## Échéances

## Blocages

## Contexte chaud
- `npm run test` passe 259/259
- `npm run test:e2e` passe 46/46 et lance le preview sans serveur manuel
- `npm run lint` et `npm run build` passent
- E120Resources ajouté : fondements de conception, mode d’emploi de l’application, liens utiles en attente
- run_dev.py / run_prod.py (+ --host) disponibles à la racine

## Dernière session (2026-06-25)

# Session du 2026-06-25

## Décisions prises
- E120Resources devient l’écran de ressources utilisateur, accessible depuis le dashboard par icône document.
- L’orchestration `npm run test:e2e` est validée : build + preview + 46 scénarios Playwright sans serveur manuel.

## Livrables produits ou modifiés
- `src/ui/components/TopBar.tsx` : bouton icône document “Ressources” ajouté
- `src/ui/screens/resources/E120Resources.tsx` : écran ressources créé
- `src/ui/screens/resources/E120Resources.test.tsx` : tests du nouvel écran ajoutés
- `src/App.tsx`, `src/app/AppContext.tsx`, `src/ui/components/DevResetButton.tsx` : route `resources` / code E120 branchés
- `src/ui/screens/dashboard/E10Dashboard*.tsx` : navigation dashboard → ressources testée
- `src/ui/screens/tasks/E22TaskDetail.tsx`, `src/ui/screens/tasks/E23Decompose.tsx` : dépendances `useEffect` corrigées pour lint

## Hypothèses validées / invalidées
- VALIDE : `npm run test` passe 259/259
- VALIDE : `npm run test:e2e` passe 46/46 sans serveur manuel
- VALIDE : `npm run lint` et `npm run build` passent

## Prochaine étape exacte
1. Démarrer Phase 7 : tests utilisateurs AuDHD réels
2. Documenter les retours et prioriser le backlog d’ajustements pré-V1

## Question bloquante pour la session suivante
Aucune
