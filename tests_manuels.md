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

Corrèle avec le rapport de Marie du 2026-08-14 (`_contexte/marie_tests_journal.json`, entrée `10a0154b-...`, test `retirer-de-l-argent-d-un-livret` : « J'ai pas accès au budget »). Correctif suspecté déjà en place (`useSettingsState.ts:183-185`, réparation `tableau_comptage` à l'import) — à confirmer par ce test avant de transitionner l'entrée du journal.

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

Corrèle avec le rapport de Marie du 2026-08-14 (`_contexte/marie_tests_journal.json`, entrée `a0098520-...`, test `importer-une-sauvegarde` : « Il manque le budget »). Même correctif suspecté que le test 3 — à confirmer avant de transitionner l'entrée du journal.

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

## 9 — Accès général au budget

Corrèle avec le rapport de Marie du 2026-08-14 (`_contexte/marie_tests_journal.json`, entrée `23393df4-...`, test `utiliser-le-budget` : « Je n'ai pas accès au budget »).

1. Depuis les Outils, ouvrir la carte Budget.
2. Vérifier que l'écran s'ouvre normalement (pas d'écran vide, pas d'erreur), avec les catégories/dépenses/livrets visibles.

## 10 — Couleur d'une tâche sans couleur choisie (planning)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 1, TA3) : quand aucune couleur n'est choisie pour une tâche, sa case dans le planning ne doit plus être teintée par la couleur d'ambiance des paramètres.

1. Choisir une couleur d'ambiance bien visible dans Paramètres > Accessibilité.
2. Créer une tâche planifiée sans lui choisir de couleur (« Aucune couleur »).
3. Vérifier dans le planning que la case de cette tâche reste neutre (fond clair standard), pas teintée par la couleur d'ambiance.
4. Créer une seconde tâche avec une couleur choisie explicitement : vérifier que sa case est bien teintée par cette couleur.

## 11 — Suppression d'une catégorie de liste (E61)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 1, LI1) : supprimer une catégorie ne doit plus supprimer toute la liste.

1. Ouvrir une liste ayant au moins deux catégories.
2. Sur l'écran des catégories, taper la croix rouge à côté d'une catégorie : une confirmation dédiée à cette catégorie s'affiche (pas « Supprimer cette liste »).
3. Confirmer : seule cette catégorie disparaît, les autres catégories et le reste de la liste restent intacts, la liste elle-même reste accessible depuis les Outils.
4. Annuler : la catégorie reste intacte.

## 12 — Accès direct à la modification de l'énergie (accueil)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 1, EN1) : le badge énergie de l'accueil doit amener directement à l'écran de modification.

1. Depuis l'accueil, taper le badge énergie (haut à gauche).
2. Vérifier que l'écran de modification de l'énergie (choix du chiffre + Valider/Ignorer) s'ouvre directement, sans écran de consultation intermédiaire.

## 13 — Menu d'actions d'une tâche simplifié (E22)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 2, TA2) : le menu d'actions d'une tâche est simplifié et propose un accès direct à la modification.

1. Ouvrir le détail d'une tâche.
2. Vérifier que le menu propose « Modifier », « Décomposer », « Dupliquer », « Supprimer » — plus de « Tâche du jour », « Planifier », « Liste » ni « Terminer ».
3. Taper « Modifier » : le champ Titre s'ouvre en édition directe.

## 14 — Hauteur de case selon la durée (planning)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 2, AP1) : dans le planning, la case d'une tâche reflète sa durée.

1. Planifier une tâche de 30 minutes et une tâche de 2h.
2. Vérifier dans le planning que la case de la tâche de 2h est visiblement plus haute que celle de 30 minutes.

## 15 — Encadrement des jours et glissement animé (planning)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 2, AP2) : le bandeau de dates est encadré par la couleur d'ambiance et le glissement est animé.

1. Choisir une couleur d'ambiance bien visible dans Paramètres > Accessibilité.
2. Ouvrir le planning : vérifier que le bandeau de dates est encadré par cette couleur.
3. Sur mobile, glisser le doigt latéralement sur le bandeau : vérifier que le bandeau suit le doigt de façon fluide (pas de saut brusque), puis revient à sa place une fois le doigt relâché, avec changement de jour si le glissement est assez ample.

## 16 — Détail d'un élément de liste : description et sous-tâches (E62)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 3, LI2) : un élément de liste peut avoir une description et des sous-tâches.

1. Ouvrir une liste, une catégorie, puis taper sur le titre d'un élément (zone blanche, pas la coche/⏰/×) : l'écran de détail de l'élément s'ouvre.
2. Saisir une description, sortir du champ (perte de focus) : rouvrir l'élément et vérifier que la description est conservée.
3. Ajouter une sous-tâche : elle apparaît immédiatement dans la liste, toujours dépliée (pas de bouton pour la replier).
4. Cocher puis décocher une sous-tâche : l'état visuel (texte barré) suit.
5. Supprimer une sous-tâche : elle disparaît.
6. Taper « ← Retour » : retour à l'écran des éléments de la catégorie.

## 17 — Couleur de fond par outil (E70/E72)

Demande Marie (`roadmap_demandes_marie_v1.md` Phase 4, AP3) : chaque outil peut avoir sa propre couleur de fond.

1. Depuis les Outils (ou un dossier), sur la carte d'un outil, toucher le sélecteur de couleur et choisir une couleur.
2. Vérifier que le fond de la carte se teinte immédiatement avec cette couleur (fond adouci, pas la couleur brute).
3. Revenir sur l'écran (navigation puis retour) : la couleur choisie est conservée.
4. Toucher le bouton « × » à côté du sélecteur : la carte retrouve son fond neutre par défaut, le bouton « × » disparaît.
5. Vérifier que toucher le sélecteur de couleur n'ouvre pas l'outil (le clic sur le titre reste le seul moyen d'ouvrir).
