# Déploiement

## Environnements

- Production : le processus `/deploy` construit une version et la publie sur Netlify.
- Test distant : `/deploy_dev` publie l'état courant sur un site Netlify distinct.

Les deux procédures exigent une configuration locale privée ; ne pas afficher, copier ni transmettre son contenu dans un message, un ticket ou cette documentation.

## Déploiement de test

La procédure `/deploy_dev` demande une clôture préalable du travail, contrôle la configuration locale, construit `dist/dev`, publie ce dossier, puis effectue un contrôle HTTP de fumée. Elle ne doit pas être utilisée pour remplacer le déploiement de production.

## Déploiement de production

La procédure `/deploy` inclut notamment : traitement des données et retours pertinents, revue du changelog, contrôles de l'arbre Git et de la branche `main`, tests unitaires, TypeScript, lint, budget de bundle, publication et contrôle de fumée. Elle s'arrête au premier contrôle bloquant en échec.

Le déploiement production ne doit pas être lancé depuis une session de rédaction : il peut publier une version et communiquer avec des personnes externes. Les procédures n'ont pas été exécutées dans cette phase.

Voir [Tests et qualité](tests_et_qualite.md) pour l'état local des contrôles préalables.
