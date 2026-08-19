export interface ManualTest {
  id: string
  title: string
  description: string
}

export const manualTestsCatalog: ManualTest[] = [
  {
    id: 'creer-une-liste',
    title: 'Créer une liste',
    description:
      'Depuis l’accueil, choisissez « Ajouter un outil ». Vous devez pouvoir créer une nouvelle liste, sans voir de proposition pour créer un dossier. Vérifiez la même chose avec le bouton « + » dans un dossier déjà présent.',
  },
  {
    id: 'supprimer-une-liste',
    title: 'Supprimer une liste',
    description:
      'Ouvrez une liste, touchez le bouton de suppression, puis confirmez. La liste doit disparaître et vous revenez aux outils. Essayez aussi d’annuler : la liste doit rester là.',
  },
  {
    id: 'retirer-de-l-argent-d-un-livret',
    title: 'Retirer de l’argent d’un livret',
    description:
      'Dans le budget, ajoutez un mouvement sur un livret qui contient de l’argent. Choisissez « Retrait » et un montant inférieur au solde : le solde doit diminuer. Un montant trop grand ne doit pas pouvoir être enregistré.',
  },
  {
    id: 'ajouter-un-element-a-une-liste',
    title: 'Ajouter un élément à une liste sur téléphone',
    description:
      'Sur téléphone, ouvrez une liste, choisissez une catégorie, puis ajoutez un élément. Quand le clavier s’ouvre, tous les champs et boutons doivent rester visibles et utilisables.',
  },
  {
    id: 'categories-de-liste',
    title: 'Choisir et créer des catégories dans une liste',
    description:
      'Ouvrez une liste : vous devez d’abord voir ses catégories (avec le nombre d’éléments dans chacune), pas les éléments directement. Touchez une catégorie pour voir ses éléments. Depuis l’écran des catégories, touchez « Ajouter une catégorie », donnez-lui un nom, puis vérifiez qu’elle apparaît dans la liste.',
  },
  {
    id: 'importer-une-sauvegarde',
    title: 'Importer une sauvegarde',
    description:
      'Dans Paramètres, ouvrez « Export et import », choisissez un fichier de sauvegarde JSON puis confirmez. Attention : cela remplace les données présentes sur l’appareil. Vérifiez ensuite que vos listes, tâches, budget et énergie sont bien revenus.',
  },
  {
    id: 'utiliser-le-budget',
    title: 'Utiliser le budget',
    description:
      'Ouvrez le budget. Vérifiez que vous pouvez choisir la semaine ou le mois, consulter une catégorie, ajouter une dépense et accéder à vos livrets depuis le même écran.',
  },
  {
    id: 'enregistrer-un-resultat-de-test',
    title: 'Enregistrer un résultat de test',
    description:
      'Dans « Tests à faire », ouvrez un test. Choisissez « Non validé », expliquez ce qui ne fonctionne pas puis enregistrez. Vérifiez que ce résultat apparaît dans l’historique. Exportez ensuite vos données dans Paramètres, puis réimportez ce fichier : le résultat doit toujours être présent.',
  },
  {
    id: 'glisser-pour-ouvrir-le-planning',
    title: 'Ouvrir le planning en glissant',
    description:
      'Sur l’accueil, vous devez voir les jours de la semaine et le mois en cours, avec en dessous un petit trait gris. Glissez ce trait vers le bas avec le doigt : le planning doit s’agrandir. Glissez-le à nouveau vers le haut : le planning doit se refermer et revenir à l’accueil normal.',
  },
  {
    id: 'couleur-tache-sans-couleur-choisie',
    title: 'Couleur d’une tâche sans couleur choisie',
    description:
      'Choisissez une couleur d’ambiance bien visible dans Paramètres. Créez une tâche planifiée sans lui choisir de couleur : sa case dans le planning doit rester neutre. Créez-en une autre avec une couleur choisie : sa case doit être teintée avec cette couleur.',
  },
  {
    id: 'supprimer-une-categorie-de-liste',
    title: 'Supprimer une catégorie de liste',
    description:
      'Ouvrez une liste ayant au moins deux catégories. Touchez la croix rouge à côté d’une catégorie et confirmez : seule cette catégorie doit disparaître, le reste de la liste doit rester intact.',
  },
  {
    id: 'acceder-directement-a-l-energie',
    title: 'Accéder directement à la modification de l’énergie',
    description:
      'Depuis l’accueil, touchez le badge énergie en haut à gauche : l’écran pour choisir votre énergie doit s’ouvrir directement, sans écran intermédiaire.',
  },
  {
    id: 'menu-tache-simplifie',
    title: 'Menu d’actions d’une tâche',
    description:
      'Ouvrez le détail d’une tâche : le menu doit proposer « Modifier », « Décomposer », « Dupliquer » et « Supprimer ». Touchez « Modifier » : le titre doit s’ouvrir en édition directe.',
  },
  {
    id: 'hauteur-case-planning',
    title: 'Hauteur de case selon la durée',
    description:
      'Planifiez une tâche de 30 minutes et une tâche de 2h. Dans le planning, la case de la tâche de 2h doit être visiblement plus haute que celle de 30 minutes.',
  },
  {
    id: 'detail-element-de-liste',
    title: 'Description et sous-tâches d’un élément de liste',
    description:
      'Ouvrez une liste, une catégorie, puis touchez le titre d’un élément (pas la coche ni la croix) : l’écran de détail doit s’ouvrir. Ajoutez une description et une sous-tâche, cochez-la, puis revenez en arrière : tout doit être conservé.',
  },
  {
    id: 'couleur-de-fond-par-outil',
    title: 'Couleur de fond par outil',
    description:
      'Sur la carte d’un outil (dans les outils ou un dossier), touchez le sélecteur de couleur et choisissez une couleur : le fond de la carte doit se teinter aussitôt. Touchez le « × » à côté : la carte doit retrouver son fond neutre.',
  },
]
