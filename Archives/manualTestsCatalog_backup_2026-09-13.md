# Sauvegarde — Catalogue des tests manuels (E121 « Tests à faire »)

Source : `src/domain/data/manualTestsCatalog.ts`, état au 2026-09-13, avant suppression des tests
de l'application (demande utilisateur du 2026-09-13).

Catégories définies (`MANUAL_TEST_CATEGORIES`) : Accueil / Planning · Tâches · Outils : Budget ·
Outils : Listes · Outils : autres · Énergie · Paramètres / Profil.

---

## creer-une-liste — Créer une liste
Catégorie : Outils : Listes

1. Sur l'accueil, dans la section « Outils », touchez le bouton « + » à côté du titre.
2. Touchez « Nouvelle liste ».
3. Saisissez un nom, ajoutez au moins une catégorie (obligatoire pour continuer), puis touchez « Créer » : la liste doit s'ouvrir directement.
4. Recommencez la même vérification en ouvrant un dossier déjà créé, puis en touchant son propre bouton « + ».

---

## supprimer-une-liste — Supprimer une liste
Catégorie : Outils : Listes

1. Ouvrez une liste, touchez le bouton « × » en haut à droite de l'écran.
2. Dans la boîte de dialogue « Supprimer cette liste ? », touchez « Supprimer » : vous devez revenir à l'écran des outils et la liste ne doit plus y apparaître.
3. Recommencez la manipulation sur une autre liste, mais touchez cette fois « Annuler » : la liste doit rester présente et inchangée.

---

## retirer-de-l-argent-d-un-livret — Retirer de l'argent d'un livret
Catégorie : Outils : Budget

1. Dans le Budget, touchez le bloc « Mes livrets », puis touchez un livret qui contient déjà de l'argent.
2. Touchez « Ajouter un mouvement », sélectionnez « Retrait » dans le champ Type, saisissez un montant inférieur au solde affiché, puis touchez « Enregistrer » : le solde du livret doit diminuer de ce montant.
3. Recommencez avec un montant supérieur au solde : un message d'erreur doit s'afficher et le bouton « Enregistrer » doit rester désactivé.

---

## modifier-un-mouvement-de-livret — Modifier un mouvement de livret
Catégorie : Outils : Budget

1. Dans le Budget, touchez le bloc « Mes livrets », puis touchez un livret contenant déjà au moins un mouvement.
2. Touchez « Modifier » sur un mouvement, changez le montant ou la date, puis touchez « Enregistrer » : le mouvement et le solde du livret doivent se mettre à jour en conséquence.
3. Touchez « Supprimer » sur un mouvement : il doit disparaître de la liste et le solde doit revenir à sa valeur d'avant ce mouvement.

---

## ajouter-un-element-a-une-liste — Ajouter un élément à une liste sur téléphone
Catégorie : Outils : Listes

1. Sur téléphone, ouvrez une liste, touchez une catégorie, puis touchez « Ajouter un élément ».
2. Touchez le champ « Élément » pour faire apparaître le clavier du téléphone : le champ de saisie et les boutons « Ajouter » et « Annuler » doivent rester visibles et utilisables sans avoir à fermer le clavier au préalable.

---

## categories-de-liste — Choisir et créer des catégories dans une liste
Catégorie : Outils : Listes

1. Ouvrez une liste : l'écran doit d'abord afficher ses catégories, chacune avec son nom et le nombre d'éléments qu'elle contient, jamais les éléments directement.
2. Touchez une catégorie : seuls ses éléments doivent s'afficher.
3. Revenez en arrière avec la flèche ← en haut à gauche, touchez « Ajouter une catégorie », saisissez un nom, touchez « Ajouter » : la nouvelle catégorie doit apparaître dans la liste des catégories avec 0 élément.

---

## importer-une-sauvegarde — Importer une sauvegarde
Catégorie : Paramètres / Profil

1. Allez dans Paramètres, touchez « Export et import ».
2. Touchez « Importer un fichier JSON » et choisissez un fichier de sauvegarde déjà exporté.
3. Dans la boîte de dialogue « Remplacer toutes les données ? », touchez « Importer » pour confirmer. Attention : toutes les données actuellement sur l'appareil sont remplacées par celles du fichier.
4. Vérifiez ensuite que vos listes, tâches, budget et énergie du jour correspondent bien au contenu attendu du fichier importé.

---

## utiliser-le-budget — Utiliser le budget
Catégorie : Outils : Budget · révision 3 · docRefs [6, 8, 10, 26, 27]

