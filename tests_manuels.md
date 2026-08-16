# Tests manuels en attente

Consigne : valider chaque point sur l'appareil réel, puis supprimer la section correspondante.

## 1 — Import d'une sauvegarde JSON (E117)

1. Depuis Paramètres > Export et import, taper « Importer un fichier JSON » et sélectionner `donnees_marie/export-audhd-2026-08-13.json`.
2. Vérifier l'affichage de la modale « Remplacer toutes les données ? », confirmer.
3. Vérifier que l'appli bascule sur l'écran attendu (énergie du jour ou accueil) avec le profil importé.
4. Vérifier que la liste « À acheter » (32 éléments) et la liste « To Do » réapparaissent dans les Outils, chacune ouvrable normalement (entrée `tools` reconstruite pour l'ancien format v3.0 sans `tools`).
5. Vérifier tâches (dont sous-tâches de « Routine soir »), budget (catégories, dépenses, livret « Livret Jeune » avec son dépôt) et énergie des deux jours.
