export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function formatPlanningDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Date compacte au format français jj/mm/aaaa (ex. affichage d'un champ de fiche). */
export function formatFrenchDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR')
}

/** Mois et année en toutes lettres, capitalisés (ex. « Août 2026 »), pour un repère permanent. */
export function formatMonthYear(date: string): string {
  const label = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export interface DayBadge {
  weekday: string
  day: number
}

/** Étiquette compacte d'un jour pour le bandeau de dates (ex. « lun », 4). */
export function formatDayBadge(date: string): DayBadge {
  const d = new Date(date + 'T12:00:00')
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
  return { weekday, day: d.getDate() }
}

/** Fenêtre de dates centrée sur `center`, `radius` jours de part et d'autre. */
export function dateStrip(center: string, radius: number): string[] {
  const days: string[] = []
  for (let i = -radius; i <= radius; i++) days.push(addDays(center, i))
  return days
}

/** Les 7 dates de la semaine (lundi → dimanche) contenant `date`. */
export function weekStrip(date: string): string[] {
  const d = new Date(date + 'T12:00:00')
  const mondayOffset = (d.getDay() + 6) % 7
  const monday = addDays(date, -mondayOffset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}
