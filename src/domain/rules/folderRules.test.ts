import { describe, it, expect } from 'vitest'
import { createFolder } from './folderRules'

describe('createFolder', () => {
  it('crée un dossier avec les champs attendus', () => {
    const now = '2026-08-06T10:00:00.000Z'
    const folder = createFolder('folder-1', 'Maison', 0, now)
    expect(folder).toEqual({
      id: 'folder-1',
      name: 'Maison',
      position: 0,
      created_at: now,
      updated_at: now,
    })
  })
})
