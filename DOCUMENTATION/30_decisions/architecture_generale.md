# Architecture générale

Statut : actuel
Dernier contrôle : 2026-09-16
Sources : `package.json`, `vite.config.ts`, `src/App.tsx`, `src/app/AppContext.tsx`, `src/app/repositories.ts`, `src/data/db.ts`, `src/data/sync/`, `supabase/schema.sql`, `supabase/feedback.sql`, tests associés dans `src/` et `e2e/`

## Décision en vigueur

Le client est une PWA React écrite en TypeScript et construite avec Vite. Les données
fonctionnelles sont conservées localement dans IndexedDB, par Dexie. La synchronisation vers
Supabase est optionnelle, configurée par variables d'environnement et soumise au consentement
local de l'utilisateur.

## Structure applicative

```text
Interface React (src/ui, src/App.tsx)
        ↓
Contexte applicatif et repositories (src/app)
        ↓
Règles et entités de domaine (src/domain)
        ↓
Dexie / IndexedDB (src/data/db.ts)
        ↘ optionnel : synchronisation RPC et retours ↙
                    Supabase (supabase/)
```

- `src/ui/` porte les écrans, composants et styles.
- `src/app/` rassemble la navigation, le contexte React et les repositories utilisés par l'UI.
- `src/domain/` contient les entités et règles métier.
- `src/data/db.ts` définit les migrations et tables Dexie. La version 24 retire l'ancien stockage
  local du catalogue de tests manuels.

## Offline-first et PWA

VitePWA génère le manifeste et le service worker. La configuration déclare une mise à jour
automatique et un repli de navigation vers `index.html`. L'application peut donc fonctionner avec
sa base IndexedDB sans backend configuré.

## Synchronisation optionnelle

La synchronisation n'est activée que si les deux variables de configuration attendues sont
présentes et si le consentement local a été accordé. Le client envoie un instantané des données
fonctionnelles vers la fonction RPC `sync_device_snapshot`; il ne réimporte pas cet instantané
dans l'application. Cette synchronisation est donc une sauvegarde montante du client actuel, pas
une synchronisation bidirectionnelle générale.

Les identifiants d'appareil sont gérés côté client. Les secrets et leurs valeurs ne sont pas
documentés ici.

## Retours conversationnels

Les retours sont stockés localement, puis envoyés au serveur lorsque la synchronisation est
configurée et consentie. Le client peut aussi récupérer les messages de l'équipe associés à un
retour et clôturer un retour validé. Les fonctions SQL dédiées et les politiques de sécurité sont
définies dans `supabase/feedback.sql`.

## Qualité et contrôle

- Tests unitaires et de composants : Vitest et Testing Library.
- Tests de parcours : Playwright dans `e2e/`.
- Qualité statique : ESLint et Prettier.
- Scripts disponibles : `npm run test`, `npm run test:e2e`, `npm run lint` et `npm run build`.

Ces commandes sont déclarées dans `package.json`; elles ne sont pas réexécutées dans cette phase
documentaire.

## Historique à ne pas confondre avec l'état actuel

Les ADR sous `_docs/adr/` et les anciennes entrées de `CHANGELOG.md` éclairent les choix initiaux,
mais l'architecture décrite ici est établie à partir du code et du schéma actuellement présents.
