import { describe, expect, it } from 'vitest'
import { CATEGORIES, categoryOf, generateItems, isCorrectPlacement, ITEM_COUNTS, type Rule } from './logic'

describe('generateItems', () => {
  it.each(ITEM_COUNTS)('produit %i éléments aux identifiants uniques', (count) => {
    const items = generateItems(count)
    expect(items).toHaveLength(count)
    expect(new Set(items.map((i) => i.id)).size).toBe(count)
  })

  it.each(ITEM_COUNTS)('remplit les deux catégories pour chaque règle (%i éléments)', (count) => {
    const items = generateItems(count)
    for (const rule of ['couleur', 'forme'] as Rule[]) {
      for (const bin of CATEGORIES[rule]) {
        expect(items.some((i) => categoryOf(i, rule) === bin)).toBe(true)
      }
    }
  })

  it('est déterministe pour un générateur donné', () => {
    const rng = () => 0.5
    expect(generateItems(8, rng)).toEqual(generateItems(8, rng))
  })
})

describe('isCorrectPlacement', () => {
  it('valide uniquement la catégorie de la règle active', () => {
    const item = { id: 'a', color: 'bleu', shape: 'carre' } as const
    expect(isCorrectPlacement(item, 'bleu', 'couleur')).toBe(true)
    expect(isCorrectPlacement(item, 'orange', 'couleur')).toBe(false)
    expect(isCorrectPlacement(item, 'carre', 'forme')).toBe(true)
    expect(isCorrectPlacement(item, 'cercle', 'forme')).toBe(false)
    expect(isCorrectPlacement(item, 'bleu', 'forme')).toBe(false)
  })
})
