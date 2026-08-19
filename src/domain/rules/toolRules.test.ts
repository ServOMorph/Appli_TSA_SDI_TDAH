import { describe, it, expect } from 'vitest'
import { createTool } from './toolRules'

describe('createTool', () => {
  it('crée un outil avec les champs attendus', () => {
    const now = '2026-08-06T10:00:00.000Z'
    const tool = createTool('tool-1', 'liste', null, 'list-1', 0, now)
    expect(tool).toEqual({
      id: 'tool-1',
      type: 'liste',
      folder_id: null,
      list_id: 'list-1',
      position: 0,
      color: null,
      created_at: now,
      updated_at: now,
    })
  })

  it('accepte un folder_id et un list_id nuls (ex. tableau_comptage)', () => {
    const now = '2026-08-06T10:00:00.000Z'
    const tool = createTool('tool-2', 'tableau_comptage', 'folder-1', null, 1, now)
    expect(tool.folder_id).toBe('folder-1')
    expect(tool.list_id).toBeNull()
  })

  it('accepte une couleur de fond optionnelle', () => {
    const now = '2026-08-18T10:00:00.000Z'
    const tool = createTool('tool-3', 'liste', null, 'list-1', 0, now, '#ff8800')
    expect(tool.color).toBe('#ff8800')
  })
})
