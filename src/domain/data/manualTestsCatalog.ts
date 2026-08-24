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
  title: string
  category: ManualTestCategory
  steps: string[]
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
    title: 'Utiliser le budget',
    category: 'Outils : Budget',
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget ». Si aucun revenu n’a encore été saisi, seul le bouton « Configurer le budget » doit être visible : touchez-le, saisissez un montant, puis touchez « Enregistrer ».',
      'Si un revenu existe déjà, touchez « Modifier le budget » sur la carte « Montant total », puis « Ajouter un revenu », saisissez un montant, puis touchez « Enregistrer » : le montant total et le détail « ... de revenus » doivent augmenter.',
      'Touchez le bloc « Mon compte » sous « Montant total » : vous devez arriver sur un écran affichant « Semaine » et « Mois » côte à côte, chacune avec ses sous-catégories (montant prévu et restant, avec une jauge).',
      'Touchez les flèches ← et → sous « Semaine » : la période affichée doit changer sans modifier celle affichée sous « Mois ».',
      'Touchez une sous-catégorie pour ouvrir sa fiche détaillée.',
      'Revenez en arrière, touchez « Ajouter une dépense », remplissez le formulaire puis enregistrez : le montant dépensé de la catégorie doit augmenter.',
      'Revenez au Budget avec la flèche ←, puis touchez le bloc « Mes livrets » : le détail « ... mon compte » sur la carte « Montant total » doit être apparu ou avoir augmenté, et l’écran « Mes livrets » doit afficher la liste des livrets ou une proposition de configuration si aucun n’existe.',
      'Touchez un livret : vous devez arriver sur sa fiche détaillée avec son solde et la liste de ses mouvements.',
      'Touchez « Ajouter un mouvement », remplissez montant/motif/date puis enregistrez : le mouvement doit apparaître dans la liste et le solde du livret doit se mettre à jour.',
    ],
  },
  {
    id: 'modifier-et-supprimer-un-revenu-du-montant-total',
    title: 'Modifier et supprimer un revenu du Montant total',
    category: 'Outils : Budget',
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
    id: 'glisser-pour-ouvrir-le-planning',
    title: 'Ouvrir le planning en glissant',
    category: 'Accueil / Planning',
    steps: [
      'Sur l’accueil, sous le bandeau des jours de la semaine et du mois en cours, repérez le petit trait gris horizontal.',
      'Posez le doigt dessus et glissez lentement vers le bas sans relâcher : la fenêtre du planning doit s’agrandir progressivement en suivant le doigt, pendant que la section « Outils » et le reste de l’accueil restent visibles en dessous.',
      'Relâchez le doigt : le planning doit rester à la taille atteinte, agrandie ou repliée selon jusqu’où vous avez glissé.',
      'Posez ensuite le doigt sur ce même trait et glissez fermement vers le haut, puis relâchez : le planning doit se refermer à sa taille minimale.',
      'Vérifiez aussi qu’un simple appui (sans glisser) sur ce trait bascule directement entre planning replié et déplié.',
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
    id: 'couleur-tache-sans-couleur-choisie',
    title: 'Couleur d’une tâche sans couleur choisie',
    category: 'Tâches',
    steps: [
      'Allez dans Paramètres > Accessibilité, choisissez une couleur d’ambiance bien visible.',
      'Créez une tâche planifiée sans lui choisir de couleur (« Aucune couleur ») : dans le planning, sa case doit rester avec un fond neutre, pas teintée par la couleur d’ambiance.',
      'Créez une seconde tâche en lui choisissant une couleur : sa case dans le planning doit être teintée avec cette couleur.',
    ],
  },
  {
    id: 'supprimer-une-categorie-de-liste',
    title: 'Supprimer une catégorie de liste',
    category: 'Outils : Listes',
    steps: [
      'Ouvrez une liste ayant au moins deux catégories.',
      'Sur l’écran des catégories, touchez la croix rouge à côté d’une catégorie : une confirmation « Supprimer « <nom> » ? » doit s’afficher, pas « Supprimer cette liste ».',
      'Touchez « Supprimer » : seule cette catégorie et ses éléments disparaissent, les autres catégories et le reste de la liste restent intacts.',
      'Recommencez sur une autre catégorie, mais touchez « Annuler » : la catégorie doit rester intacte.',
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
    id: 'acceder-directement-a-l-energie',
    title: 'Accéder directement à la modification de l’énergie',
    category: 'Énergie',
    steps: [
      'Depuis l’accueil, touchez le badge énergie en haut à gauche : l’écran pour choisir votre énergie du jour doit s’ouvrir directement, sans écran de consultation intermédiaire.',
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
    title: 'Couleur de fond par outil',
    category: 'Outils : autres',
    steps: [
      'Depuis les Outils (ou un dossier), repérez le libellé « Couleur » sur la carte d’un outil, touchez son sélecteur et choisissez une couleur : le fond de la carte doit se teinter aussitôt (fond adouci, pas la couleur brute).',
      'Quittez cet écran puis revenez : la couleur choisie doit être conservée.',
      'Touchez le bouton « × » à côté du sélecteur : la carte doit retrouver son fond neutre par défaut, et le bouton « × » doit disparaître.',
      'Vérifiez que toucher le sélecteur de couleur n’ouvre pas l’outil : seul le titre ouvre l’outil.',
    ],
  },
]