1. Depuis l'accueil, ouvrez « Outils » puis touchez la carte « Budget ». Si aucun revenu n'a encore été saisi, seul le bouton « Configurer le budget » doit être visible : touchez-le, saisissez un montant, puis touchez « Enregistrer ».
2. Si un revenu existe déjà, touchez « Modifier le budget » sur la carte « Montant total », puis « Ajouter un revenu », saisissez un montant, puis touchez « Enregistrer » : le montant total et le détail « ... de revenus » doivent augmenter.
3. Regardez les deux blocs « Prévisions » et « Mes livrets » sous « Montant total » : leur montant doit s'afficher en positif et en vert, de la même façon pour les deux (le bloc « Prévisions » s'appelait « Mon compte » et s'affichait auparavant en rouge négatif).
4. Touchez le bloc « Prévisions » : vous devez arriver sur un écran titré « Prévisions » affichant « Semaine » et « Mois » côte à côte, avec pour chaque sous-catégorie uniquement le montant prévu (aucune dépense, aucune jauge).
5. Revenez au Budget avec la flèche ←, puis touchez le bloc « Mes livrets » : l'écran « Mes livrets » doit afficher la liste des livrets ou une proposition de configuration si aucun n'existe.
6. Touchez un livret : vous devez arriver sur sa fiche détaillée avec son solde et la liste de ses mouvements.
7. Touchez « Ajouter un mouvement », remplissez montant/motif/date puis enregistrez : le mouvement doit apparaître dans la liste et le solde du livret doit se mettre à jour.

---

## utiliser-comptes — Suivre ses dépenses avec Mon compte
Catégorie : Outils : Budget · révision 4 · docRefs [11, 12, 13, 14, 27, 28]

1. Depuis l'accueil, touchez le widget « Mon compte » (dans la grille sous le planning ; il s'appelait « Comptes ») : vous devez arriver sur un écran titré « Mon compte » affichant « Semaine » et « Mois » côte à côte, chacune avec ses sous-catégories (montant prévu, montant restant et une jauge).
2. En haut de l'écran, vérifiez le bloc « Solde du mois » : il doit afficher la somme prévue pour toutes les sous-catégories (les sous-catégories « Semaine » comptent quatre fois, les « Mois » une fois), avec en dessous « prévu ... € · chaque dépense saisie diminue ce solde ».
3. Touchez les flèches ← et → sous « Semaine » : la période affichée doit changer sans modifier celle affichée sous « Mois », et sans changer le « Solde du mois » en haut.
4. Touchez une sous-catégorie pour ouvrir sa fiche détaillée : vous devez arriver directement sur cette catégorie, sans avoir à la resélectionner.
5. Sur la fiche de la catégorie, touchez « Ajouter une dépense », remplissez montant/libellé/date puis enregistrez : le montant restant et la jauge de la catégorie doivent se mettre à jour, et le « Solde du mois » en haut de « Mon compte » doit avoir baissé du montant de la dépense.
6. Touchez le bouton « Modifier le montant pour cette semaine » ou « Modifier le montant pour ce mois », saisissez un montant puis enregistrez : le nouveau montant doit s'appliquer uniquement à cette catégorie et à la période affichée ; le montant habituel doit revenir à la période suivante.
7. Retournez à l'accueil, ouvrez « Outils » puis touchez la carte « Budget » : vérifiez que le « Montant total » et le détail « ... mon compte » n'ont pas changé suite à cette dépense (ils reflètent les montants prévus, pas les dépenses déjà faites).

---

## modifier-et-supprimer-un-revenu-du-montant-total — Modifier et supprimer un revenu du Montant total
Catégorie : Outils : Budget · docRefs [6, 7]

1. Depuis l'accueil, ouvrez « Outils » puis touchez la carte « Budget », puis « Modifier le budget » sur la carte « Montant total ».
2. Vérifiez que toutes les entrées de revenus déjà saisies apparaissent dans la liste, chacune avec sa date, son libellé et son montant.
3. Touchez « Modifier » sur une entrée, changez le montant, puis touchez « Enregistrer » : le montant total doit se mettre à jour en conséquence.
4. Touchez « Supprimer » sur une entrée : elle doit disparaître de la liste et le montant total doit diminuer du montant correspondant.

---

## enregistrer-un-resultat-de-test — Enregistrer un résultat de test
Catégorie : Paramètres / Profil

1. Dans « Tests à faire », touchez un test pour l'ouvrir.
2. Choisissez « Non validé », saisissez un commentaire expliquant ce qui ne fonctionne pas, puis touchez « Enregistrer » : le résultat doit apparaître dans la section « Historique » de ce test.
3. Allez dans Paramètres > Export et import, touchez « Exporter en JSON » et confirmez.
4. Réimportez ce même fichier via « Importer un fichier JSON » : le résultat enregistré doit toujours être visible dans l'historique du test après l'import.

---

## planning-hauteur-fixe — Planning à hauteur fixe
Catégorie : Accueil / Planning · docRefs [20]

1. Sur l'accueil, regardez la zone du planning sous le bandeau des jours : le petit trait gris horizontal qui servait à plier et déplier ne doit plus être là.
2. Essayez de glisser le doigt de haut en bas juste sous le planning : la hauteur du planning ne doit pas changer, ni s'agrandir ni se réduire.
3. Vérifiez que la section « Outils » reste visible en dessous du planning.
4. Choisissez un jour avec beaucoup de tâches, ou créez-en plusieurs : glissez le doigt de haut en bas à l'intérieur de la liste des tâches, les tâches doivent défiler dans le planning sans que sa hauteur bouge.

