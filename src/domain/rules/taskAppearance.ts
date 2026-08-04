export interface TaskIconDef {
  id: string
  label: string
}

/** Bibliothèque d'icônes restreinte pour les tâches (E4) — liste fixe, pas d'ajout libre. */
export const TASK_ICONS: TaskIconDef[] = [
  { id: 'home', label: 'Maison' },
  { id: 'work', label: 'Travail' },
  { id: 'health', label: 'Santé' },
  { id: 'shopping', label: 'Courses' },
  { id: 'social', label: 'Social' },
  { id: 'sport', label: 'Sport' },
  { id: 'meal', label: 'Repas' },
  { id: 'sleep', label: 'Sommeil' },
  { id: 'study', label: 'Étude' },
  { id: 'money', label: 'Argent' },
  { id: 'transport', label: 'Transport' },
  { id: 'cleaning', label: 'Ménage' },
  { id: 'pet', label: 'Animal' },
  { id: 'hobby', label: 'Loisir' },
  { id: 'other', label: 'Autre' },
]

export function isValidTaskIcon(id: string): boolean {
  return TASK_ICONS.some((icon) => icon.id === id)
}
