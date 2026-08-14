---
description: Build et déploie l'état actuel du code sur le site de test https://appli-audhd-dev.netlify.app
argument-hint:
model: sonnet
allowed-tools: Bash(npx tsc -b:*), Bash(npx vite build:*), Bash(npx netlify deploy:*), Bash(grep -qE:*), Bash(test -f:*), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(curl:*)
---

# /deploy_dev

Déploiement de test, distinct de `/deploy` : aucune version, aucun impact sur la prod
(`https://appli-audhd.netlify.app`, site Netlify séparé). Sert à faire tester l'état actuel du
code sur un appareil qui n'est pas sur le même réseau local que le poste de dev, sans attendre
qu'une version soit prête à sortir.

## Procédure

0. Exécuter intégralement `/close` (sans argument — zone implicite : dossier courant) avant de
   poursuivre. Le code déployé en test doit lui aussi être commité, pas laissé en session ouverte.

1. **`.env` présent avec les clés attendues, valeurs non vides** : `test -f .env`, puis
   `grep -qE '^NETLIFY_AUTH_TOKEN=.+' .env` et `grep -qE '^NETLIFY_SITE_ID_DEV=.+' .env`. Si
   absent ou incomplet : dire à l'utilisateur de le créer/compléter depuis `.env.example` et
   s'arrêter. Ne jamais lire ni afficher le contenu de `.env`.

2. **Arbre de travail** : `git status --short`. `/close` vient de commiter la session, ce
   contrôle ne devrait donc rien trouver. S'il reste quand même quelque chose (résidu signalé
   par `/close` à son étape 12), ne pas bloquer — signaler que du code non commité va être
   déployé et continuer.

3. Build, sans version ni dossier dédié (écrasé à chaque appel) :
   ```
   npx tsc -b && npx vite build --outDir dist/dev
   ```
   Si `tsc -b` échoue, s'arrêter et rapporter l'erreur — ne jamais déployer un build qui ne
   compile pas.

4. Déployer sur le site dev, en chargeant `.env` dans l'environnement de la seule commande
   (jamais affiché, jamais passé en argument visible) :
   ```
   set -a; source .env; set +a; npx netlify deploy --prod --dir=dist/dev --site="$NETLIFY_SITE_ID_DEV"
   ```

5. Vérification de fumée : `curl -sf -o /dev/null -w '%{http_code}' https://appli-audhd-dev.netlify.app`.
   Un code différent de 200 est signalé dans le rapport mais n'invalide pas le déploiement déjà
   effectué par Netlify.

6. Rapporter à l'utilisateur : résultat du build, résultat du déploiement, résultat de la
   vérification de fumée, et rappeler l'URL de test `https://appli-audhd-dev.netlify.app`.
   Ne jamais relancer le déploiement automatiquement en cas d'échec.