---

## case-de-tache-coloree-en-entier — Case de tâche colorée en entier
Catégorie : Accueil / Planning · docRefs [18]

1. Créez une tâche planifiée aujourd'hui, avec une couleur bien visible et une durée longue (par exemple de 9h à 11h).
2. Sur l'accueil, regardez sa case dans le planning : la couleur doit remplir toute la hauteur de la case, du haut jusqu'en bas, sans bande blanche au-dessus ni en dessous.
3. Ajoutez deux ou trois sous-étapes à cette tâche.
4. De retour sur l'accueil, touchez le compteur de sous-étapes de la case (par exemple « 0/3 ») pour les déplier.
5. Les sous-étapes doivent apparaître sur le même fond coloré que la tâche : l'ensemble ne forme qu'un seul bloc de couleur, sans coupure.
6. Vérifiez que le texte des sous-étapes reste bien lisible sur ce fond.
7. Cochez la tâche pour la terminer : sa case doit passer en couleur pleine, texte blanc et barré.

---

## bandeau-des-jours-colore — Bandeau des jours coloré
Catégorie : Accueil / Planning · révision 2 · docRefs [19, 33]

1. Sur l'accueil, regardez le bandeau des jours de la semaine, juste sous le nom du mois : il doit avoir un contour de votre couleur d'ambiance, sans fond coloré.
2. Allez dans Paramètres > Accessibilité et changez la couleur d'ambiance pour une couleur bien différente.
3. Revenez sur l'accueil : le contour du bandeau des jours doit avoir suivi cette nouvelle couleur, toujours sans fond.
4. Vérifiez que le jour affiché reste bien reconnaissable dans le bandeau (case qui ressort avec son point sous le numéro).
5. Ouvrez le planning de la semaine (logo à gauche du mois) : la grille des 7 jours doit suivre le même traitement, contour coloré sans fond.

---

## defilement-des-jours-dans-la-case — Défilement des jours dans la case
Catégorie : Accueil / Planning · révision 2 · docRefs [21, 38]

