import { describe, expect, it } from 'vitest'
import { addStroke, clampPoint, clearStrokes, simplifyStroke, undoStroke } from '@/domain/rules/annotationStrokes'

describe('annotationStrokes', () => {
  it('borne les points aux limites de l’image', () => {
    expect(clampPoint({ x: -2, y: 4 })).toEqual({ x: 0, y: 1 })
  })

  it('préserve les extrémités et écarte les points trop rapprochés', () => {
    expect(simplifyStroke([{ x: 0, y: 0 }, { x: 0.001, y: 0.001 }, { x: 0.1, y: 0.1 }])).toEqual([
      { x: 0, y: 0 },
      { x: 0.1, y: 0.1 },
    ])
  })

  it('ajoute un trait, annule le dernier et efface sans muter', () => {
    const strokes = addStroke([], [{ x: 0, y: 0 }, { x: 0.2, y: 0.2 }])
    expect(strokes).toHaveLength(1)
    expect(undoStroke(strokes)).toEqual([])
    expect(clearStrokes()).toEqual([])
    expect(strokes).toHaveLength(1)
  })
})
