# Tests et qualité

## Commandes

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:coverage
```

- `lint` refuse les avertissements ESLint ;
- `test` lance Vitest hors mode interactif ;
- `build` lance `tsc -b` puis Vite ;
- `test:e2e` lance le build puis Playwright avec un serveur de prévisualisation ;
- `test:coverage` applique les seuils de couverture configurés à 85 % pour lignes, fonctions, branches et instructions.

## Exécution locale du 16 septembre 2026

| Commande | Résultat |
| --- | --- |
| `npm test` | 101 fichiers et 869 tests réussis. Des avertissements React `act(...)` sont affichés sur stderr. |
| `npm run build` | Réussi lors du premier passage. |
| `npm run lint` | Échec : variable `setPendingTesterCode` déclarée mais non utilisée dans `src/app/AppContext.tsx`. |
| `npm run test:e2e` | Arrêté avant Playwright par la compilation TypeScript : import `E05TesterCode` non utilisé et objets de test incompatibles avec `pendingTesterCode`. |

Le second build, déclenché par `test:e2e`, a observé des modifications non commitées présentes dans l'arbre de travail après le premier build. Ces erreurs doivent être corrigées dans la zone de code, puis les contrôles relancés.

## Bon usage

Exécuter les contrôles avant une livraison. Ne pas présenter un déploiement comme prêt tant que le lint, la compilation ou les E2E ne sont pas au vert.