1. Sur l'accueil, posez le doigt sur le bandeau des jours et faites-le glisser vers la gauche ou la droite, sans relâcher tout de suite.
2. Pendant le glissement, la case (fond coloré + contour) ne doit pas bouger : seuls les jours défilent à l'intérieur, en suivant le doigt sans à-coup.
3. Les jours qui sortent de la case sont masqués proprement au bord, ils ne débordent pas par-dessus le contour.
4. Relâchez avant la fin du glissement (moins de la moitié d'une case) : le bandeau revient en douceur à sa position de départ, sans saut, sans changer de jour.
5. Relâchez après un glissement suffisant : le bandeau termine son mouvement en douceur jusqu'au jour suivant/précédent, sans saut ni recentrage brutal, et le nouveau jour reste bien centré.
6. Regardez le jour au centre du bandeau (sous le sélecteur) : il doit être visiblement plus grand que les jours sur les côtés.

---

## vue-planning-de-la-semaine — Vue planning de la semaine
Catégorie : Accueil / Planning · docRefs [22]

1. Sur l'accueil, touchez le logo en forme de calendrier à colonnes, juste à gauche du nom du mois : un écran « Planning de la semaine » doit s'ouvrir en pleine page.
2. Vérifiez que les sept jours de la semaine (lundi à dimanche) sont affichés côte à côte, chacun avec son abréviation et son numéro.
3. Chaque tâche planifiée d'un jour apparaît sous ce jour sous forme d'icône seule (sans titre ni horaire) ; touchez une icône : la fiche de la tâche doit s'ouvrir.
4. Posez le doigt sur la grille et glissez vers la gauche : la semaine suivante doit s'afficher. Glissez vers la droite : la semaine précédente.
5. Éloignez-vous de la semaine en cours par glissements, puis touchez « Aujourd'hui » : la vue doit revenir sur la semaine qui contient le jour du jour.
6. Touchez le nom du mois, choisissez un autre mois : la vue doit se placer sur la première semaine de ce mois.
7. Touchez « ← Retour » : vous devez revenir à l'accueil.

---

## nom-de-tache-en-haut-de-case — Nom de la tâche en haut de la case
Catégorie : Accueil / Planning · docRefs [24]

1. Créez une tâche planifiée aujourd'hui avec une longue durée (par exemple de 9h à 12h) pour obtenir une grande case dans le planning.
2. Sur l'accueil, regardez cette case : le nom de la tâche doit être collé en haut de la case, pas centré verticalement ni au milieu.
3. Créez une deuxième tâche courte (15 min) : son nom doit lui aussi être en haut de sa case.
4. Vérifiez que le nom reste en haut même après avoir coché puis décoché la tâche.

---

## heures-debut-fin-sur-la-case — Heure de début en haut, heure de fin en bas
Catégorie : Accueil / Planning · docRefs [25]

1. Créez une tâche planifiée aujourd'hui de 9h00 à 10h30.
2. Sur l'accueil, regardez sa case dans le planning : « 09:00 » doit être affiché en haut à gauche et « 10:30 » en bas à gauche, l'écart entre les deux suivant la durée de la tâche.
3. Créez une tâche sans horaire (ajoutée à la liste à faire, pas planifiée) : sa ligne affiche « Sans horaire » et aucune heure de fin.

---

## sous-etapes-dans-la-carte-planning — Sous-étapes dans la carte du planning
Catégorie : Accueil / Planning · révision 1

1. Créez une tâche planifiée aujourd'hui avec une heure de début, une durée courte (par exemple 30 min) et au moins quatre sous-étapes.
2. Sur l'accueil, touchez le compteur de sous-étapes de sa carte pour les déplier.
3. Les sous-étapes doivent s'afficher à l'intérieur de la carte, juste sous le titre — pas en dessous de la carte.
4. La carte doit s'agrandir d'elle-même pour contenir toutes les sous-étapes, même si sa hauteur de base (liée à la durée) était plus petite.
5. L'heure de fin doit rester en bas à gauche de la carte, au niveau de la dernière sous-étape — les sous-étapes ne doivent pas commencer au niveau de l'heure de fin.
6. Touchez à nouveau le compteur : les sous-étapes se replient, la carte revient à sa hauteur de durée, l'heure de début et l'heure de fin sont inchangées.
7. Cochez une sous-étape : elle se barre sans ouvrir la fiche de la tâche.

---

## duree-obligatoire-tache-planifiee — Durée obligatoire pour une tâche planifiée
Catégorie : Tâches · révision 1 · docRefs [25, 37]

1. Depuis l'accueil ou le planning, commencez la création d'une tâche : les champs Date, Heure de début et Durée apparaissent.
2. Saisissez un titre et une heure de début, mais laissez la durée à zéro : le bouton « Valider » doit rester grisé, avec le message « La durée est obligatoire pour planifier la tâche. ».
3. Choisissez une durée (par exemple 1 heure) : le message disparaît et « Valider » devient actif.
4. Créez à l'inverse une tâche depuis la liste à faire (sans planification) : aucune durée n'est demandée, « Valider » est actif dès que le titre est saisi.
5. Ouvrez une tâche planifiée existante, touchez sa case « Horaire », mettez la durée à zéro : le bouton « Enregistrer » de la case se grise tant qu'une durée n'est pas choisie.

---

## donnees-synchronisees-automatiquement — Voir que les données se sauvegardent toutes seules
Catégorie : Paramètres / Profil

1. Ouvrez l'appli et utilisez-la normalement un instant : ajoutez une tâche ou une saisie d'énergie.
2. Depuis l'accueil, ouvrez « Paramètres ».
3. En bas de l'écran, vous devez voir un encadré « Vos données de test sont partagées avec le développeur ».
4. Juste en dessous, la ligne « Dernière synchronisation : ... » doit afficher une date et une heure récentes (ou « Synchronisation en attente » si c'est la toute première fois).
5. Fermez l'appli, rouvrez-la un peu plus tard puis retournez dans « Paramètres » : la date de dernière synchronisation doit avoir été mise à jour.

---

## montant-total-apres-migration-revenus — Vérifier le Montant total après la migration des revenus de Marie
Catégorie : Outils : Budget

1. Depuis l'accueil, ouvrez « Outils » puis touchez la carte « Budget ».
2. Sur la carte « Montant total » en haut de l'écran, vérifiez qu'elle affiche un montant et le détail « ... de revenus · ... livrets · ... mon compte ».
3. Touchez l'icône ⚙ pour ouvrir « Paramètres du budget » et vérifiez que les anciennes catégories Mcdo, Maman, Livret jeune et APL n'apparaissent plus dans la liste des catégories.
4. Revenez au Budget, touchez « Modifier le budget » puis « Ajouter un revenu », saisissez un montant et un libellé, enregistrez : ce revenu doit s'ajouter au « ... de revenus » affiché sur la carte « Montant total ».

---

## naviguer-dans-le-planning — Naviguer dans le planning de l'accueil
Catégorie : Accueil / Planning

1. Sur l'accueil, dans le bandeau des jours, posez le doigt sur un jour et glissez vers la gauche : le jour affiché doit avancer d'un jour, et le jour actuel doit rester à la même place dans le bandeau (seul le cadre du jour sélectionné se déplace).
2. Glissez maintenant vers la droite : le jour affiché doit reculer d'un jour.
3. Touchez le mois et l'année affichés au-dessus du bandeau (ex. « Août 2026 ») : une fenêtre doit s'ouvrir avec les flèches ‹ › pour changer d'année et les 12 mois à choisir.
4. Touchez un autre mois : la fenêtre doit se fermer et le planning doit afficher ce mois.

---

## modifier-une-tache-planifiee — Modifier une tâche planifiée par ses cases
Catégorie : Tâches · révision 1 · docRefs [37]

1. Sur l'accueil, touchez une tâche planifiée dans le bandeau du planning : la fiche de la tâche s'ouvre en pleine hauteur, avec un bandeau titre en haut teinté de la couleur de la tâche.
2. Touchez le titre dans le bandeau : il devient modifiable directement ; changez-le et touchez ailleurs pour valider : le nouveau titre reste affiché dans le bandeau.
3. Sous le bandeau, vérifiez les cases « Icône », « Couleur », « Date », « Horaire », « Coût en énergie » et « Description », réparties sur deux colonnes et teintées de la même couleur.
4. Touchez la case « Date » : elle se déplie avec un champ de date modifiable ; changez la date, la case affiche la nouvelle valeur sans quitter la fiche.
5. Touchez la case « Horaire » : elle se déplie avec l'heure et la durée modifiables et un bouton « Enregistrer » ; changez l'heure puis touchez « Enregistrer ».
6. Vérifiez qu'aucun bouton « Modifier » séparé ni écran « Modifier la tâche » n'existe : chaque champ se modifie uniquement en touchant sa propre case.

---

## creer-une-tache-bandeau-colore — Créer une tâche avec le bandeau et les cases colorées, repliées comme sur la fiche
Catégorie : Tâches · révision 1 · docRefs [37]

1. Depuis le menu du bas, touchez « Ajouter une tâche » : l'écran de création s'ouvre avec un bandeau en haut portant le champ « Titre de la tâche ».
2. Sous le bandeau, vérifiez que les cases « Icône », « Couleur » et « Coût en énergie » sont repliées (elles affichent juste leur nom et « Aucune »/« Non défini », pas la grille de choix).
3. Touchez la case « Icône » : elle se déplie avec la grille d'icônes ; choisissez-en une : la case se replie aussitôt et affiche l'icône choisie. Le bandeau se teinte quand vous faites de même avec « Couleur ».
4. Touchez une autre case pendant que « Couleur » est encore dépliée (par exemple « Coût en énergie ») : « Couleur » se replie automatiquement, une seule case reste ouverte à la fois.
5. Depuis un point d'entrée qui planifie la tâche d'office (accueil ou planning), vérifiez que « Date » et « Horaire » apparaissent aussi repliées dans la même grille à deux colonnes ; dépliez « Horaire », saisissez l'heure et la durée, puis touchez « Fermer » : la case se replie et affiche l'heure et la durée choisies.
6. Vérifiez que cette présentation (bandeau titre coloré en haut, cases repliées/dépliables en dessous) est la même que sur la fiche d'une tâche déjà créée.

---

## badge-energie-couleur-ambiance — Badge énergie avec la couleur d'ambiance
Catégorie : Énergie

1. Allez dans Paramètres, touchez « Accessibilité ».
2. Touchez le sélecteur « Couleur d'ambiance » et choisissez une couleur différente de celle actuelle.
3. Revenez à l'accueil : le fond du badge d'énergie en haut de l'écran doit être teinté avec cette nouvelle couleur, et n'afficher que l'icône batterie suivie des chiffres, sans les mots « planifié » ni « dispo ».

---

## grouper-les-tests-par-categorie — Retrouver les tests à faire par catégorie
Catégorie : Paramètres / Profil

1. Allez dans « Tests à faire » : seuls les noms des catégories (par exemple « Outils : Budget », « Accueil / Planning ») doivent être visibles, chacun avec le nombre de tests qu'il contient.
2. Touchez le nom d'une catégorie : la liste des tests de cette catégorie doit se déplier en dessous.
3. Touchez un test de cette liste : ses étapes détaillées doivent se déplier.
4. Touchez à nouveau le nom de la catégorie : la liste de ses tests doit se replier.

---

## pastille-nouveaux-tests — Pastille rouge quand il y a des tests à faire
Catégorie : Paramètres / Profil · révision 2

1. Sur l'accueil, regardez l'icône en forme de coche en haut à droite : tant qu'au moins un test n'a jamais été passé, un point rouge doit être affiché dessus.
2. Touchez cette icône, ouvrez un test et enregistrez un résultat en choisissant « Non validé » : le test doit disparaître de la liste « Tests à faire ».
3. Passez ainsi tous les tests, certains en « Validé », d'autres en « Non validé » : quand la liste « Tests à faire » est vide, le point rouge de l'accueil doit disparaître, même s'il reste des tests que vous avez marqués « Non validé ».
4. Après une mise à jour qui corrige un test marqué « Non validé », ce test doit réapparaître dans « Tests à faire » et le point rouge doit se rallumer.

---

## cadres-parametres-tiennent-dans-l-ecran — Les cadres des Paramètres tiennent dans l'écran
Catégorie : Paramètres / Profil · docRefs [32]

1. Sur téléphone, ouvrez « Paramètres » : vérifiez que chaque cadre de la liste tient entièrement dans l'écran, avec la même marge à gauche et à droite, sans être coupé au bord droit.
2. Ouvrez « Accessibilité » : vérifiez la rangée « Petite / Normale / Grande », les cadres « Réduire les animations », « Mode sombre », « Couleur d'ambiance » et le bloc « Couleur des outils » (pastilles et croix « × » comprises) : rien ne doit être coupé à droite.
3. Ouvrez tour à tour « Profil », « Confidentialité », « Export et import » : même vérification sur chaque écran.
4. Sur chaque écran, essayez de faire glisser la page vers la gauche : elle ne doit pas bouger horizontalement.

---

## couleur-tache-sans-couleur-choisie — Couleur d'une tâche sans couleur choisie
Catégorie : Tâches · révision 2 · docRefs [23]

1. Allez dans Paramètres > Accessibilité, choisissez une couleur d'ambiance bien visible.
2. Créez une tâche planifiée sans lui choisir de couleur (« Aucune couleur ») : dans le planning, sa case doit rester avec un fond neutre, pas teintée par la couleur d'ambiance.
3. Cochez cette tâche dans le planning : son texte doit rester lisible (noir, barré), il ne doit pas devenir blanc sur fond clair.
4. Créez une seconde tâche en lui choisissant une couleur : sa case doit être teintée avec cette couleur, et une fois cochée son texte passe en blanc barré sur le fond plein.

---

## supprimer-une-categorie-de-liste — Supprimer une catégorie de liste
Catégorie : Outils : Listes · docRefs [15]

1. Ouvrez une liste ayant au moins deux catégories.
2. Sur l'écran des catégories, touchez la croix rouge à côté d'une catégorie : une confirmation « Supprimer « <nom> » ? » doit s'afficher, pas « Supprimer cette liste ».
3. Touchez « Supprimer » : seule cette catégorie et ses éléments disparaissent, les autres catégories et le reste de la liste restent intacts.
4. Recommencez sur une autre catégorie, mais touchez « Annuler » : la catégorie doit rester intacte.

---

## ajouter-une-categorie-de-liste-sur-mobile — Ajouter une catégorie de liste sur mobile
Catégorie : Outils : Listes · docRefs [16]

1. Sur un téléphone, ouvrez une liste puis touchez « Ajouter une catégorie ».
2. Touchez le champ « Nom de la catégorie » pour ouvrir le clavier, puis saisissez un nom.
3. Vérifiez que le champ et les boutons « Ajouter » et « Annuler » restent entièrement visibles et utilisables.
4. Touchez « Ajouter » : la nouvelle catégorie doit apparaître dans la liste.

---

## sous-taches-element-liste-dans-la-categorie — Sous-tâches d'un élément visibles dans la page de catégorie
Catégorie : Outils : Listes · docRefs [33]

1. Ouvrez une liste, puis une catégorie contenant un élément auquel vous avez déjà ajouté des sous-tâches (sinon, ouvrez un élément, ajoutez-en deux, puis revenez à la catégorie).
2. Sur la ligne de cet élément, un petit compteur « fait / total » suivi d'un chevron ▸ doit apparaître ; un élément sans sous-tâche n'affiche rien de tel.
3. Touchez le compteur : la liste des sous-tâches se déplie sous l'élément, chacune avec une case à cocher, comme les sous-étapes d'une tâche du planning.
4. Cochez une sous-tâche : son texte se barre et le compteur passe à jour ; décochez-la : le texte redevient normal.
5. Touchez à nouveau le compteur (chevron ▾) : la liste des sous-tâches se replie.

---

## detail-element-de-liste — Description et sous-tâches d'un élément de liste
Catégorie : Outils : Listes

1. Ouvrez une liste, une catégorie, puis touchez le titre d'un élément (pas la coche ni les boutons à droite) : l'écran de détail de l'élément doit s'ouvrir.
2. Saisissez une description, touchez en dehors du champ pour en sortir, puis rouvrez l'élément : la description doit être conservée.
3. Ajoutez une sous-tâche : elle doit apparaître immédiatement dans la liste, toujours dépliée.
4. Cochez puis décochez la sous-tâche : le texte doit se barrer puis redevenir normal.
5. Supprimez la sous-tâche : elle doit disparaître.
6. Touchez « ← Retour » : vous devez revenir à l'écran des éléments de la même catégorie que celle ouverte avant le détail.

---

## consulter-et-modifier-l-energie — Modifier l'énergie depuis l'accueil
Catégorie : Énergie · révision 3 · docRefs [17, 29, 34]

1. Depuis l'accueil, regardez le badge énergie en haut à gauche : son contour doit être teinté de votre couleur d'ambiance, sans fond coloré.
2. Touchez le badge énergie : l'écran « Mon énergie maintenant » doit s'ouvrir directement.
3. Choisissez une valeur puis touchez « Valider » : vous devez revenir directement à l'accueil.
4. Rouvrez l'écran d'énergie, puis touchez « ← Retour » : vous devez revenir directement à l'accueil, sans passer par un écran intermédiaire « Mon énergie ».
5. Rouvrez-le encore, touchez « Ignorer » : là aussi vous devez revenir directement à l'accueil, et le badge doit indiquer « Énergie ignorée ».
6. Vérifiez qu'il n'existe plus aucun écran « Mon énergie » séparé (seul le check-in « Mon énergie maintenant » subsiste).

---

## encadrement-et-glissement-du-planning — Encadrement et glissement animé du bandeau de dates
Catégorie : Accueil / Planning

1. Allez dans Paramètres > Accessibilité, choisissez une couleur d'ambiance bien visible.
2. Sur l'accueil ou le planning, vérifiez que le bandeau des jours est entouré d'un cadre de cette couleur.
3. Posez le doigt sur le bandeau et glissez-le latéralement sans le relâcher : le bandeau doit suivre le doigt de façon fluide, sans saut brusque.
4. Relâchez le doigt : le bandeau doit revenir à sa place avec une animation douce, en changeant de jour si le glissement était assez ample.

---

## couleur-de-fond-par-outil — Couleur de contour par outil
Catégorie : Paramètres / Profil · révision 4 · docRefs [2, 30, 31, 36]

1. Allez dans Paramètres, puis touchez « Accessibilité ».
2. Après « Couleur d'ambiance », repérez la section « Couleur des outils », puis choisissez une couleur pour un outil : le contour de sa carte doit se teinter aussitôt, sans fond coloré.
3. Revenez à l'accueil : dans la section « Outils », la carte de ce même outil doit maintenant afficher ce contour coloré (avant, elle restait sans contour).
4. Quittez les Paramètres puis revenez : la couleur choisie doit être conservée.
5. Touchez le bouton « × » à côté de la couleur : la carte de l'outil doit retrouver son contour neutre par défaut, sur l'écran Accessibilité comme sur l'accueil, et le bouton « × » doit disparaître.
6. Dans la même section « Couleur des outils », vérifiez qu'une ligne « Mon compte » est présente, même si vous n'avez aucun autre outil personnalisable.
7. Choisissez une couleur pour « Mon compte », revenez à l'accueil : la carte « Mon compte » (dans la grille sous le planning) doit afficher ce contour coloré, sans fond. Le bouton « × » doit la remettre par défaut.
8. Ouvrez l'écran Outils (accès depuis l'accueil) : les cartes d'outils y suivent le même traitement, contour coloré sans fond.

---

## menu-actions-tache-simplifie — Menu d'actions simplifié sur la fiche d'une tâche
Catégorie : Tâches · révision 3 · docRefs [4, 5, 37]

1. Ouvrez la fiche de détail d'une tâche (depuis Réception ou le planning).
2. Vérifiez que seuls les boutons « Décomposer », « Dupliquer » et « Supprimer » sont affichés en bas de la fiche : « Modifier », « Tâche du jour », « Planifier », « Liste » et « Terminer » ne doivent plus apparaître.
3. Pour terminer la tâche, cochez-la directement dans le planning.

---

## plus-de-categorie-tache-du-jour — La catégorie « Tâche du jour » a disparu
Catégorie : Tâches

1. Ouvrez « Réception » : sur chaque tâche de la liste, seuls les boutons « Planifier » et « Liste » doivent être proposés. Le bouton « Tâche du jour » ne doit plus exister.
2. Ouvrez la fiche d'une tâche, puis touchez ses cases (Icône, Couleur, Date...) et « Décomposer » : nulle part il ne doit être question de « Tâche du jour » ni d'une catégorie « Aujourd'hui » distincte du planning.
3. Si vous aviez déjà des tâches rangées dans « Tâche du jour » avant la mise à jour, vérifiez qu'elles sont maintenant dans « Réception », sans date, prêtes à être re-triées.

---

## ajouter-une-tache-depuis-la-reception — Ajouter une tâche depuis la Réception
Catégorie : Tâches · révision 1

1. Ouvrez « Réception » et touchez « Ajouter une tâche ».
2. Un champ « Titre de la tâche » doit apparaître à la place du bouton, sans changement d'écran et sans aucun autre champ (pas d'heure, pas de durée, pas de destination).
3. Au moment où le champ apparaît, la page ne doit pas zoomer ni se décaler : l'affichage reste exactement à la même échelle.
4. Saisissez un titre puis touchez « Valider » : le champ se referme et la tâche apparaît dans la liste de Réception.
5. Sur cette nouvelle tâche, seuls les boutons « Planifier » et « Liste » doivent être proposés.
6. Touchez de nouveau « Ajouter une tâche » puis « Annuler » : le champ se referme sans rien créer.

