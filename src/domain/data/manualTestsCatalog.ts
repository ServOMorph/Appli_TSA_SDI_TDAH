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

// Catalogue vidé le 2026-09-13 (décision explicite de l'utilisateur) : les 46 tests précédents
// sont sauvegardés dans Archives/manualTestsCatalog_backup_2026-09-13.md.
export const manualTestsCatalog: ManualTest[] = []
