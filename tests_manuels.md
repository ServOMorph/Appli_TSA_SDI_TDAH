# Tests manuels en attente

Consigne : valider chaque point sur l'appareil réel, puis supprimer la section correspondante.

## 1 — Création d'outil (E70/E72)

1. Depuis l'accueil, ouvrir « Ajouter un outil » : « Nouvelle liste » est la seule action de création disponible. Les outils indiqués « bientôt disponibles » peuvent rester affichés ; « Nouveau dossier » ne doit plus apparaître.
2. Depuis un dossier existant (E72), vérifier que le bouton « + » propose aussi « Nouvelle liste » comme seule action de création, sans « Nouveau dossier ».

## 2 — Suppression d'une liste (E61)

1. Ouvrir une liste depuis les Outils.
2. Taper le bouton × en tête d'écran : une confirmation s'affiche.
3. Confirmer : la liste disparaît des Outils, retour sur l'écran Outils.
4. Annuler : la liste reste intacte.

## 3 — Retrait d'argent sur un livret (E74)

1. Ouvrir la configuration du budget, taper « Ajouter un mouvement » sur un livret ayant un solde.
2. Choisir Type = Retrait, saisir un montant inférieur au solde : enregistrement possible, le solde du livret diminue, la ligne affiche « Retrait ».
3. Saisir un montant supérieur au solde : le bouton Enregistrer reste désactivé, message d'erreur affiché.

## 4 — Formulaire d'ajout d'élément de liste, superposition avec la nav (E61)

Signalé par Marie le 2026-08-13 (vidéo) : à l'ouverture du clavier sur « Ajouter un élément », la barre de nav basse se superposait transitoirement au formulaire. Corrigé en le passant en boîte de dialogue plein écran.

1. Ouvrir une liste, taper « Ajouter un élément » sur mobile.
2. Vérifier que le formulaire (champs Élément/Rubrique, boutons Ajouter/Annuler) reste entièrement visible et cliquable dès l'ouverture du clavier, sans superposition de la barre de nav.

## 5 — Badge énergie, fond en couleur d'ambiance (barre du haut)

1. Ouvrir Paramètres > Accessibilité, choisir une couleur d'ambiance (ex. rose).
2. Revenir à l'accueil : le badge énergie de la barre du haut n'affiche plus « planifié / dispo » (icône batterie + chiffres seulement) et son fond est teinté avec la couleur choisie.

## 6 — Import d'une sauvegarde JSON (E117)

1. Depuis Paramètres > Export et import, taper « Importer un fichier JSON » et sélectionner `donnees_marie/export-audhd-2026-08-13.json`.
2. Vérifier l'affichage de la modale « Remplacer toutes les données ? », confirmer.
3. Vérifier que l'appli bascule sur l'écran attendu (énergie du jour ou accueil) avec le profil importé.
4. Vérifier que la liste « À acheter » (32 éléments) et la liste « To Do » réapparaissent dans les Outils, chacune ouvrable normalement (entrée `tools` reconstruite pour l'ancien format v3.0 sans `tools`).
5. Vérifier tâches (dont sous-tâches de « Routine soir »), budget (catégories, dépenses, livret « Livret Jeune » avec son dépôt) et énergie des deux jours.

