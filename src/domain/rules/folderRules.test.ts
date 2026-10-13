import { describe, it, expect } from 'vitest'
import { canMoveFolder, createFolder, getChildFolders, getDescendantFolderIds } from './folderRules'
import type { Folder } from '@/domain/entities/folder'

const NOW = '2026-08-06T10:00:00.000Z'

function folder(id: string, parentId?: string | null): Folder {
  return { id, name: id, parent_id: parentId, position: 0, created_at: NOW, updated_at: NOW }
}

describe('createFolder', () => {
  it('crée un dossier racine avec les champs attendus', () => {
    expect(createFolder('folder-1', 'Maison', 0, NOW)).toEqual({
      id: 'folder-1',
      name: 'Maison',
      parent_id: null,
      position: 0,
      created_at: NOW,
      updated_at: NOW,
    })
  })

  it('crée un sous-dossier', () => {
    expect(createFolder('folder-2', 'Cuisine', 0, NOW, 'folder-1').parent_id).toBe('folder-1')
  })
})

describe('getChildFolders', () => {
  const folders = [folder('a'), folder('b', null), folder('c', 'a'), folder('d', 'c')]

  it('traite un parent absent comme la racine', () => {
    expect(getChildFolders(folders, null).map((f) => f.id)).toEqual(['a', 'b'])
  })

  it('liste les enfants directs seulement', () => {
    expect(getChildFolders(folders, 'a').map((f) => f.id)).toEqual(['c'])
  })
})

describe('getDescendantFolderIds', () => {
  it('renvoie tous les descendants', () => {
    const folders = [folder('a'), folder('c', 'a'), folder('d', 'c'), folder('e', 'a'), folder('z')]
    expect(getDescendantFolderIds(folders, 'a').sort()).toEqual(['c', 'd', 'e'])
  })

  it('renvoie une liste vide pour un dossier sans enfant', () => {
    expect(getDescendantFolderIds([folder('a')], 'a')).toEqual([])
  })
})

describe('canMoveFolder', () => {
  const folders = [folder('a'), folder('b'), folder('c', 'a'), folder('d', 'c')]

  it('autorise le déplacement vers un autre dossier', () => {
    expect(canMoveFolder(folders, 'b', 'a')).toBe(true)
  })

  it('autorise le retour à la racine d\'un sous-dossier', () => {
    expect(canMoveFolder(folders, 'c', null)).toBe(true)
  })

  it('refuse le déplacement vers soi-même', () => {
    expect(canMoveFolder(folders, 'a', 'a')).toBe(false)
  })

  it('refuse le déplacement vers un descendant', () => {
    expect(canMoveFolder(folders, 'a', 'c')).toBe(false)
    expect(canMoveFolder(folders, 'a', 'd')).toBe(false)
  })

  it('refuse un déplacement qui ne change rien', () => {
    expect(canMoveFolder(folders, 'a', null)).toBe(false)
    expect(canMoveFolder(folders, 'c', 'a')).toBe(false)
  })

  it('refuse un dossier ou une cible inconnus', () => {
    expect(canMoveFolder(folders, 'x', null)).toBe(false)
    expect(canMoveFolder(folders, 'a', 'x')).toBe(false)
  })
})
