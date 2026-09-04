export const MANUAL_TEST_CATEGORIES = [
  'Accueil / Planning',
  'Tâches',
  'Outils : Budget',
  'Outils : Listes',
  'Outils : autres',
  'Énergie',
  'Paramètres / Profil',
] as const

export type ManualTestCategory = (typeof MANUAL_TEST_CATEGORIES)[number]

export interface ManualTest {
  id: string
  revision?: number
  title: string
  category: ManualTestCategory
  steps: string[]
  // Numéros de modification du Google Doc « Modifications » de Marie que ce parcours vérifie.
  // Voir _contexte/marie_modifications_suivi.md. Absent = parcours hors Doc (retour WhatsApp, contrôle générique).
  docRefs?: number[]
}

// Template à suivre pour chaque nouveau test :
// {
//   id: 'identifiant-en-kebab-case',
//   title: 'Titre court à l’impératif',
//   category: 'une des valeurs de MANUAL_TEST_CATEGORIES',
//   steps: [
//     'Une seule action par étape, avec le libellé exact du bouton/champ/écran tel qu’affiché.',
//     'Si l’étape produit un résultat observable, l’indiquer dans la même étape après « : ».',
//   ],
// }
// Règle : aucune étape implicite (pas de « puis vérifiez » vague) — chaque étape nomme l’élément
// d’UI à toucher et, le cas échéant, ce qui doit se produire.

