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
- **Mot de passe administrateur (nouveau dans la v6.11).** Elle doit choisir un mot de passe long, à saisir une fois dans Paramètres > Profil avec le code `marie`. À faire avec elle sur place : dev lance `python scripts/hash_admin_code.py marie` (saisie masquée) et colle l'empreinte dans `adminCredentials.ts`. Choisir le mot de passe de dev dans la foulée (`dev`). Ne pas déployer la v6.11 avant que les deux empreintes soient en place. Elle doit le noter dans un gestionnaire de mots de passe.
  - Une fois les empreintes en place (`ADMIN_CREDENTIAL_HASHES` est vide aujourd'hui, donc personne n'est admin) : réparer le test e2e T58 (`e2e/10-feedback.spec.ts`) en écrivant dans les réglages locaux `tester_code: 'dev'` et `admin_key: ADMIN_CREDENTIAL_HASHES.dev`, sans mot de passe dans les tests. Ajouter un test T58b : un profil non admin ne voit pas « Signaler un retour ». Retirer ensuite la section « T58 en échec » de `tests_manuels.md`.
- **Latence « Chargement… » entre écrans** (signalée le 2026-09-04) : persiste-t-elle ?
- **Planning de la semaine** : le saut au relâchement d'une tâche glissée existe-t-il aussi dans cette vue ?
- **Navigation « Planning de la semaine »** : est-elle lisible ? (décision produit 4 en attente)
- **Livret, retour `17f8fcae` (E77)** : quand elle fait un dépôt et choisit « d'où vient l'argent », veut-elle déplacer de l'argent déjà sur le livret d'une catégorie à une autre (ex. de « livret jeune » vers « Vacances ») ? Ou choisir dans quelle catégorie va l'argent qui arrive ? Bloque la Phase 5 de `roadmap_retours_2026-10-10.md`.
- **Dépense liée à une tâche, retour `c2143fff` (E21)** : si elle décoche la tâche après avoir saisi la dépense, faut-il supprimer la dépense automatiquement, ou la garder ? Bloque la Phase 6 de `roadmap_retours_2026-10-10.md`.

## À lui annoncer

- « Nouveautés » sera dans Paramètres à partir de la v6.11 (pas encore déployée).
- Le code testeur de son appareil n'est pas à ressaisir : le classement de ses sauvegardes est correct.
