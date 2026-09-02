import { describe, it, expect } from 'vitest'
import { plannedTaskTintStyle } from '@/ui/styles/ambiance'

describe('plannedTaskTintStyle', () => {
  it('tâche avec couleur, non terminée : aplat pastel, texte normal', () => {
    const style = plannedTaskTintStyle(false, '#ff8800')
    expect(style.backgroundColor).toContain('#ff8800')
    expect(style.backgroundColor).toContain('color-mix')
    expect(style.color).toBe('var(--color-text)')
    expect(style.textDecoration).toBe('none')
  })

  it('tâche avec couleur, terminée : aplat plein, texte blanc barré', () => {
    const style = plannedTaskTintStyle(true, '#ff8800')
    expect(style.backgroundColor).toBe('#ff8800')
    expect(style.color).toBe('#fff')
    expect(style.textDecoration).toBe('line-through')
  })

  it('tâche sans couleur, terminée : texte lisible (jamais blanc), barré (#23)', () => {
    const style = plannedTaskTintStyle(true, null)
    expect(style.color).toBe('var(--color-text)')
    expect(style.color).not.toBe('#fff')
    expect(style.textDecoration).toBe('line-through')
  })

  it('couleur "surface" traitée comme absence de couleur, terminée : texte lisible (#23)', () => {
    const style = plannedTaskTintStyle(true, 'var(--color-surface)')
    expect(style.color).toBe('var(--color-text)')
  })

  it('tâche sans couleur, non terminée : texte normal, pas de barré', () => {
    const style = plannedTaskTintStyle(false, null)
    expect(style.color).toBe('var(--color-text)')
    expect(style.textDecoration).toBe('none')
  })
})
