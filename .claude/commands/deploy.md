---
description: Build la dist versionnée et la déploie en prod sur Netlify
argument-hint: [version]
model: sonnet
allowed-tools: Bash(npx tsc -b:*), Bash(VITE_APP_VERSION=* npx vite build:*), Bash(npx netlify deploy:*), Bash(grep -m1:*), Bash(grep -q:*), Bash(grep -qE:*), Bash(test -f:*), Bash(test -d:*), Bash(ls -A:*), Bash(git status:*), Bash(git branch --show-current:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(npx vitest run:*), Bash(npm run lint:*), Bash(curl:*)
---

# /deploy [version]

## Procédure

0. Exécuter intégralement `/close` (sans argument — zone implicite : dossier courant) avant de
   poursuivre. Le code à déployer doit être clôturé et commité, pas laissé en session ouverte.
   Si `/close` signale des résidus non commités à son étape 12, les traiter comme un échec de
   l'étape 2.1 ci-dessous plutôt que de continuer.

1. Déterminer la version.
   - Si $ARGUMENTS est fourni (ex: `v5.19`) : l'utiliser.
   - Sinon : la lire dans `CHANGELOG.md`, première ligne `## vX.Y — AAAA-MM-JJ` (grep -m1 '^## v').
   - Annoncer la version retenue avant de continuer.

2. Vérifications bloquantes — dans l'ordre, s'arrêter et rapporter l'erreur précise au premier échec.
   Ne jamais tenter de corriger automatiquement (committer, modifier le code, etc.) : rapporter et attendre
   une instruction explicite de l'utilisateur.

   1. **Arbre de travail propre** : `git status --short`. Si la sortie n'est pas vide, s'arrêter — le code
      déployé doit être traçable dans un commit.
   2. **`.env` présent avec les clés attendues, valeurs non vides** : `test -f .env`, puis
      `grep -qE '^NETLIFY_AUTH_TOKEN=.+' .env` et `grep -qE '^NETLIFY_SITE_ID=.+' .env` (le `.+` exige une
      valeur après le `=`, pas seulement la clé). Si absent ou incomplet : dire à l'utilisateur de le
      créer/compléter depuis `.env.example` et s'arrêter. Ne jamais lire ni afficher le contenu de `.env`.
   3. **Cohérence CHANGELOG.md / version cible** : `grep -q "^## <version> " CHANGELOG.md`. Si aucune entrée
      ne correspond à la version déterminée à l'étape 1, s'arrêter — ajouter une entrée CHANGELOG décrivant
      les changements à déployer avant de relancer `/deploy`.
   4. **Tests unitaires verts** : `npx vitest run`.
   5. **Compilation TypeScript clean** : `npx tsc -b`.
   6. **Lint clean** : `npm run lint`.

3. Avertissements — signaler chacun s'il est détecté, puis demander une confirmation explicite unique
   avant de poursuivre (ne pas bloquer seul, ne pas continuer sans réponse de l'utilisateur).

   1. **Branche git attendue** : `git branch --show-current`, comparer à la branche mentionnée comme active
      dans `_contexte/contexte.md`. Si différente, signaler l'écart.
   2. **Commits locaux non poussés** : si un remote de suivi existe
      (`git rev-parse --abbrev-ref --symbolic-full-name @{u}` réussit), compter
      `git rev-list --count @{u}..HEAD`. Si > 0, signaler que le déploiement embarquerait du code qui
      n'existe pas encore sur le remote (le déploiement Netlify envoie `dist/` directement, indépendamment
      de git). Ne jamais pousser automatiquement.
   3. **Version déjà présente dans `dist/`** : `test -d dist/<version>`. Si le dossier existe déjà, signaler
      qu'il sera écrasé par ce build.
   4. **Tests manuels en attente** : lire `tests_manuels.md`. S'il contient autre chose que le fichier vide,
      lister les points en attente et signaler qu'un déploiement prod interviendrait avant leur validation.
   5. **Catalogue des tests manuels pour Marie à jour** : `test -f src/domain/data/manualTestsCatalog.ts`
      (cf. `roadmap_tests_marie.md`). Si absent, ignorer silencieusement — fonctionnalité pas encore livrée.
      S'il existe, lire son contenu et le comparer aux changements de la version en cours de déploiement
      (`CHANGELOG.md`) : si une fonctionnalité soumise à Marie a changé sans que le catalogue n'ait été mis à
      jour, le signaler. Ne pas modifier le catalogue automatiquement.

4. Build :
   ```
   npx tsc -b && VITE_APP_VERSION=<version> npx vite build --outDir dist/<version>
   ```
   `--outDir` prime sur `outDir` de `vite.config.ts` : chaque version obtient son propre dossier sous `dist/`,
   sans toucher `vite.config.ts`. `VITE_APP_VERSION` alimente le bouton « Entrer dans la <version> » de l'écran
   d'accueil (`E01Welcome.tsx`) — absente en dev/tests, le bouton reste « Entrer ». Si le build signale un
   avertissement de taille de chunk (> 500 kB), le noter pour le rapport final (étape 8) sans bloquer.

5. Vérifier que `dist/<version>` a été créé et n'est pas vide avant de déployer :
   ```
   test -d dist/<version> && test -n "$(ls -A dist/<version>)"
   ```

6. Déployer en prod sur Netlify, en chargeant `.env` dans l'environnement de la seule commande (jamais affiché,
   jamais passé en argument visible) :
   ```
   set -a; source .env; set +a; npx netlify deploy --prod --dir=dist/<version>
   ```

7. Vérification de fumée post-déploiement : lire l'URL de production annoncée par la commande précédente,
   puis `curl -sf -o /dev/null -w '%{http_code}' <url>`. Un code différent de 200 est signalé dans le rapport
   final mais n'invalide pas le déploiement déjà effectué (Netlify l'a déjà confirmé) — c'est une vérification
   indépendante supplémentaire, pas une nouvelle porte bloquante.

   Mettre à jour `_contexte/dernier_deploiement.md` (le créer s'il n'existe pas) avec la version, la date et
   l'URL de production déployées, pour que cette information reste à jour indépendamment de `/close`.

8. Rapporter à l'utilisateur : version déployée, dossier `dist/` utilisé, URL renvoyée par la commande Netlify,
   résultat de la vérification de fumée, et l'avertissement de taille de chunk le cas échéant.
   Ne jamais relancer le déploiement automatiquement en cas d'échec — signaler l'erreur et attendre une nouvelle
   confirmation explicite.
