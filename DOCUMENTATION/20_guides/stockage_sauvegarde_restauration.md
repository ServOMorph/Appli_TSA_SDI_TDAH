# Stockage, sauvegarde et restauration

## Stockage local

Les données de l'application résident d'abord dans IndexedDB, via Dexie. La base porte le nom `appli-tsa-sdi-tdah`. La synchronisation éventuelle ne remplace pas la sauvegarde locale faite par l'utilisateur.

## Sauvegarder

Dans l'application, ouvrir **Paramètres > Export et import**, puis choisir l'export JSON. Le fichier téléchargé contient le snapshot utilisateur et une date d'export. Le conserver dans un emplacement maîtrisé, hors dépôt Git et hors canal de communication non prévu pour les données personnelles.

Faire un export avant une réinstallation, un changement d'appareil ou un import. Cette procédure est documentée ; elle n'a pas été rejouée pendant cette phase car elle produit des données utilisateur.

## Restaurer

Dans le même écran, choisir le fichier JSON à importer. L'import contrôle le format, la version, l'unicité des identifiants et les références entre données avant écriture. Il accepte les exports antérieurs compatibles et complète certains éléments manquants des anciens formats.

Après validation, l'import remplace transactionnellement l'ensemble des tables applicatives par le contenu du fichier. C'est une opération destructive pour l'état local courant : exporter cet état avant de continuer et ne jamais tenter une restauration avec un fichier inconnu.

## Limites

Un export plus récent que la version prise en charge est refusé. Une restauration ne reconstitue pas une donnée qui n'était pas présente dans le fichier choisi.
