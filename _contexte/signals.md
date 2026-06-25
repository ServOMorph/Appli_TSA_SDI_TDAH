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
- Build production régénéré pour déploiement manuel Netlify : dossier `dist/`
- Test utilisateur distant à préparer : visio/partage écran, données locales navigateur, pas de collecte automatique

## Dernière session (2026-06-25)

# Session du 2026-06-25

## Décisions prises
- Phase 7 démarre par un test utilisateur distant, via lien Netlify et observation accompagnée.
- La connexion Google reste hors périmètre immédiat : à envisager plus tard avec la sync V2.

## Livrables produits ou modifiés
- `dist/` : build production régénéré pour dépôt manuel Netlify
- `_contexte/signals.md` : clôture session mise à jour
- `_contexte/contexte.md` : état actuel mis à jour
- `README.md` : état actuel aligné sur la préparation Phase 7
- `CHANGELOG.md` : entrée de session ajoutée

## Hypothèses validées / invalidées
- VALIDE : `npm run build` passe et génère `dist/`
- VALIDE : un testeur distant ne donne pas accès automatiquement à ses données ; elles restent dans son navigateur
- EN ATTENTE : lien Netlify public à générer par dépôt manuel du dossier `dist/`

## Prochaine étape exacte
1. Déposer `dist/` sur Netlify.
2. Envoyer le lien au testeur avec consignes de confidentialité.
3. Réaliser la session distante et documenter les retours.

## Question bloquante pour la session suivante
Aucune
