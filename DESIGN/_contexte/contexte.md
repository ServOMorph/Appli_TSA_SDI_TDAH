# Contexte — design

## Objectif (immuable sauf décision explicite)
S'occuper du design de l'application : direction visuelle, maquettes, chartes graphiques, tokens d'interface, accessibilité et cohérence de l'expérience utilisateur, en cohérence avec le public AuDHD (TSA/TDAH) et l'objectif de réduction de la charge mentale et des frictions.

## Stack / contraintes techniques (stable, rarement modifié)
- Application : PWA React 19 + TypeScript + Vite 8, persistance locale Dexie.js/IndexedDB.
- Interface : composants et écrans dans `src/ui/` (React accessible), navigation et état applicatif dans `src/app/`. Règles métier isolées dans `src/domain/`, persistance dans `src/data/` (hors périmètre).
- Drag and drop : `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Contraintes : accessibilité prioritaire (public AuDHD, TSA/TDAH) ; réduction de charge mentale et de friction ; lint ESLint sans warning ; Prettier ; budget de bundle contrôlé (`bundle.budget.json`, garde-fou bloquant au déploiement).
- Tests : Vitest + Testing Library (unit/intégration) ; Playwright (e2e).
- Dossiers cibles : `DESIGN/` (specs, maquettes, chartes), `src/ui/`, `src/app/`.

## État actuel (réécrit intégralement à chaque /close)
Projet initialisé. Aucun livrable produit.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-09-02 : Initialisation du protocole vibecoding.
