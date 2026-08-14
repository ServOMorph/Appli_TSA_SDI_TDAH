---
description: Build la dist versionnée et la déploie en prod sur Netlify
argument-hint: [version]
model: sonnet
allowed-tools: Bash(npx tsc -b:*), Bash(VITE_APP_VERSION=* npx vite build:*), Bash(npx netlify deploy:*), Bash(grep -m1:*), Bash(test -f:*), Bash(test -d:*)
---

# /deploy [version]

## Procédure

1. Déterminer la version.
   - Si $ARGUMENTS est fourni (ex: `v5.19`) : l'utiliser.
   - Sinon : la lire dans `CHANGELOG.md`, première ligne `## vX.Y — AAAA-MM-JJ` (grep -m1 '^## v').
   - Annoncer la version retenue avant de continuer.

2. Vérifier que `.env` existe (`test -f .env`). S'il est absent : dire à l'utilisateur de le créer depuis `.env.example`
   (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) et s'arrêter. Ne jamais lire ni afficher le contenu de `.env`.

3. Build :
   ```
   npx tsc -b && VITE_APP_VERSION=<version> npx vite build --outDir dist/<version>
   ```
   `--outDir` prime sur `outDir` de `vite.config.ts` (branche `v5.1`) : chaque version obtient son propre dossier
   sous `dist/`, sans toucher `vite.config.ts`. `VITE_APP_VERSION` alimente le bouton « Entrer dans la <version> »
   de l'écran d'accueil (`E01Welcome.tsx`) — absente en dev/tests, le bouton reste « Entrer ».

4. Vérifier que `dist/<version>` a été créé et n'est pas vide (`test -d dist/<version>`) avant de déployer.

5. Déployer en prod sur Netlify, en chargeant `.env` dans l'environnement de la seule commande (jamais affiché,
   jamais passé en argument visible) :
   ```
   set -a; source .env; set +a; npx netlify deploy --prod --dir=dist/<version>
   ```

6. Rapporter à l'utilisateur : version déployée, dossier `dist/` utilisé, URL renvoyée par la commande Netlify.
   Ne jamais relancer le déploiement automatiquement en cas d'échec — signaler l'erreur et attendre une nouvelle
   confirmation explicite.
