# À voir avec Marie (rencontre du 2026-10-10)

Liste de points à trancher ou à lui faire tester. Source : `_contexte/signals.md` et échanges de la session du 2026-10-10. Supprimer un point une fois traité.

## À lui faire tester

- **Collage d'image dans « Signaler un retour »** (appli en production) : copier une image, puis « Coller une image » (ou Ctrl+V). Vérifier que l'image s'affiche et que l'envoi fonctionne. Si rien ne se passe, noter le message affiché.
- **Import depuis l'écran de bienvenue sur iPhone** (bouton « Retrouver mes données », jamais testé avec le sélecteur de fichiers de Safari iOS). Sur un navigateur neuf ou en navigation privée :
  1. Exporter ses données depuis la version déployée (Paramètres > Export et import).
  2. Ouvrir l'adresse vierge, toucher « Retrouver mes données », choisir le fichier dans « Fichiers ».
  3. Vérifier l'arrivée sur l'Accueil sans repasser par l'écran d'accueil, et que ses données sont présentes.
  4. Paramètres > Vie privée : le partage doit être actif.
  5. Côté dev : le snapshot Supabase doit se mettre à jour sur le même `device_id` qu'avant.
- **Barre d'annotation sur iPhone** : constat du 2026-09-10 (la barre ne reste pas fixe dans Safari iOS). Voir si elle gêne encore.

## À trancher

- **Import des données à l'ouverture sur une adresse neuve.** Elle a vu le bouton « Retrouver mes données » à l'ouverture, ne l'a pas utilisé, et ses données ont été importées automatiquement. Aucun mécanisme d'import automatique n'a été trouvé dans le code. Questions :
  - Était-elle sur une adresse neuve ou sur celle qu'elle utilisait déjà ?
  - Son ancien contenu (tâches, routines) est-il apparu dès l'arrivée sur l'Accueil, ou après une action de sa part ?
  - A-t-elle utilisé « Export et import » dans les paramètres ?
- **Latence « Chargement… » entre écrans** (signalée le 2026-09-04) : persiste-t-elle ?
- **Planning de la semaine** : le saut au relâchement d'une tâche glissée existe-t-il aussi dans cette vue ?
- **Navigation « Planning de la semaine »** : est-elle lisible ? (décision produit 4 en attente)
- **Badge « Powered by Netlify »** : le voit-elle encore après fermeture complète de l'appli ?

## À lui annoncer

- « Nouveautés » sera dans Paramètres à partir de la v6.11 (pas encore déployée).
- Le code testeur de son appareil n'est pas à ressaisir : le classement de ses sauvegardes est correct.
