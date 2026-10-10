export type Rule = 'couleur' | 'forme'
export type Color = 'bleu' | 'orange'
export type Shape = 'cercle' | 'carre'

export interface Item {
  id: string
  color: Color
  shape: Shape
}

export const CATEGORIES: Record<Rule, readonly [string, string]> = {
  couleur: ['bleu', 'orange'],
  forme: ['cercle', 'carre'],
}

export const ITEM_COUNTS = [4, 6, 8, 10] as const

const COMBOS: ReadonlyArray<readonly [Color, Shape]> = [
  ['bleu', 'cercle'],
  ['bleu', 'carre'],
  ['orange', 'cercle'],
  ['orange', 'carre'],
]

export function categoryOf(item: Item, rule: Rule): string {
  return rule === 'couleur' ? item.color : item.shape
}

export function isCorrectPlacement(item: Item, bin: string, rule: Rule): boolean {
  return categoryOf(item, rule) === bin
}

export function generateItems(count: number, rng: () => number = Math.random): Item[] {
  const items: Item[] = Array.from({ length: count }, (_, i) => {
    const [color, shape] = COMBOS[i % COMBOS.length]
    return { id: `item-${i}`, color, shape }
  })
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
