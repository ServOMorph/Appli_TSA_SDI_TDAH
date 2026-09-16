# Contexte — documentation

## Objectif (immuable sauf décision explicite)
Centraliser et maintenir la documentation du projet Appli_TSA_SDI_TDAH en fichiers Markdown, indexée
par INDEX.md (base de connaissance interne, progressive disclosure) — à la fois métier/produit
(specs fonctionnelles, écrans, logique métier TSA/SDI/TDAH) et technique (architecture, conventions,
décisions structurantes), à partir des sources canoniques du projet.

## Stack / contraintes techniques (stable, rarement modifié)
- Format : fichiers Markdown, indexés par INDEX.md (une ligne par document, progressive disclosure)
- Structure calquée sur le kit vibecoding : 10_concepts/, 20_guides/, 30_decisions/, 40_specs/
- Sources canoniques à citer avant toute production : CLAUDE.md (dont § Spécificités projet,
  migration progressive vers DOCUMENTATION/ décidée le 2026-09-16), CHANGELOG.md,
  COMMUNICATION/Marie/, roadmaps actives et archivées, _contexte/ racine
- Stack applicative du projet : React 19 + TypeScript, Vite 8, Dexie (IndexedDB, offline-first),
  PWA (vite-plugin-pwa), tests Vitest/Testing Library/Playwright, ESLint/Prettier

## État actuel (réécrit intégralement à chaque /close)
Agent créé. Aucun livrable produit.

## Décisions structurantes (append only — 10 entrées max, 5 lignes max/entrée, archiver au-delà)
- 2026-09-16 : Initialisation du protocole vibecoding.
- 2026-09-16 : Rôle couvrant à la fois métier et technique (décision utilisateur, plutôt que deux
  agents séparés).
- 2026-09-16 : Structure calquée sur celle du kit (10_concepts/20_guides/30_decisions/40_specs).
- 2026-09-16 : Périmètre d'écriture étendu à CLAUDE.md (racine), pour permettre une migration
  progressive du § Spécificités projet vers DOCUMENTATION/ au fil des sessions — pas immédiate.
