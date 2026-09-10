# Procédure — Revue du Google Doc « Modifications » de Marie

Fragment partagé, invoqué par `/deploy` (étape 0) et `/traiter_export_marie`. À ne pas lancer
directement. Ne crée aucune roadmap, ne tranche aucune décision produit : détecte un changement,
relit le Doc, réconcilie le registre, puis rend la main avec un compte-rendu.

## Constantes

- Google Doc : `https://docs.google.com/document/d/1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw/edit`
- Registre : `_contexte/marie_modifications_suivi.md`

## Étapes

1. Exporter le Google Doc en texte via le remote rclone dédié :
   ```
   rclone backend copyid tsa_gdrive: 1rEFlDkLnqCQKPlNY0g9pPvYEkWz9XYbVYdzKlwhiuhw <fichier temporaire>.txt --config .claude/rclone.conf --drive-export-formats txt
   ```
   Échec (accès refusé, ID invalide) : le signaler dans le compte-rendu et rendre la main sans
   bloquer — la revue est un contrôle annexe, pas une porte de la commande appelante.

2. Comparer la date de modification du fichier exporté (rclone conserve celle du Google Doc) à la
   date « Dernière revue du Doc » de l'en-tête du registre.
   - Doc antérieur ou égal : compte-rendu « Doc inchangé depuis la dernière revue du registre
     (<date comparée>) ». Mettre à jour la seule ligne d'en-tête
     `- Dernière exécution de la revue : <date du jour>` (la créer si absente ; jalon distinct de
     « Dernière revue du Doc », vérifié par `/deploy` étape 3.9), puis rendre la main. Ne rien lire
     ni réconcilier d'autre.
   - Doc plus récent : poursuivre. La date ne décide pas seule de la suite — c'est le contenu
     (étapes 3-4) qui détermine s'il y a « analyse requise » ou « réconciliation seule ».

3. Lire le contenu exporté intégralement. Relever chaque demande numérotée (numéro + énoncé
   intégral, sans reformulation trompeuse : catégorie, comportement demandé, contraintes
   exprimées). Signaler tout passage ambigu plutôt que l'interpréter. Constituer la liste des
   numéros présents dans le Doc.

4. Classer l'écart Doc ↔ registre, demande numérotée par demande numérotée :
   - **nouvelle** : numéro présent dans le Doc, absent du registre ;
   - **texte modifié** : numéro présent des deux côtés mais l'énoncé du Doc diffère sur le fond de
     la colonne « Demande (résumé) » du registre — une reformulation cosmétique ne compte pas ; en
     cas de doute, classer en texte modifié ;
   - **retirée** : numéro présent dans le registre, absent du Doc ;
   - **inchangée** : présent des deux côtés, même fond.

   Au moins une **nouvelle** ou un **texte modifié** → la suite est une **« analyse requise »**.
   Sinon (uniquement des **retirée** et/ou des **inchangée**) → **« réconciliation seule »**. Les
   deux cas exécutent quand même les étapes 5-6 ; seul le compte-rendu de l'étape 7 change.

5. Pour chaque demande touchée par l'écart, établir l'état à inscrire au registre :
   - **retirée** : confirmer que l'état terminal déjà inscrit (`livrée vX.Y` / `écartée`) tient
     toujours — relire au besoin le code, les tests, `CHANGELOG.md`, l'historique Git ; ne jamais
     conclure « livrée » sans avoir lu le code qui le prouve.
   - **nouvelle** : état `en attente` (placement simple ; l'analyse code revient à
     `/analyser_googledoc`).
   - **texte modifié** : conserver l'état actuel de la ligne mais y adjoindre la mention du
     changement d'énoncé et « à re-analyser ». La revue ne re-tranche pas la couverture d'une
     demande dont le texte a bougé — c'est `/analyser_googledoc` qui le fait.

6. Réconcilier `_contexte/marie_modifications_suivi.md` selon les mêmes règles que
   `/analyser_googledoc` étape 6 : une ligne par demande numérotée, état recalculé
   (`livrée vX.Y` avec preuve code · `en attente` · `en cours <roadmap>` · `écartée : <motif>`),
   **jamais de suppression de ligne** (demande retirée du Doc → état réel conservé, mention
   `retirée du Google Doc le AAAA-MM-JJ` ajoutée au motif). Mettre à jour l'en-tête (« Dernière
   revue du Doc » = date de modification du Doc, « Dernière exécution de la revue » = date du jour,
   « Dernière mise à jour de ce registre ») et ajouter une ligne à « Historique des revues ».

7. Rendre la main à la commande appelante avec un compte-rendu explicite :
   - **en-tête du compte-rendu** : « analyse requise » (lister les numéros nouveaux ou au texte
     modifié) · « réconciliation seule » · « Doc inchangé » ;
   - différentiel d'états du registre (avant → après), demandes retirées avec leur motif, points
     ambigus.
   Ne créer aucune roadmap, ne trancher aucune décision produit — pour une « analyse requise »,
   orienter vers `/analyser_googledoc`.
