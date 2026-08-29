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
   - Doc antérieur ou égal : compte-rendu « Google Doc inchangé depuis la dernière revue du
     registre », ne rien modifier d'autre.
   - Doc plus récent : poursuivre aux étapes 3 et suivantes.

   Dans les deux cas, mettre à jour dans l'en-tête du registre la ligne
   `- Dernière exécution de la revue : <date du jour>` (la créer si absente). Cette ligne est
   distincte de « Dernière revue du Doc » (qui reste la date de modification du Doc analysée) et
   sert de jalon vérifié par `/deploy` étape 3.9. Puis, si le Doc est antérieur ou égal, rendre la
   main.

3. Lire le contenu exporté intégralement. Relever chaque demande numérotée sans la reformuler de
   manière trompeuse (catégorie, comportement demandé, contraintes exprimées). Signaler tout
   passage ambigu plutôt que l'interpréter.

4. Pour chaque demande, établir son état réel : consulter le code, les tests, `CHANGELOG.md`, les
   roadmaps et l'historique Git nécessaires. Ne jamais conclure « livrée » sans avoir lu le code
   qui le prouve.

5. Réconcilier `_contexte/marie_modifications_suivi.md` selon les mêmes règles que
   `/analyser_googledoc` étape 6 : une ligne par demande numérotée, état recalculé
   (`livrée vX.Y` avec preuve code · `en attente` · `en cours <roadmap>` · `écartée : <motif>`),
   **jamais de suppression de ligne** (demande disparue du Doc → `écartée : retirée du Google Doc
   le AAAA-MM-JJ`), en-tête (« Dernière revue du Doc », « Dernière mise à jour de ce registre ») et
   « Historique des revues » mis à jour à la date de modification du Doc.

6. Rendre la main à la commande appelante avec un compte-rendu : différentiel d'états
   (avant → après), nouvelles demandes, points ambigus. Ne créer aucune roadmap, ne trancher
   aucune décision produit — pour la suite, orienter vers `/analyser_googledoc`.
