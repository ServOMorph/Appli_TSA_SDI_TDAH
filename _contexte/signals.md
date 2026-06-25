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
- Onboarding modifié : écran bienvenue avec image générée, bouton `Entrer`, profils sans âges affichés
- run_dev.py / run_prod.py (+ --host) disponibles à la racine
- Build production régénéré après modifications onboarding : dossier `dist/`
- Test utilisateur distant à préparer : visio/partage écran, données locales navigateur, pas de collecte automatique

## Dernière session (2026-06-25)

# Session du 2026-06-25

## Décisions prises
- L’onboarding est rendu plus accueillant : image de bienvenue dédiée, bouton `Entrer`, profils sans âges affichés.

## Livrables produits ou modifiés
- `src/ui/screens/onboarding/E01Welcome.tsx` : écran bienvenue refondu avec image et bouton `Entrer`
- `src/ui/screens/onboarding/E02Profile.tsx` : âges retirés des profils
- `public/images/welcome-hero.png` : image générée ajoutée au projet
- `dist/` : build production régénéré

## Hypothèses validées / invalidées
- VALIDE : `npm run test -- E01Welcome E02Profile`, `npm run lint` et `npm run build` passent
- VALIDE : écran bienvenue mobile sans scroll mesuré en preview 390x844
- EN ATTENTE : lien Netlify public à générer par dépôt manuel du dossier `dist/`

## Prochaine étape exacte
1. Déposer le nouveau `dist/` sur Netlify.
2. Envoyer le lien au testeur avec consignes de confidentialité.
3. Réaliser la session distante et documenter les retours.

## Question bloquante pour la session suivante
Aucune
