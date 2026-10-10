export type Level = 'facile' | 'moyen' | 'difficile'

export const LEVELS: readonly Level[] = ['facile', 'moyen', 'difficile']
export const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const
export const DAY_COUNT = DAY_LABELS.length

export interface PlanTask {
  id: string
  name: string
  cost: number
  deadline: number | null
  after: string | null
}

export type Placement = Record<string, number | null>

export interface Puzzle {
  level: Level
  capacities: number[]
  tasks: PlanTask[]
  solution: Placement
}

interface LevelConfig {
  taskCount: number
  maxCost: number
  slackMax: number
  deadlineRate: number
  deadlineSlack: number
  depCount: number
}

const CONFIG: Record<Level, LevelConfig> = {
  facile: { taskCount: 6, maxCost: 4, slackMax: 3, deadlineRate: 0.5, deadlineSlack: 2, depCount: 0 },
  moyen: { taskCount: 8, maxCost: 5, slackMax: 2, deadlineRate: 0.6, deadlineSlack: 1, depCount: 2 },
  difficile: { taskCount: 11, maxCost: 6, slackMax: 1, deadlineRate: 0.7, deadlineSlack: 1, depCount: 4 },
}

const MIN_CAPACITY = 3

const TASK_NAMES = [
  'Lessive',
  'Courses',
  'Appel banque',
  'Rapport',
  'Ménage',
  'Rendez-vous médecin',
  'Facture',
  'Sport',
  'Préparer les repas',
  'Réunion',
  'Colis à poster',
  'Mails en retard',
  'Réviser',
  'Ranger le bureau',
]

function randInt(rng: () => number, n: number): number {
  return Math.floor(rng() * n)
}

function shuffle<T>(list: readonly T[], rng: () => number): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function generatePuzzle(level: Level, rng: () => number = Math.random): Puzzle {
  const cfg = CONFIG[level]
  const names = shuffle(TASK_NAMES, rng).slice(0, cfg.taskCount)
  const dayOf = names.map(() => randInt(rng, DAY_COUNT))
  const costs = names.map(() => 1 + randInt(rng, cfg.maxCost))

  const load = new Array<number>(DAY_COUNT).fill(0)
  dayOf.forEach((d, i) => {
    load[d] += costs[i]
  })
  const capacities = load.map((l) => Math.max(l + randInt(rng, cfg.slackMax + 1), MIN_CAPACITY))

  const tasks: PlanTask[] = names.map((name, i) => ({
    id: `t${i}`,
    name,
    cost: costs[i],
    deadline: rng() < cfg.deadlineRate ? Math.min(DAY_COUNT - 1, dayOf[i] + randInt(rng, cfg.deadlineSlack + 1)) : null,
    after: null,
  }))

  const pairs: Array<[number, number]> = []
  for (let a = 0; a < tasks.length; a++) {
    for (let b = 0; b < tasks.length; b++) {
      if (dayOf[a] < dayOf[b]) pairs.push([a, b])
    }
  }
  const usedAsDependent = new Set<number>()
  for (const [a, b] of shuffle(pairs, rng)) {
    if (usedAsDependent.size >= cfg.depCount) break
    if (usedAsDependent.has(b)) continue
    tasks[b].after = tasks[a].id
    usedAsDependent.add(b)
  }

  const solution: Placement = {}
  tasks.forEach((t, i) => {
    solution[t.id] = dayOf[i]
  })
  return { level, capacities, tasks, solution }
}

export interface Validation {
  loads: number[]
  excess: number[]
  deadlineMissed: Set<string>
  orderBroken: Set<string>
  unplaced: string[]
  complete: boolean
}

export function validate(puzzle: Puzzle, placement: Placement): Validation {
  const loads = new Array<number>(DAY_COUNT).fill(0)
  const deadlineMissed = new Set<string>()
  const orderBroken = new Set<string>()
  const unplaced: string[] = []

  for (const task of puzzle.tasks) {
    const day = placement[task.id] ?? null
    if (day === null) {
      unplaced.push(task.id)
      continue
    }
    loads[day] += task.cost
    if (task.deadline !== null && day > task.deadline) deadlineMissed.add(task.id)
    if (task.after !== null) {
      const prereqDay = placement[task.after] ?? null
      if (prereqDay !== null && prereqDay >= day) orderBroken.add(task.id)
    }
  }
  const excess = loads.map((l, d) => Math.max(0, l - puzzle.capacities[d]))
  const complete =
    unplaced.length === 0 && deadlineMissed.size === 0 && orderBroken.size === 0 && excess.every((e) => e === 0)
  return { loads, excess, deadlineMissed, orderBroken, unplaced, complete }
}

function fits(puzzle: Puzzle, task: PlanTask, day: number, assignment: Placement, loads: number[]): boolean {
  if (loads[day] + task.cost > puzzle.capacities[day]) return false
  if (task.deadline !== null && day > task.deadline) return false
  if (task.after !== null) {
    const prereqDay = assignment[task.after] ?? null
    if (prereqDay !== null && prereqDay >= day) return false
  }
  for (const other of puzzle.tasks) {
    if (other.after !== task.id) continue
    const otherDay = assignment[other.id] ?? null
    if (otherDay !== null && day >= otherDay) return false
  }
  return true
}

/** Résout à partir des placements déjà posés. `null` : impasse ; `'unknown'` : limite de calcul atteinte. */
export function solve(puzzle: Puzzle, fixed: Placement = {}, nodeLimit = 400000): Placement | null | 'unknown' {
  const assignment: Placement = {}
  const loads = new Array<number>(DAY_COUNT).fill(0)
  const free: PlanTask[] = []

  for (const task of puzzle.tasks) {
    const day = fixed[task.id] ?? null
    if (day === null) {
      free.push(task)
      continue
    }
    if (!fits(puzzle, task, day, assignment, loads)) return null
    assignment[task.id] = day
    loads[day] += task.cost
  }

  free.sort((a, b) => {
    const constraintA = (a.deadline ?? DAY_COUNT) - (a.after ? 0.5 : 0)
    const constraintB = (b.deadline ?? DAY_COUNT) - (b.after ? 0.5 : 0)
    return b.cost - a.cost || constraintA - constraintB
  })

  let nodes = 0
  let aborted = false

  function search(index: number): boolean {
    if (index === free.length) return true
    const task = free[index]
    for (let day = 0; day < DAY_COUNT; day++) {
      if (++nodes > nodeLimit) {
        aborted = true
        return false
      }
      if (!fits(puzzle, task, day, assignment, loads)) continue
      assignment[task.id] = day
      loads[day] += task.cost
      if (search(index + 1)) return true
      loads[day] -= task.cost
      delete assignment[task.id]
      if (aborted) return false
    }
    return false
  }

  if (search(0)) return { ...assignment }
  return aborted ? 'unknown' : null
}

export type Hint = { kind: 'place'; taskId: string; day: number } | { kind: 'impasse' } | { kind: 'unknown' }

export function hint(puzzle: Puzzle, placement: Placement): Hint {
  const result = solve(puzzle, placement)
  if (result === 'unknown') return { kind: 'unknown' }
  if (result === null) return { kind: 'impasse' }
  const target = puzzle.tasks
    .filter((t) => (placement[t.id] ?? null) === null)
    .sort((a, b) => (a.deadline ?? DAY_COUNT) - (b.deadline ?? DAY_COUNT) || b.cost - a.cost)[0]
  if (!target) return { kind: 'unknown' }
  return { kind: 'place', taskId: target.id, day: result[target.id] as number }
}