export const manualTestsCatalog: ManualTest[] = [
  {
    id: 'creer-une-liste',
    title: 'Créer une liste',
    category: 'Outils : Listes',
    steps: [
      'Sur l’accueil, dans la section « Outils », touchez le bouton « + » à côté du titre.',
      'Touchez « Nouvelle liste ».',
      'Saisissez un nom, ajoutez au moins une catégorie (obligatoire pour continuer), puis touchez « Créer » : la liste doit s’ouvrir directement.',
      'Recommencez la même vérification en ouvrant un dossier déjà créé, puis en touchant son propre bouton « + ».',
    ],
  },
  {
    id: 'supprimer-une-liste',
    title: 'Supprimer une liste',
    category: 'Outils : Listes',
    steps: [
      'Ouvrez une liste, touchez le bouton « × » en haut à droite de l’écran.',
      'Dans la boîte de dialogue « Supprimer cette liste ? », touchez « Supprimer » : vous devez revenir à l’écran des outils et la liste ne doit plus y apparaître.',
      'Recommencez la manipulation sur une autre liste, mais touchez cette fois « Annuler » : la liste doit rester présente et inchangée.',
    ],
  },
  {
    id: 'retirer-de-l-argent-d-un-livret',
    title: 'Retirer de l’argent d’un livret',
    category: 'Outils : Budget',
    steps: [
      'Dans le Budget, touchez le bloc « Mes livrets », puis touchez un livret qui contient déjà de l’argent.',
      'Touchez « Ajouter un mouvement », sélectionnez « Retrait » dans le champ Type, saisissez un montant inférieur au solde affiché, puis touchez « Enregistrer » : le solde du livret doit diminuer de ce montant.',
      'Recommencez avec un montant supérieur au solde : un message d’erreur doit s’afficher et le bouton « Enregistrer » doit rester désactivé.',
    ],
  },
  {
    id: 'modifier-un-mouvement-de-livret',
    title: 'Modifier un mouvement de livret',
    category: 'Outils : Budget',
    steps: [
      'Dans le Budget, touchez le bloc « Mes livrets », puis touchez un livret contenant déjà au moins un mouvement.',
      'Touchez « Modifier » sur un mouvement, changez le montant ou la date, puis touchez « Enregistrer » : le mouvement et le solde du livret doivent se mettre à jour en conséquence.',
      'Touchez « Supprimer » sur un mouvement : il doit disparaître de la liste et le solde doit revenir à sa valeur d’avant ce mouvement.',
    ],
  },
  {
    id: 'ajouter-un-element-a-une-liste',
    title: 'Ajouter un élément à une liste sur téléphone',
    category: 'Outils : Listes',
    steps: [
      'Sur téléphone, ouvrez une liste, touchez une catégorie, puis touchez « Ajouter un élément ».',
      'Touchez le champ « Élément » pour faire apparaître le clavier du téléphone : le champ de saisie et les boutons « Ajouter » et « Annuler » doivent rester visibles et utilisables sans avoir à fermer le clavier au préalable.',
    ],
  },
  {
    id: 'categories-de-liste',
    title: 'Choisir et créer des catégories dans une liste',
    category: 'Outils : Listes',
    steps: [
      'Ouvrez une liste : l’écran doit d’abord afficher ses catégories, chacune avec son nom et le nombre d’éléments qu’elle contient, jamais les éléments directement.',
      'Touchez une catégorie : seuls ses éléments doivent s’afficher.',
      'Revenez en arrière avec la flèche ← en haut à gauche, touchez « Ajouter une catégorie », saisissez un nom, touchez « Ajouter » : la nouvelle catégorie doit apparaître dans la liste des catégories avec 0 élément.',
    ],
  },
  {
    id: 'importer-une-sauvegarde',
    title: 'Importer une sauvegarde',
    category: 'Paramètres / Profil',
    steps: [
      'Allez dans Paramètres, touchez « Export et import ».',
      'Touchez « Importer un fichier JSON » et choisissez un fichier de sauvegarde déjà exporté.',
      'Dans la boîte de dialogue « Remplacer toutes les données ? », touchez « Importer » pour confirmer. Attention : toutes les données actuellement sur l’appareil sont remplacées par celles du fichier.',
      'Vérifiez ensuite que vos listes, tâches, budget et énergie du jour correspondent bien au contenu attendu du fichier importé.',
    ],
  },
  {
    id: 'utiliser-le-budget',
    revision: 3,
    title: 'Utiliser le budget',
    category: 'Outils : Budget',
    docRefs: [6, 8, 10, 26, 27],
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget ». Si aucun revenu n’a encore été saisi, seul le bouton « Configurer le budget » doit être visible : touchez-le, saisissez un montant, puis touchez « Enregistrer ».',
      'Si un revenu existe déjà, touchez « Modifier le budget » sur la carte « Montant total », puis « Ajouter un revenu », saisissez un montant, puis touchez « Enregistrer » : le montant total et le détail « ... de revenus » doivent augmenter.',
      'Regardez les deux blocs « Prévisions » et « Mes livrets » sous « Montant total » : leur montant doit s’afficher en positif et en vert, de la même façon pour les deux (le bloc « Prévisions » s’appelait « Mon compte » et s’affichait auparavant en rouge négatif).',
      'Touchez le bloc « Prévisions » : vous devez arriver sur un écran titré « Prévisions » affichant « Semaine » et « Mois » côte à côte, avec pour chaque sous-catégorie uniquement le montant prévu (aucune dépense, aucune jauge).',
      'Revenez au Budget avec la flèche ←, puis touchez le bloc « Mes livrets » : l’écran « Mes livrets » doit afficher la liste des livrets ou une proposition de configuration si aucun n’existe.',
      'Touchez un livret : vous devez arriver sur sa fiche détaillée avec son solde et la liste de ses mouvements.',
      'Touchez « Ajouter un mouvement », remplissez montant/motif/date puis enregistrez : le mouvement doit apparaître dans la liste et le solde du livret doit se mettre à jour.',
    ],
  },
  {
    id: 'utiliser-comptes',
    revision: 4,
    title: 'Suivre ses dépenses avec Mon compte',
    category: 'Outils : Budget',
    docRefs: [11, 12, 13, 14, 27, 28],
    steps: [
      'Depuis l’accueil, touchez le widget « Mon compte » (dans la grille sous le planning ; il s’appelait « Comptes ») : vous devez arriver sur un écran titré « Mon compte » affichant « Semaine » et « Mois » côte à côte, chacune avec ses sous-catégories (montant prévu, montant restant et une jauge).',
      'En haut de l’écran, vérifiez le bloc « Solde du mois » : il doit afficher la somme prévue pour toutes les sous-catégories (les sous-catégories « Semaine » comptent quatre fois, les « Mois » une fois), avec en dessous « prévu ... € · chaque dépense saisie diminue ce solde ».',
      'Touchez les flèches ← et → sous « Semaine » : la période affichée doit changer sans modifier celle affichée sous « Mois », et sans changer le « Solde du mois » en haut.',
      'Touchez une sous-catégorie pour ouvrir sa fiche détaillée : vous devez arriver directement sur cette catégorie, sans avoir à la resélectionner.',
      'Sur la fiche de la catégorie, touchez « Ajouter une dépense », remplissez montant/libellé/date puis enregistrez : le montant restant et la jauge de la catégorie doivent se mettre à jour, et le « Solde du mois » en haut de « Mon compte » doit avoir baissé du montant de la dépense.',
      'Touchez le bouton « Modifier le montant pour cette semaine » ou « Modifier le montant pour ce mois », saisissez un montant puis enregistrez : le nouveau montant doit s’appliquer uniquement à cette catégorie et à la période affichée ; le montant habituel doit revenir à la période suivante.',
      'Retournez à l’accueil, ouvrez « Outils » puis touchez la carte « Budget » : vérifiez que le « Montant total » et le détail « ... mon compte » n’ont pas changé suite à cette dépense (ils reflètent les montants prévus, pas les dépenses déjà faites).',
    ],
  },
  {
    id: 'modifier-et-supprimer-un-revenu-du-montant-total',
    title: 'Modifier et supprimer un revenu du Montant total',
    category: 'Outils : Budget',
    docRefs: [6, 7],
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget », puis « Modifier le budget » sur la carte « Montant total ».',
      'Vérifiez que toutes les entrées de revenus déjà saisies apparaissent dans la liste, chacune avec sa date, son libellé et son montant.',
      'Touchez « Modifier » sur une entrée, changez le montant, puis touchez « Enregistrer » : le montant total doit se mettre à jour en conséquence.',
      'Touchez « Supprimer » sur une entrée : elle doit disparaître de la liste et le montant total doit diminuer du montant correspondant.',
    ],
  },
  {
    id: 'enregistrer-un-resultat-de-test',
    title: 'Enregistrer un résultat de test',
    category: 'Paramètres / Profil',
    steps: [
      'Dans « Tests à faire », touchez un test pour l’ouvrir.',
      'Choisissez « Non validé », saisissez un commentaire expliquant ce qui ne fonctionne pas, puis touchez « Enregistrer » : le résultat doit apparaître dans la section « Historique » de ce test.',
      'Allez dans Paramètres > Export et import, touchez « Exporter en JSON » et confirmez.',
      'Réimportez ce même fichier via « Importer un fichier JSON » : le résultat enregistré doit toujours être visible dans l’historique du test après l’import.',
    ],
  },
  {
    id: 'planning-hauteur-fixe',
    title: 'Planning à hauteur fixe',
    category: 'Accueil / Planning',
    docRefs: [20],
    steps: [
      'Sur l’accueil, regardez la zone du planning sous le bandeau des jours : le petit trait gris horizontal qui servait à plier et déplier ne doit plus être là.',
      'Essayez de glisser le doigt de haut en bas juste sous le planning : la hauteur du planning ne doit pas changer, ni s’agrandir ni se réduire.',
      'Vérifiez que la section « Outils » reste visible en dessous du planning.',
      'Choisissez un jour avec beaucoup de tâches, ou créez-en plusieurs : glissez le doigt de haut en bas à l’intérieur de la liste des tâches, les tâches doivent défiler dans le planning sans que sa hauteur bouge.',
    ],
  },
  {
    id: 'case-de-tache-coloree-en-entier',
    title: 'Case de tâche colorée en entier',
    category: 'Accueil / Planning',
    docRefs: [18],
    steps: [
      'Créez une tâche planifiée aujourd’hui, avec une couleur bien visible et une durée longue (par exemple de 9h à 11h).',
      'Sur l’accueil, regardez sa case dans le planning : la couleur doit remplir toute la hauteur de la case, du haut jusqu’en bas, sans bande blanche au-dessus ni en dessous.',
      'Ajoutez deux ou trois sous-étapes à cette tâche.',
      'De retour sur l’accueil, touchez le compteur de sous-étapes de la case (par exemple « 0/3 ») pour les déplier.',
      'Les sous-étapes doivent apparaître sur le même fond coloré que la tâche : l’ensemble ne forme qu’un seul bloc de couleur, sans coupure.',
      'Vérifiez que le texte des sous-étapes reste bien lisible sur ce fond.',
      'Cochez la tâche pour la terminer : sa case doit passer en couleur pleine, texte blanc et barré.',
    ],
  },
  {
    id: 'bandeau-des-jours-colore',
    title: 'Bandeau des jours coloré',
    category: 'Accueil / Planning',
    docRefs: [19],
    steps: [
      'Sur l’accueil, regardez le bandeau des jours de la semaine, juste sous le nom du mois.',
      'Le fond du bandeau doit être teinté de votre couleur d’ambiance, pas seulement son contour.',
      'Allez dans Paramètres > Accessibilité et changez la couleur d’ambiance pour une couleur bien différente.',
      'Revenez sur l’accueil : le fond du bandeau des jours doit avoir suivi cette nouvelle couleur.',
      'Vérifiez que le jour affiché reste bien reconnaissable dans le bandeau (case qui ressort avec son point sous le numéro).',
    ],
  },
  {
    id: 'defilement-des-jours-dans-la-case',
    title: 'Défilement des jours dans la case',
    category: 'Accueil / Planning',
    docRefs: [21],
    steps: [
      'Sur l’accueil, posez le doigt sur le bandeau des jours et faites-le glisser vers la gauche ou la droite, sans relâcher tout de suite.',
      'Pendant le glissement, la case (fond coloré + contour) ne doit pas bouger : seuls les jours défilent à l’intérieur.',
      'Les jours qui sortent de la case sont masqués proprement au bord, ils ne débordent pas par-dessus le contour.',
      'Relâchez : le bandeau se recentre sur le nouveau jour affiché.',
      'Regardez le jour au centre du bandeau (sous le sélecteur) : il doit être visiblement plus grand que les jours sur les côtés.',
    ],
  },
  {
    id: 'vue-planning-de-la-semaine',
    title: 'Vue planning de la semaine',
    category: 'Accueil / Planning',
    docRefs: [22],
    steps: [
      'Sur l’accueil, touchez le logo en forme de calendrier à colonnes, juste à gauche du nom du mois : un écran « Planning de la semaine » doit s’ouvrir en pleine page.',
      'Vérifiez que les sept jours de la semaine (lundi à dimanche) sont affichés côte à côte, chacun avec son abréviation et son numéro.',
      'Chaque tâche planifiée d’un jour apparaît sous ce jour sous forme d’icône seule (sans titre ni horaire) ; touchez une icône : la fiche de la tâche doit s’ouvrir.',
      'Posez le doigt sur la grille et glissez vers la gauche : la semaine suivante doit s’afficher. Glissez vers la droite : la semaine précédente.',
      'Éloignez-vous de la semaine en cours par glissements, puis touchez « Aujourd’hui » : la vue doit revenir sur la semaine qui contient le jour du jour.',
      'Touchez le nom du mois, choisissez un autre mois : la vue doit se placer sur la première semaine de ce mois.',
      'Touchez « ← Retour » : vous devez revenir à l’accueil.',
    ],
  },
  {
    id: 'nom-de-tache-en-haut-de-case',
    title: 'Nom de la tâche en haut de la case',
    category: 'Accueil / Planning',
    docRefs: [24],
    steps: [
      'Créez une tâche planifiée aujourd’hui avec une longue durée (par exemple de 9h à 12h) pour obtenir une grande case dans le planning.',
      'Sur l’accueil, regardez cette case : le nom de la tâche doit être collé en haut de la case, pas centré verticalement ni au milieu.',
      'Créez une deuxième tâche courte (15 min) : son nom doit lui aussi être en haut de sa case.',
      'Vérifiez que le nom reste en haut même après avoir coché puis décoché la tâche.',
    ],
  },
  {
    id: 'heures-debut-fin-sur-la-case',
    title: 'Heure de début en haut, heure de fin en bas',
    category: 'Accueil / Planning',
    docRefs: [25],
    steps: [
      'Créez une tâche planifiée aujourd’hui de 9h00 à 10h30.',
      'Sur l’accueil, regardez sa case dans le planning : « 09:00 » doit être affiché en haut à gauche et « 10:30 » en bas à gauche, l’écart entre les deux suivant la durée de la tâche.',
      'Créez une tâche sans horaire (ajoutée à la liste à faire, pas planifiée) : sa ligne affiche « Sans horaire » et aucune heure de fin.',
    ],
  },
  {
    id: 'duree-obligatoire-tache-planifiee',
    title: 'Durée obligatoire pour une tâche planifiée',
    category: 'Tâches',
    docRefs: [25],
    steps: [
      'Depuis l’accueil ou le planning, commencez la création d’une tâche : les champs Date, Heure de début et Durée apparaissent.',
      'Saisissez un titre et une heure de début, mais laissez la durée à zéro : le bouton « Valider » doit rester grisé, avec le message « La durée est obligatoire pour planifier la tâche. ».',
      'Choisissez une durée (par exemple 1 heure) : le message disparaît et « Valider » devient actif.',
      'Créez à l’inverse une tâche depuis la liste à faire (sans planification) : aucune durée n’est demandée, « Valider » est actif dès que le titre est saisi.',
      'Ouvrez une tâche planifiée existante, touchez « Modifier », mettez la durée à zéro : « Enregistrer » se grise tant qu’une durée n’est pas choisie.',
    ],
  },
  {
    id: 'donnees-synchronisees-automatiquement',
    title: 'Voir que les données se sauvegardent toutes seules',
    category: 'Paramètres / Profil',
    steps: [
      'Ouvrez l’appli et utilisez-la normalement un instant : ajoutez une tâche ou une saisie d’énergie.',
      'Depuis l’accueil, ouvrez « Paramètres ».',
      'En bas de l’écran, vous devez voir un encadré « Vos données de test sont partagées avec le développeur ».',
      'Juste en dessous, la ligne « Dernière synchronisation : ... » doit afficher une date et une heure récentes (ou « Synchronisation en attente » si c’est la toute première fois).',
      'Fermez l’appli, rouvrez-la un peu plus tard puis retournez dans « Paramètres » : la date de dernière synchronisation doit avoir été mise à jour.',
    ],
  },
  {
    id: 'montant-total-apres-migration-revenus',
    title: 'Vérifier le Montant total après la migration des revenus de Marie',
    category: 'Outils : Budget',
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget ».',
      'Sur la carte « Montant total » en haut de l’écran, vérifiez qu’elle affiche un montant et le détail « ... de revenus · ... livrets · ... mon compte ».',
      'Touchez l’icône ⚙ pour ouvrir « Paramètres du budget » et vérifiez que les anciennes catégories Mcdo, Maman, Livret jeune et APL n’apparaissent plus dans la liste des catégories.',
      'Revenez au Budget, touchez « Modifier le budget » puis « Ajouter un revenu », saisissez un montant et un libellé, enregistrez : ce revenu doit s’ajouter au « ... de revenus » affiché sur la carte « Montant total ».',
    ],
  },
  {
    id: 'naviguer-dans-le-planning',
    title: 'Naviguer dans le planning de l’accueil',
    category: 'Accueil / Planning',
    steps: [
      'Sur l’accueil, dans le bandeau des jours, posez le doigt sur un jour et glissez vers la gauche : le jour affiché doit avancer d’un jour, et le jour actuel doit rester à la même place dans le bandeau (seul le cadre du jour sélectionné se déplace).',
      'Glissez maintenant vers la droite : le jour affiché doit reculer d’un jour.',
      'Touchez le mois et l’année affichés au-dessus du bandeau (ex. « Août 2026 ») : une fenêtre doit s’ouvrir avec les flèches ‹ › pour changer d’année et les 12 mois à choisir.',
      'Touchez un autre mois : la fenêtre doit se fermer et le planning doit afficher ce mois.',
    ],
  },
  {
    id: 'modifier-une-tache-planifiee',
    title: 'Modifier une tâche planifiée',
    category: 'Tâches',
    steps: [
      'Sur l’accueil, touchez une tâche planifiée dans le bandeau du planning : la fiche de la tâche s’ouvre, avec un fond légèrement teinté de la couleur d’ambiance choisie dans les paramètres.',
      'Vérifiez que les champs Titre, Icône, Couleur, Date, Horaire et Coût en énergie sont uniquement affichés, sans réagir au toucher.',
      'Touchez le bouton « Modifier » en bas de la fiche : un écran « Modifier la tâche » s’ouvre, avec tous les champs déjà remplis avec les valeurs actuelles de la tâche.',
      'Changez un champ, par exemple le titre, puis touchez « Enregistrer » : vous devez revenir à la fiche de la tâche avec la nouvelle valeur affichée.',
    ],
  },
  {
    id: 'badge-energie-couleur-ambiance',
    title: 'Badge énergie avec la couleur d’ambiance',
    category: 'Énergie',
    steps: [
      'Allez dans Paramètres, touchez « Accessibilité ».',
      'Touchez le sélecteur « Couleur d’ambiance » et choisissez une couleur différente de celle actuelle.',
      'Revenez à l’accueil : le fond du badge d’énergie en haut de l’écran doit être teinté avec cette nouvelle couleur, et n’afficher que l’icône batterie suivie des chiffres, sans les mots « planifié » ni « dispo ».',
    ],
  },
  {
    id: 'grouper-les-tests-par-categorie',
    title: 'Retrouver les tests à faire par catégorie',
    category: 'Paramètres / Profil',
    steps: [
      'Allez dans « Tests à faire » : seuls les noms des catégories (par exemple « Outils : Budget », « Accueil / Planning ») doivent être visibles, chacun avec le nombre de tests qu’il contient.',
      'Touchez le nom d’une catégorie : la liste des tests de cette catégorie doit se déplier en dessous.',
      'Touchez un test de cette liste : ses étapes détaillées doivent se déplier.',
      'Touchez à nouveau le nom de la catégorie : la liste de ses tests doit se replier.',
    ],
  },
  {
    id: 'pastille-nouveaux-tests',
    revision: 2,
    title: 'Pastille rouge quand il y a des tests à faire',
    category: 'Paramètres / Profil',
    steps: [
      'Sur l’accueil, regardez l’icône en forme de coche en haut à droite : tant qu’au moins un test n’a jamais été passé, un point rouge doit être affiché dessus.',
      'Touchez cette icône, ouvrez un test et enregistrez un résultat en choisissant « Non validé » : le test doit disparaître de la liste « Tests à faire ».',
      'Passez ainsi tous les tests, certains en « Validé », d’autres en « Non validé » : quand la liste « Tests à faire » est vide, le point rouge de l’accueil doit disparaître, même s’il reste des tests que vous avez marqués « Non validé ».',
      'Après une mise à jour qui corrige un test marqué « Non validé », ce test doit réapparaître dans « Tests à faire » et le point rouge doit se rallumer.',
    ],
  },
  {
    id: 'cadre-date-heure-dans-l-ecran',
    revision: 1,
    title: 'Cadre Date et Heure bien dans l’écran',
    category: 'Tâches',
    docRefs: [3],
    steps: [
      'Sur téléphone, commencez la création d’une tâche et activez sa planification pour faire apparaître les champs « Date » et « Heure de début ».',
      'Vérifiez que les cadres « Date » et « Heure de début » tiennent entièrement dans l’écran, sans dépasser sur le bord droit, avec la même marge à gauche et à droite.',
      'Vérifiez aussi la grille « Coût en énergie » (chiffres 1 à 12) : la 6e et la 12e case doivent être entières, pas coupées au bord droit.',
      'Faites défiler tout le formulaire de haut en bas : aucun élément ne doit dépasser à droite et la page ne doit pas pouvoir glisser horizontalement.',
      'Ouvrez ensuite une tâche déjà planifiée, touchez « Modifier » : refaites les mêmes vérifications sur l’écran de modification.',
    ],
  },
  {
    id: 'cadres-parametres-tiennent-dans-l-ecran',
    title: 'Les cadres des Paramètres tiennent dans l’écran',
    category: 'Paramètres / Profil',
    docRefs: [32],
    steps: [
      'Sur téléphone, ouvrez « Paramètres » : vérifiez que chaque cadre de la liste tient entièrement dans l’écran, avec la même marge à gauche et à droite, sans être coupé au bord droit.',
      'Ouvrez « Accessibilité » : vérifiez la rangée « Petite / Normale / Grande », les cadres « Réduire les animations », « Mode sombre », « Couleur d’ambiance » et le bloc « Couleur des outils » (pastilles et croix « × » comprises) : rien ne doit être coupé à droite.',
      'Ouvrez tour à tour « Profil », « Confidentialité », « Export et import » : même vérification sur chaque écran.',
      'Sur chaque écran, essayez de faire glisser la page vers la gauche : elle ne doit pas bouger horizontalement.',
    ],
  },
  {
    id: 'couleur-tache-sans-couleur-choisie',
    revision: 2,
    title: 'Couleur d’une tâche sans couleur choisie',
    category: 'Tâches',
    docRefs: [23],
    steps: [
      'Allez dans Paramètres > Accessibilité, choisissez une couleur d’ambiance bien visible.',
      'Créez une tâche planifiée sans lui choisir de couleur (« Aucune couleur ») : dans le planning, sa case doit rester avec un fond neutre, pas teintée par la couleur d’ambiance.',
      'Cochez cette tâche dans le planning : son texte doit rester lisible (noir, barré), il ne doit pas devenir blanc sur fond clair.',
      'Créez une seconde tâche en lui choisissant une couleur : sa case doit être teintée avec cette couleur, et une fois cochée son texte passe en blanc barré sur le fond plein.',
    ],
  },
  {
    id: 'supprimer-une-categorie-de-liste',
    title: 'Supprimer une catégorie de liste',
    category: 'Outils : Listes',
    docRefs: [15],
    steps: [
      'Ouvrez une liste ayant au moins deux catégories.',
      'Sur l’écran des catégories, touchez la croix rouge à côté d’une catégorie : une confirmation « Supprimer « <nom> » ? » doit s’afficher, pas « Supprimer cette liste ».',
      'Touchez « Supprimer » : seule cette catégorie et ses éléments disparaissent, les autres catégories et le reste de la liste restent intacts.',
      'Recommencez sur une autre catégorie, mais touchez « Annuler » : la catégorie doit rester intacte.',
    ],
  },
  {
    id: 'ajouter-une-categorie-de-liste-sur-mobile',
    title: 'Ajouter une catégorie de liste sur mobile',
    category: 'Outils : Listes',
    docRefs: [16],
    steps: [
      'Sur un téléphone, ouvrez une liste puis touchez « Ajouter une catégorie ».',
      'Touchez le champ « Nom de la catégorie » pour ouvrir le clavier, puis saisissez un nom.',
      'Vérifiez que le champ et les boutons « Ajouter » et « Annuler » restent entièrement visibles et utilisables.',
      'Touchez « Ajouter » : la nouvelle catégorie doit apparaître dans la liste.',
    ],
  },
  {
    id: 'sous-taches-element-liste-dans-la-categorie',
    title: 'Sous-tâches d’un élément visibles dans la page de catégorie',
    category: 'Outils : Listes',
    docRefs: [33],
    steps: [
      'Ouvrez une liste, puis une catégorie contenant un élément auquel vous avez déjà ajouté des sous-tâches (sinon, ouvrez un élément, ajoutez-en deux, puis revenez à la catégorie).',
      'Sur la ligne de cet élément, un petit compteur « fait / total » suivi d’un chevron ▸ doit apparaître ; un élément sans sous-tâche n’affiche rien de tel.',
      'Touchez le compteur : la liste des sous-tâches se déplie sous l’élément, chacune avec une case à cocher, comme les sous-étapes d’une tâche du planning.',
      'Cochez une sous-tâche : son texte se barre et le compteur passe à jour ; décochez-la : le texte redevient normal.',
      'Touchez à nouveau le compteur (chevron ▾) : la liste des sous-tâches se replie.',
    ],
  },
  {
    id: 'detail-element-de-liste',
    title: 'Description et sous-tâches d’un élément de liste',
    category: 'Outils : Listes',
    steps: [
      'Ouvrez une liste, une catégorie, puis touchez le titre d’un élément (pas la coche ni les boutons à droite) : l’écran de détail de l’élément doit s’ouvrir.',
      'Saisissez une description, touchez en dehors du champ pour en sortir, puis rouvrez l’élément : la description doit être conservée.',
      'Ajoutez une sous-tâche : elle doit apparaître immédiatement dans la liste, toujours dépliée.',
      'Cochez puis décochez la sous-tâche : le texte doit se barrer puis redevenir normal.',
      'Supprimez la sous-tâche : elle doit disparaître.',
      'Touchez « ← Retour » : vous devez revenir à l’écran des éléments de la même catégorie que celle ouverte avant le détail.',
    ],
  },
  {
    id: 'consulter-et-modifier-l-energie',
    revision: 2,
    title: 'Modifier l’énergie depuis l’accueil',
    category: 'Énergie',
    docRefs: [17, 29],
    steps: [
      'Depuis l’accueil, touchez le badge énergie en haut à gauche : l’écran « Mon énergie maintenant » doit s’ouvrir directement.',
      'Choisissez une valeur puis touchez « Valider » : vous devez revenir directement à l’accueil.',
      'Rouvrez l’écran d’énergie, puis touchez « ← Retour » : vous devez revenir directement à l’accueil, sans passer par un écran intermédiaire « Mon énergie ».',
      'Rouvrez-le encore, touchez « Ignorer » : là aussi vous devez revenir directement à l’accueil, et le badge doit indiquer « Énergie ignorée ».',
      'Vérifiez qu’il n’existe plus aucun écran « Mon énergie » séparé (seul le check-in « Mon énergie maintenant » subsiste).',
    ],
  },
  {
    id: 'encadrement-et-glissement-du-planning',
    title: 'Encadrement et glissement animé du bandeau de dates',
    category: 'Accueil / Planning',
    steps: [
      'Allez dans Paramètres > Accessibilité, choisissez une couleur d’ambiance bien visible.',
      'Sur l’accueil ou le planning, vérifiez que le bandeau des jours est entouré d’un cadre de cette couleur.',
      'Posez le doigt sur le bandeau et glissez-le latéralement sans le relâcher : le bandeau doit suivre le doigt de façon fluide, sans saut brusque.',
      'Relâchez le doigt : le bandeau doit revenir à sa place avec une animation douce, en changeant de jour si le glissement était assez ample.',
    ],
  },
  {
    id: 'couleur-de-fond-par-outil',
    revision: 3,
    title: 'Couleur de fond par outil',
    category: 'Paramètres / Profil',
    docRefs: [2, 30, 31],
    steps: [
      'Allez dans Paramètres, puis touchez « Accessibilité ».',
      'Après « Couleur d’ambiance », repérez la section « Couleur des outils », puis choisissez une couleur pour un outil : le fond de sa carte doit se teinter aussitôt (fond adouci, pas la couleur brute).',
      'Revenez à l’accueil : dans la section « Outils », la carte de ce même outil doit maintenant afficher cette couleur de fond (avant, elle restait blanche).',
      'Quittez les Paramètres puis revenez : la couleur choisie doit être conservée.',
      'Touchez le bouton « × » à côté de la couleur : la carte de l’outil doit retrouver son fond neutre par défaut, sur l’écran Accessibilité comme sur l’accueil, et le bouton « × » doit disparaître.',
      'Dans la même section « Couleur des outils », vérifiez qu’une ligne « Mon compte » est présente, même si vous n’avez aucun autre outil personnalisable.',
      'Choisissez une couleur pour « Mon compte », revenez à l’accueil : la carte « Mon compte » (dans la grille sous le planning) doit afficher cette couleur de fond. Le bouton « × » doit la remettre par défaut.',
    ],
  },
  {
    id: 'menu-actions-tache-simplifie',
    revision: 2,
    title: 'Menu d’actions simplifié sur la fiche d’une tâche',
    category: 'Tâches',
    docRefs: [4, 5],
    steps: [
      'Ouvrez la fiche de détail d’une tâche (depuis Réception ou le planning).',
      'Vérifiez que seuls les boutons « Modifier », « Décomposer », « Dupliquer » et « Supprimer » sont affichés : « Tâche du jour », « Planifier », « Liste » et « Terminer » ne doivent plus apparaître.',
      'Pour terminer la tâche, cochez-la directement dans le planning.',
    ],
  },
  {
    id: 'plus-de-categorie-tache-du-jour',
    title: 'La catégorie « Tâche du jour » a disparu',
    category: 'Tâches',
    steps: [
      'Ouvrez « Réception » : sur chaque tâche de la liste, seuls les boutons « Planifier » et « Liste » doivent être proposés. Le bouton « Tâche du jour » ne doit plus exister.',
      'Ouvrez la fiche d’une tâche, puis « Décomposer » et « Modifier » : nulle part il ne doit être question de « Tâche du jour » ni d’une catégorie « Aujourd’hui » distincte du planning.',
      'Si vous aviez déjà des tâches rangées dans « Tâche du jour » avant la mise à jour, vérifiez qu’elles sont maintenant dans « Réception », sans date, prêtes à être re-triées.',
    ],
  },
  {
    id: 'ajouter-une-tache-depuis-la-reception',
    title: 'Ajouter une tâche depuis la Réception',
    category: 'Tâches',
    steps: [
      'Ouvrez « Réception » et touchez « Ajouter une tâche ».',
      'Un champ « Titre de la tâche » doit apparaître à la place du bouton, sans changement d’écran et sans aucun autre champ (pas d’heure, pas de durée, pas de destination).',
      'Saisissez un titre puis touchez « Valider » : le champ se referme et la tâche apparaît dans la liste de Réception.',
      'Sur cette nouvelle tâche, seuls les boutons « Planifier » et « Liste » doivent être proposés.',
      'Touchez de nouveau « Ajouter une tâche » puis « Annuler » : le champ se referme sans rien créer.',
    ],
  },
  {
    id: 'navigation-entre-tous-les-ecrans',
    title: 'Navigation fluide entre les écrans',
    category: 'Paramètres / Profil',
    steps: [
      'Depuis l’accueil, touchez successivement chaque icône du menu du bas (Réception, Ajouter une tâche, Accueil, Paramètres) : chaque écran doit s’afficher normalement, sans rester bloqué sur « Chargement... ».',
      'Dans la section « Outils », ouvrez successivement le Budget, une Liste existante et un dossier : chaque écran doit s’ouvrir normalement.',
      'Ouvrez le détail d’une tâche existante, puis touchez « Décomposer » : les deux écrans doivent s’afficher sans blocage.',
      'Si un écran reste bloqué sur « Chargement... » plus de quelques secondes, fermez complètement l’application puis rouvrez-la : l’écran doit alors s’afficher normalement.',
    ],
  },
]