---

## navigation-entre-tous-les-ecrans — Navigation fluide entre les écrans
Catégorie : Paramètres / Profil

1. Depuis l'accueil, touchez successivement chaque icône du menu du bas (Réception, Ajouter une tâche, Accueil, Paramètres) : chaque écran doit s'afficher normalement, sans rester bloqué sur « Chargement... ».
2. Dans la section « Outils », ouvrez successivement le Budget, une Liste existante et un dossier : chaque écran doit s'ouvrir normalement.
3. Ouvrez le détail d'une tâche existante, puis touchez « Décomposer » : les deux écrans doivent s'afficher sans blocage.
4. Si un écran reste bloqué sur « Chargement... » plus de quelques secondes, fermez complètement l'application puis rouvrez-la : l'écran doit alors s'afficher normalement.

---

## configurer-un-code-couleur — Configurer un code couleur de tâche
Catégorie : Paramètres / Profil · docRefs [35]

1. Allez dans Paramètres > Accessibilité, repérez la section « Code couleur des tâches » : tant qu'aucune catégorie n'est créée, elle affiche « Aucune catégorie configurée. ».
2. Touchez « Ajouter une catégorie », saisissez un nom, choisissez une couleur, puis touchez « Ajouter » : la catégorie doit apparaître dans la liste avec son nom et sa couleur.
3. Touchez le nom de la catégorie : une fenêtre « Renommer la catégorie » s'ouvre ; changez le nom, touchez « Enregistrer » : le nouveau nom doit s'afficher immédiatement.
4. Touchez la pastille de couleur de la catégorie et choisissez une autre couleur : elle doit se mettre à jour aussitôt.
5. Touchez le bouton « × » à côté de la catégorie : elle doit disparaître de la liste.

