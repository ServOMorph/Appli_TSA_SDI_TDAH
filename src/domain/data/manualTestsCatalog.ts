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
      'Sur téléphone, ouvrez une liste puis ajoutez un élément. Quand le clavier s’ouvre, tous les champs et boutons doivent rester visibles et utilisables.',
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
]
