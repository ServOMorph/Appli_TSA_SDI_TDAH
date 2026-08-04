/**
 * Marque qu'une occurrence d'une série récurrente ne doit pas être (re)matérialisée
 * à cette date : occurrence annulée, ou détachée en tâche indépendante après une
 * édition "cette occurrence".
 */
export interface TaskException {
  id: string
  recurrence_id: string
  occurrence_date: string
  created_at: string
}
