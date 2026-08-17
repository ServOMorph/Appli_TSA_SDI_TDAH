export interface ManualTest {
  id: string
  title: string
  steps: string[]
}

// Template à suivre pour chaque nouveau test :
// {
//   id: 'identifiant-en-kebab-case',
//   title: 'Titre court à l’impératif',
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
    steps: [
      'Ouvrez une liste, touchez le bouton « × » en haut à droite de l’écran.',
      'Dans la boîte de dialogue « Supprimer cette liste ? », touchez « Supprimer » : vous devez revenir à l’écran des outils et la liste ne doit plus y apparaître.',
      'Recommencez la manipulation sur une autre liste, mais touchez cette fois « Annuler » : la liste doit rester présente et inchangée.',
    ],
  },
  {
    id: 'retirer-de-l-argent-d-un-livret',
    title: 'Retirer de l’argent d’un livret',
    steps: [
      'Dans le Budget, touchez l’icône ⚙ en haut à droite pour ouvrir « Configurer le budget ».',
      'Touchez « Ajouter un mouvement ».',
      'Choisissez un livret qui contient déjà de l’argent, sélectionnez « Retrait » dans le champ Type, saisissez un montant inférieur au solde affiché, puis touchez « Enregistrer » : le solde du livret doit diminuer de ce montant.',
      'Recommencez avec un montant supérieur au solde : un message d’erreur doit s’afficher et le bouton « Enregistrer » doit rester désactivé.',
    ],
  },
  {
    id: 'ajouter-un-element-a-une-liste',
    title: 'Ajouter un élément à une liste sur téléphone',
    steps: [
      'Sur téléphone, ouvrez une liste, touchez une catégorie, puis touchez « Ajouter un élément ».',
      'Touchez le champ « Élément » pour faire apparaître le clavier du téléphone : le champ de saisie et les boutons « Ajouter » et « Annuler » doivent rester visibles et utilisables sans avoir à fermer le clavier au préalable.',
    ],
  },
  {
    id: 'categories-de-liste',
    title: 'Choisir et créer des catégories dans une liste',
    steps: [
      'Ouvrez une liste : l’écran doit d’abord afficher ses catégories, chacune avec son nom et le nombre d’éléments qu’elle contient, jamais les éléments directement.',
      'Touchez une catégorie : seuls ses éléments doivent s’afficher.',
      'Revenez en arrière avec la flèche ← en haut à gauche, touchez « Ajouter une catégorie », saisissez un nom, touchez « Ajouter » : la nouvelle catégorie doit apparaître dans la liste des catégories avec 0 élément.',
    ],
  },
  {
    id: 'importer-une-sauvegarde',
    title: 'Importer une sauvegarde',
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
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget ».',
      'Sur la carte « Montant total » en haut de l’écran, touchez « Ajouter un revenu », saisissez un montant, puis touchez « Enregistrer » : le montant total et le détail « ... de revenus » doivent augmenter.',
      'Touchez l’onglet « Semaine » puis l’onglet « Mois » : le montant « Il me reste » et la jauge en dessous doivent changer.',
      'Touchez une catégorie de dépense pour ouvrir sa fiche détaillée.',
      'Revenez en arrière, touchez « Ajouter une dépense », remplissez le formulaire puis enregistrez : le montant dépensé de la catégorie doit augmenter, et le détail « ... mon compte » sur la carte « Montant total » doit apparaître ou augmenter.',
      'Touchez enfin le bloc « Mes livrets » : vous devez arriver sur l’écran de configuration du budget.',
    ],
  },
  {
    id: 'enregistrer-un-resultat-de-test',
    title: 'Enregistrer un résultat de test',
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
    steps: [
      'Depuis l’accueil, ouvrez « Outils » puis touchez la carte « Budget ».',
      'Sur la carte « Montant total » en haut de l’écran, vérifiez qu’elle affiche un montant et le détail « ... de revenus · ... livrets · ... mon compte ».',
      'Touchez l’icône ⚙ pour ouvrir « Configurer le budget » et vérifiez que les anciennes catégories Mcdo, Maman, Livret jeune et APL n’apparaissent plus dans la liste des catégories.',
      'Revenez au Budget, touchez « Ajouter un revenu », saisissez un montant et un libellé, enregistrez : ce revenu doit s’ajouter au « ... de revenus » affiché sur la carte « Montant total ».',
    ],
  },
  {
    id: 'naviguer-dans-le-planning',
    title: 'Naviguer dans le planning de l’accueil',
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
    steps: [
      'Allez dans Paramètres, touchez « Accessibilité ».',
      'Touchez le sélecteur « Couleur d’ambiance » et choisissez une couleur différente de celle actuelle.',
      'Revenez à l’accueil : le fond du badge d’énergie en haut de l’écran doit être teinté avec cette nouvelle couleur, et n’afficher que l’icône batterie suivie des chiffres, sans les mots « planifié » ni « dispo ».',
    ],
  },
]
