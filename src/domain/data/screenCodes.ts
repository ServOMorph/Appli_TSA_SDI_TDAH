import type { Route } from '@/app/navigation'

export type ScreenCode = {
  code: string
  label: string
}

export const SCREEN_CODES: Record<Route['name'], ScreenCode> = {
  welcome: { code: 'E01', label: 'Bienvenue' },
  profile: { code: 'E02', label: 'Profil initial' },
  energy: { code: 'E03', label: 'Énergie initiale' },
  dashboard: { code: 'E10', label: 'Accueil' },
  planning: { code: 'E12', label: 'Planning de la semaine' },
  inbox: { code: 'E20', label: 'Boîte de réception' },
  'task-create-v2': { code: 'E21', label: 'Créer une tâche' },
  'task-detail': { code: 'E22', label: 'Détail de tâche' },
  'task-decompose': { code: 'E23', label: 'Découper une tâche' },
  'energy-checkin': { code: 'E31', label: 'État d’énergie' },
  'overload-recovery': { code: 'E90', label: 'Récupération après surcharge' },
  resources: { code: 'E120', label: 'Ressources' },
  'manual-tests': { code: 'E121', label: 'Tests à faire' },
  feedback: { code: 'E122', label: 'Nouveau retour' },
  'feedback-list': { code: 'E123', label: 'Mes retours' },
  settings: { code: 'E110', label: 'Paramètres' },
  'settings-profile': { code: 'E111', label: 'Profil' },
  'settings-accessibility': { code: 'E112', label: 'Accessibilité' },
  'settings-privacy': { code: 'E116', label: 'Vie privée' },
  'settings-export': { code: 'E117', label: 'Exporter les données' },
  'list-detail': { code: 'E61', label: 'Liste' },
  'list-item-detail': { code: 'E62', label: 'Élément de liste' },
  tools: { code: 'E70', label: 'Outils' },
  'folder-detail': { code: 'E72', label: 'Dossier' },
  budget: { code: 'E71', label: 'Budget' },
  'budget-category-detail': { code: 'E73', label: 'Catégorie de budget' },
  'budget-settings': { code: 'E74', label: 'Paramètres du budget' },
  'budget-account': { code: 'E75', label: 'Compte du budget' },
  'budget-livrets': { code: 'E76', label: 'Livrets' },
  'budget-livret-detail': { code: 'E77', label: 'Détail du livret' },
  'budget-previsions': { code: 'E78', label: 'Prévisions du budget' },
}

export function getScreenCode(route: Route): ScreenCode {
  return SCREEN_CODES[route.name]
}
