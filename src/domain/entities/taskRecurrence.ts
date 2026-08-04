export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type RecurrenceEndType = 'never' | 'date' | 'count'

export interface TaskRecurrence {
  id: string
  frequency: RecurrenceFrequency
  /** Répétition tous les N jours/semaines/mois/ans. */
  interval: number
  /** Jours de semaine (0 = dimanche ... 6 = samedi), uniquement pour `frequency: 'weekly'`. */
  weekdays: number[] | null
  end_type: RecurrenceEndType
  end_date: string | null
  end_count: number | null
  created_at: string
  updated_at: string
}