---

## choisir-une-couleur-de-tache-par-categorie — Choisir une couleur de tâche par catégorie
Catégorie : Tâches · révision 1 · docRefs [35]

1. Sans catégorie configurée (voir « Configurer un code couleur de tâche »), commencez la création d'une tâche : le champ « Couleur » doit proposer le sélecteur habituel (une pastille de couleur à toucher).
2. Configurez au moins une catégorie dans Paramètres > Accessibilité, puis revenez créer ou modifier une tâche : le champ « Couleur » doit maintenant proposer les catégories par leur nom et leur pastille, à la place du sélecteur habituel.
3. Touchez une catégorie : elle doit apparaître sélectionnée directement au clic, sans avoir besoin de revenir sur l'accueil ni de rouvrir la tâche.
4. Vérifiez que la tâche enregistrée prend bien la couleur de cette catégorie.
5. Touchez « Retirer » : aucune catégorie ne doit plus être sélectionnée et la tâche enregistrée n'a alors aucune couleur.

---

## coupure-reseau-pendant-un-envoi-de-retour — Coupure réseau pendant l'envoi d'un retour
Catégorie : Paramètres / Profil

1. Ouvrez un retour annoté prêt à être envoyé, activez le mode avion, puis touchez « Envoyer ».
2. Attendez environ 30 secondes sans toucher l'appli : l'envoi doit s'arrêter de lui-même, sans que l'appli reste bloquée, et le retour doit passer en « Échec d'envoi ».
3. Désactivez le mode avion, puis touchez « Relancer » sur ce retour : il doit repartir sans dupliquer l'image déjà déposée, et passer en « Envoyé ».

