import { describe, expect, it } from 'vitest'
import { DAY_COUNT, LEVELS, generatePuzzle, hint, solve, validate, type Placement, type Puzzle } from './logic'

function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8]

describe('generatePuzzle', () => {
  it.each(LEVELS)('%s : la solution fournie est valide', (level) => {
    for (const seed of SEEDS) {
      const puzzle = generatePuzzle(level, seeded(seed))
      expect(validate(puzzle, puzzle.solution).complete).toBe(true)
    }
  })

  it.each(LEVELS)('%s : identifiants uniques et capacités minimales respectées', (level) => {
    const puzzle = generatePuzzle(level, seeded(42))
    expect(new Set(puzzle.tasks.map((t) => t.id)).size).toBe(puzzle.tasks.length)
    expect(puzzle.capacities).toHaveLength(DAY_COUNT)
    expect(Math.min(...puzzle.capacities)).toBeGreaterThanOrEqual(3)
  })

  it('le niveau difficile contient des dépendances', () => {
    const puzzle = generatePuzzle('difficile', seeded(7))
    expect(puzzle.tasks.some((t) => t.after !== null)).toBe(true)
  })
})

describe('solve', () => {
  it.each(LEVELS)('%s : trouve une solution valide', (level) => {
    for (const seed of SEEDS) {
      const puzzle = generatePuzzle(level, seeded(seed))
      const result = solve(puzzle)
      expect(result).not.toBeNull()
      expect(result).not.toBe('unknown')
      expect(validate(puzzle, result as Placement).complete).toBe(true)
    }
  })

  it('respecte les placements déjà posés', () => {
    const puzzle = generatePuzzle('moyen', seeded(3))
    const first = puzzle.tasks[0]
    const fixed: Placement = { [first.id]: puzzle.solution[first.id] }
    const result = solve(puzzle, fixed) as Placement
    expect(result[first.id]).toBe(puzzle.solution[first.id])
  })

  it('signale une impasse quand un placement dépasse la capacité', () => {
    const puzzle: Puzzle = {
      level: 'facile',
      capacities: [3, 3, 3, 3, 3],
      tasks: [
        { id: 'a', name: 'A', cost: 3, deadline: null, after: null },
        { id: 'b', name: 'B', cost: 3, deadline: null, after: null },
      ],
      solution: { a: 0, b: 1 },
    }
    expect(solve(puzzle, { a: 0, b: 0 })).toBeNull()
  })
})

describe('validate', () => {
  const puzzle: Puzzle = {
    level: 'moyen',
    capacities: [4, 4, 4, 4, 4],
    tasks: [
      { id: 'a', name: 'A', cost: 3, deadline: 0, after: null },
      { id: 'b', name: 'B', cost: 3, deadline: null, after: 'a' },
    ],
    solution: { a: 0, b: 1 },
  }

  it('détecte dépassement de capacité', () => {
    const v = validate(puzzle, { a: 1, b: 1 })
    expect(v.excess[1]).toBe(2)
    expect(v.complete).toBe(false)
  })

  it('détecte une échéance dépassée', () => {
    expect(validate(puzzle, { a: 1, b: 2 }).deadlineMissed.has('a')).toBe(true)
  })

  it("détecte un ordre non respecté", () => {
    expect(validate(puzzle, { a: 0, b: 0 }).orderBroken.has('b')).toBe(true)
  })

  it('liste les tâches non placées', () => {
    expect(validate(puzzle, { a: 0, b: null }).unplaced).toEqual(['b'])
  })

  it('accepte la solution', () => {
    expect(validate(puzzle, { a: 0, b: 1 }).complete).toBe(true)
  })
})

describe('hint', () => {
  it('propose un placement compatible avec une solution', () => {
    const puzzle = generatePuzzle('moyen', seeded(5))
    const h = hint(puzzle, {})
    expect(h.kind).toBe('place')
    if (h.kind === 'place') {
      const placement: Placement = { [h.taskId]: h.day }
      expect(solve(puzzle, placement)).not.toBeNull()
    }
  })

  it('signale une impasse', () => {
    const puzzle: Puzzle = {
      level: 'facile',
      capacities: [3, 3, 3, 3, 3],
      tasks: [
        { id: 'a', name: 'A', cost: 3, deadline: null, after: null },
        { id: 'b', name: 'B', cost: 3, deadline: null, after: null },
      ],
      solution: { a: 0, b: 1 },
    }
    expect(hint(puzzle, { a: 0, b: 0 })).toEqual({ kind: 'impasse' })
  })
})
