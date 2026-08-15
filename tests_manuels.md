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

1. Ouvrir une liste, choisir une catégorie, taper « Ajouter un élément » sur mobile.
2. Vérifier que le formulaire (champ Élément, boutons Ajouter/Annuler) reste entièrement visible et cliquable dès l'ouverture du clavier, sans superposition de la barre de nav.

## 5 — Badge énergie, fond en couleur d'ambiance (barre du haut)

1. Ouvrir Paramètres > Accessibilité, choisir une couleur d'ambiance (ex. rose).
2. Revenir à l'accueil : le badge énergie de la barre du haut n'affiche plus « planifié / dispo » (icône batterie + chiffres seulement) et son fond est teinté avec la couleur choisie.

## 6 — Import d'une sauvegarde JSON (E117)

1. Depuis Paramètres > Export et import, taper « Importer un fichier JSON » et sélectionner `donnees_marie/export-audhd-2026-08-13.json`.
2. Vérifier l'affichage de la modale « Remplacer toutes les données ? », confirmer.
3. Vérifier que l'appli bascule sur l'écran attendu (énergie du jour ou accueil) avec le profil importé.
4. Vérifier que la liste « À acheter » (32 éléments) et la liste « To Do » réapparaissent dans les Outils, chacune ouvrable normalement (entrée `tools` reconstruite pour l'ancien format v3.0 sans `tools`).
5. Vérifier tâches (dont sous-tâches de « Routine soir »), budget (catégories, dépenses, livret « Livret Jeune » avec son dépôt) et énergie des deux jours.

## 7 — Accueil/Planning fusionnés (E10/E19)

1. Sur l'accueil, vérifier que le bandeau de dates (jours de la semaine, mois, année) est visible, identique à celui de l'écran Planning déplié.
2. Vérifier que la poignée en dessous n'affiche plus que le trait gris, sans texte « Déplier »/« Replier ».
3. Sur mobile, glisser le trait vers le bas : le planning doit s'agrandir. Glisser vers le haut depuis le planning déplié : retour à l'accueil.
4. Vérifier qu'un simple tap sur le trait fonctionne toujours (bascule accueil/planning).

## 8 — Catégories de listes (E61)

1. Créer une nouvelle liste : vérifier qu'il faut définir au moins une catégorie avant de pouvoir la créer (bouton « Créer » désactivé sinon).
2. Ouvrir cette liste : l'écran affiche d'abord les catégories (avec le nombre d'éléments de chacune), pas les éléments directement.
3. Toucher une catégorie : ses éléments s'affichent, ceux des autres catégories n'apparaissent pas.
4. Depuis l'écran des éléments, toucher ← : retour à l'écran des catégories (pas aux Outils).
5. Depuis l'écran des catégories, toucher « Ajouter une catégorie », saisir un nom : la catégorie apparaît dans la liste.
6. Ajouter un élément depuis une catégorie : plus de champ « Rubrique » à saisir, l'élément est automatiquement rangé dans la catégorie ouverte.