---

## consentement-synchronisation-non-interrompu — La synchronisation n'a pas été coupée par le nouvel écran de consentement
Catégorie : Paramètres / Profil

1. Ouvrez l'application comme d'habitude : aucun nouvel écran « Partage de vos données pour les tests » ne doit apparaître au démarrage (cet écran ne concerne que les nouvelles installations).
2. Allez dans Paramètres, puis touchez « Vie privée ».
3. Repérez la ligne « Partager mes données pour les tests » : la case doit être cochée.
4. Si la case est décochée, cochez-la, puis signalez-le : votre synchronisation avait été interrompue et vient d'être réactivée.
5. Touchez « ← Retour » puis rouvrez « Vie privée » : la case doit être restée dans le même état.

---

## consulter-les-nouveautes — Consulter les nouveautés depuis l'écran Tests à faire
Catégorie : Outils : autres

1. Sur l'écran « Tests à faire », en haut à côté de « ← Retour », repérez le bouton « Nouveautés » : un point rouge doit être visible dessus.
2. Touchez « Nouveautés » : une fenêtre s'ouvre au centre de l'écran avec la liste des changements récents.
3. Touchez « Fermer » : la fenêtre se ferme et le point rouge a disparu du bouton.
4. Quittez l'écran puis revenez sur « Tests à faire » : le point rouge ne doit plus réapparaître tant qu'aucune nouveauté n'a été ajoutée.

---

**Total : 46 tests sauvegardés.**
