export type ToolType = 'liste' | 'tableau_comptage' | 'liste_comptage' | 'routine' | 'tableau_previsions'

export interface Tool {
  id: string
  type: ToolType
  folder_id: string | null
  list_id: string | null
  position: number
  created_at: string
  updated_at: string
}

export const IMPLEMENTED_TOOL_TYPES: ToolType[] = ['liste', 'tableau_comptage']

export const TOOL_TYPE_LABELS: Record<ToolType, string> = {
  liste: 'Liste',
  tableau_comptage: 'Tableau comptage',
  liste_comptage: 'Liste comptage',
  routine: 'Routine',
  tableau_previsions: 'Tableau prévisions',
}
