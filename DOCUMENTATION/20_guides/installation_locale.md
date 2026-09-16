# Installation locale

## Prérequis

- Node.js et npm ;
- un navigateur récent pour utiliser ou tester la PWA.

## Installer et démarrer

```bash
git clone https://github.com/ServOMorph/Appli_TSA_SDI_TDAH.git
cd Appli_TSA_SDI_TDAH
npm install
npm run dev
```

Vite affiche l'URL locale à ouvrir, habituellement `http://localhost:5173`.

## Commandes de base

```bash
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` exécute TypeScript puis produit le build dans `dist/dev`. `npm run preview` sert ce build localement.

## Synchronisation locale

L'application reste utilisable sans configuration serveur. Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` activent le client lorsqu'elles sont toutes les deux présentes. Elles ne doivent pas être copiées dans la documentation ni dans un argument de commande.

Voir aussi : [Tests et qualité](tests_et_qualite.md) et [Stockage, sauvegarde et restauration](stockage_sauvegarde_restauration.md).
