import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { db, manualTestResultRepo } from '@/app/repositories'
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
    expect(payload.version).toBe('3.2')
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
})
