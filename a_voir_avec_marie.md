# À voir avec Marie (rencontre du 2026-10-10)

Points restants après l'échange du 2026-10-10. Supprimer un point une fois traité. Réponses de Marie : `COMMUNICATION/Marie/historique_conversation_marie.md`.

## À lui faire tester

- **Import depuis l'écran de bienvenue sur iPhone** (bouton « Retrouver mes données », jamais testé avec le sélecteur de fichiers de Safari iOS). Sur un navigateur neuf ou en navigation privée :
  1. Exporter ses données depuis la version déployée (Paramètres > Export et import).
  2. Ouvrir l'adresse vierge, toucher « Retrouver mes données », choisir le fichier dans « Fichiers ».
  3. Vérifier l'arrivée sur l'Accueil sans repasser par l'écran d'accueil, et que ses données sont présentes.
  4. Paramètres > Vie privée : le partage doit être actif.
  5. Côté dev : le snapshot Supabase doit se mettre à jour sur le même `device_id` qu'avant.

## À trancher

- **Import des données sans clic (cause inconnue).** Ses données sont apparues directement dans l'appli, sans « Retrouver mes données ». Elle avait exporté avant. Adresse neuve ou habituelle : non précisé. Aucun mécanisme d'import automatique trouvé dans le code.
- **Mot de passe administrateur.** Empreintes `marie` et `dev` posées et commitées, vérification à l'enregistrement et T58 réparés. Reste : saisie du mot de passe dans Paramètres > Profil sur chaque appareil admin après le déploiement (et après toute restauration depuis un export).

## À trancher avec Marie (livret)

- Les autres livrets sont-ils aussi des provenances possibles d'un dépôt ?

## À annoncer dans le message de livraison de la v6.11

- Déjà dit oralement : « Nouveautés » dans Paramètres ; code testeur à ne pas ressaisir. Le message de livraison doit encore le mentionner (`signals.md`, entrée [P1] message Discord).
