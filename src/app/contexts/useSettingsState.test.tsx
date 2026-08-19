import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { db, manualTestResultRepo, toolRepo } from '@/app/repositories'
import { useSettingsState } from './useSettingsState'

function SettingsPanel() {
  const { createUser, exportData, importData, currentUser } = useSettingsState()
  return (
    <>
      <div data-testid="user">{currentUser?.id ?? 'aucun'}</div>
      <button onClick={() => createUser('student')}>Créer l’utilisateur</button>
      <button onClick={() => exportData()}>Exporter</button>
      <button
        onClick={() =>
          importData({
            user: { id: 'imported-user', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
            manual_test_results: [
              { id: 'imported-result', test_id: 'creer-une-liste', status: 'nok', comment: 'Le bouton est absent.', created_at: '2026-08-14T10:00:00.000Z' },
            ],
          })
        }
      >
        Importer
      </button>
      <button
        onClick={() =>
          importData({
            user: { id: 'imported-user', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
            tools: [{ id: 'tool-liste-1', type: 'liste', folder_id: null, list_id: 'list-1', position: 0, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }],
            lists: [{ id: 'list-1', name: 'Courses', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }],
          })
        }
      >
        Importer sans outil Budget
      </button>
      <button
        onClick={() =>
          importData({
            user: { id: 'imported-user', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
            lists: [{ id: 'list-1', name: 'Courses', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }],
            list_items: [
              { id: 'item-1', list_id: 'list-1', title: 'Pain', position: 0, checked: false, category_id: 'categorie-disparue', created_at: '2026-01-01T00:00:00.000Z' },
              { id: 'item-2', list_id: 'list-1', title: 'Lait', position: 1, checked: false, category_id: 'categorie-disparue', created_at: '2026-01-01T00:00:00.000Z' },
            ],
          })
        }
      >
        Importer un export v3.2
      </button>
    </>
  )
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

afterEach(async () => {
  await db.manualTestResults.clear()
})

describe('useSettingsState — résultats des tests manuels', () => {
  it('exporte et restaure les résultats des tests manuels', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await manualTestResultRepo.create({ id: 'exported-result', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T09:00:00.000Z' })

    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Exporter' }))
    })

    const payload = JSON.parse(await readBlob(createObjectURL.mock.calls[0][0] as Blob))
    expect(payload.version).toBe('3.4')
    expect(payload.manual_test_results).toEqual([
      { id: 'exported-result', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T09:00:00.000Z' },
    ])

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer' }))
    })
    await waitFor(async () => {
      expect(await db.manualTestResults.toArray()).toEqual([
        { id: 'imported-result', test_id: 'creer-une-liste', status: 'nok', comment: 'Le bouton est absent.', created_at: '2026-08-14T10:00:00.000Z' },
      ])
    })
    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('recrée l’entrée Outil Budget manquante à l’import', async () => {
    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer sans outil Budget' }))
    })
    await waitFor(async () => {
      const tools = await toolRepo.getAll()
      expect(tools.some((t) => t.type === 'tableau_comptage')).toBe(true)
    })
  })

  it('exporte les catégories de listes', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await db.listCategories.add({ id: 'cat-1', list_id: 'list-1', name: 'Frais', position: 0, created_at: '2026-01-01T00:00:00.000Z' })

    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Exporter' }))
    })

    const payload = JSON.parse(await readBlob(createObjectURL.mock.calls[0][0] as Blob))
    expect(payload.list_categories).toEqual([
      { id: 'cat-1', list_id: 'list-1', name: 'Frais', position: 0, created_at: '2026-01-01T00:00:00.000Z' },
    ])
    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('rattache les éléments orphelins à une catégorie recréée pour un export v3.2', async () => {
    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer un export v3.2' }))
    })
    await waitFor(async () => {
      const categories = await db.listCategories.toArray()
      expect(categories).toHaveLength(1)
      expect(categories[0]).toMatchObject({ list_id: 'list-1', name: 'Général', position: 0 })

      const items = await db.listItems.toArray()
      expect(items).toHaveLength(2)
      expect(items.every((i) => i.category_id === categories[0].id)).toBe(true)
    })
  })
})
