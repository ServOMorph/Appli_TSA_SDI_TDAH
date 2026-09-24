vi.mock('@/data/sync/syncClient', () => ({
  syncNow: vi.fn(),
}))

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { db, listItemRepo, settingsRepo, toolRepo } from '@/app/repositories'
import { syncNow } from '@/data/sync/syncClient'
import { useSettingsState } from './useSettingsState'

const syncNowMock = vi.mocked(syncNow)

function SettingsPanel() {
  const { createUser, exportData, importData, updateSettings, currentUser } = useSettingsState()
  const [lastImport, setLastImport] = useState('')
  async function runImport(data: unknown) {
    const result = await importData(data)
    setLastImport(result.ok ? 'ok' : result.error)
  }
  return (
    <>
      <div data-testid="user">{currentUser?.id ?? 'aucun'}</div>
      <button onClick={() => createUser('student')}>Créer l’utilisateur</button>
      <button onClick={() => createUser('student', ' RaphTest ')}>Créer l’utilisateur avec code testeur</button>
      <button onClick={() => updateSettings({ tester_code: 'marie' })}>Modifier les réglages</button>
      <output data-testid="import-result">{lastImport}</output>
      <button onClick={() => exportData()}>Exporter</button>
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
            lists: [{ id: 'list-1', name: 'À acheter', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }],
            list_items: [
              { id: 'item-1', list_id: 'list-1', title: 'Griffoir', position: 0, checked: false, section: null, created_at: '2026-01-01T00:00:00.000Z' },
              { id: 'item-2', list_id: 'list-1', title: 'Poufs', position: 1, checked: false, section: 'Appartement', created_at: '2026-01-01T00:00:00.000Z' },
            ],
          })
        }
      >
        Importer format sans catégories
      </button>
      <button
        onClick={() =>
          importData({
            user: { id: 'imported-user', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
            lists: [{ id: 'list-1', name: 'À acheter', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }],
            list_categories: [{ id: 'cat-1', list_id: 'list-1', name: 'Général', position: 0, created_at: '2026-01-01T00:00:00.000Z' }],
            list_items: [
              { id: 'item-1', list_id: 'list-1', title: 'Griffoir', position: 0, checked: false, category_id: 'cat-1', created_at: '2026-01-01T00:00:00.000Z' },
            ],
          })
        }
      >
        Importer format sans description ni sous-tâches
      </button>
      <button onClick={() => runImport({ user: { id: 'u1', profile_type: 'student' }, tasks: {} })}>
        Importer tableau invalide
      </button>
      <button onClick={() => runImport({ version: '3.9', user: { id: 'u1', profile_type: 'student' } })}>
        Importer version future
      </button>
      <button onClick={() => runImport({ user: { id: 'u1', profile_type: 'student' }, tasks: [{ id: 'task-1', parent_id: 'inconnue' }] })}>
        Importer référence orpheline
      </button>
      <button onClick={() => runImport({ user: { id: 'u-import', profile_type: 'student' }, tasks: [{ id: 'task-import' }] })}>
        Importer avec tâche
      </button>
      <button
        onClick={() =>
          runImport({
            user: { id: 'u-routine', profile_type: 'student' },
            routines: [{ id: 'routine-1', name: 'Routine du matin', color: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' }],
            routine_steps: [{ id: 'step-1', routine_id: 'routine-1', title: 'Se brosser les dents', position: 0, duration_minutes: 5, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' }],
            tools: [{ id: 'tool-routine-1', type: 'routine', folder_id: null, list_id: null, routine_id: 'routine-1', position: 0, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' }],
          })
        }
      >
        Importer avec routine
      </button>
      <button onClick={() => runImport({ user: { id: 'u1', profile_type: 'student' }, routine_steps: [{ id: 'step-orphelin', routine_id: 'inconnue' }] })}>
        Importer étape de routine orpheline
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
  await db.budgetIncomeEntries.clear()
  await db.routines.clear()
  await db.routineSteps.clear()
  syncNowMock.mockClear()
})

describe('useSettingsState — createUser', () => {
  it('enregistre le code testeur, nettoyé des espaces, dès la création des settings', async () => {
    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur avec code testeur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    const userId = screen.getByTestId('user').textContent as string
    const settings = await settingsRepo.getByUserId(userId)
    expect(settings?.tester_code).toBe('RaphTest')
  })

  it('ne fixe pas de code testeur quand aucun n’est fourni', async () => {
    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    const userId = screen.getByTestId('user').textContent as string
    const settings = await settingsRepo.getByUserId(userId)
    expect(settings?.tester_code).toBeUndefined()
  })
})

describe('useSettingsState — updateSettings', () => {
  it('déclenche une synchronisation après écriture des réglages', async () => {
    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    const userId = screen.getByTestId('user').textContent as string

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Modifier les réglages' }))
    })

    await waitFor(async () => {
      const settings = await settingsRepo.getByUserId(userId)
      expect(settings?.tester_code).toBe('marie')
    })
    expect(syncNowMock).toHaveBeenCalled()
  })
})

describe('useSettingsState — export/import', () => {
  it('rejette les structures invalides, les références orphelines et les versions futures avant écriture', async () => {
    render(<SettingsPanel />)
    const cases = [
      ['Importer tableau invalide', 'tasks doit être une liste'],
      ['Importer référence orpheline', 'référence tâche parente orpheline'],
      ['Importer version future', 'version d’export plus récente'],
      ['Importer étape de routine orpheline', 'référence routine orpheline'],
    ] as const

    for (const [button, error] of cases) {
      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: button }))
      })
      expect(screen.getByTestId('import-result')).toHaveTextContent(error)
    }
  })

  it('annule entièrement l’import lorsqu’une écriture échoue', async () => {
    await db.users.clear()
    await db.tasks.clear()
    await db.users.add({ id: 'u-existant', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' })
    await db.tasks.add({ id: 'task-existante' } as never)
    const bulkAdd = vi.spyOn(db.tasks, 'bulkAdd').mockRejectedValueOnce(new Error('Panne injectée'))

    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer avec tâche' }))
    })
    await waitFor(() => expect(bulkAdd).toHaveBeenCalledOnce())
    expect(await db.users.toArray()).toEqual([
      { id: 'u-existant', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
    ])
    expect(await db.tasks.toArray()).toEqual([{ id: 'task-existante' }])
    bulkAdd.mockRestore()
  })

  it('conserve les retours avec image lors du remplacement par import', async () => {
    await db.feedbackReports.clear()
    const report = {
      id: 'feedback-image', screen_code: 'E117', comment: 'Retour local', image_blob: new Blob(['image']), image_path: null,
      image_bytes: 5, strokes: [], app_version: '3.6', created_at: '2026-09-06T10:00:00.000Z', sync_status: 'pending' as const, last_attempt_at: null,
      resolution_status: 'open' as const, validated_at: null,
      resolution_sync_status: 'sent' as const, resolution_last_attempt_at: null,
    }
    await db.feedbackReports.add(report)

    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer avec tâche' }))
    })
    await waitFor(() => expect(screen.getByTestId('import-result')).toHaveTextContent('ok'))
    const [preserved] = await db.feedbackReports.toArray()
    expect(preserved).toMatchObject({ ...report, image_blob: expect.anything() })
  })

  it('exporte les entrées de revenu du budget', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    await db.budgetIncomeEntries.add({ id: 'income-1', amount: 1500, label: 'Salaire', date: '2026-08-24', created_at: '2026-08-24T09:00:00.000Z' })
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Exporter' }))
    })

    const payload = JSON.parse(await readBlob(createObjectURL.mock.calls[0][0] as Blob))
    expect(payload.version).toBe('3.8')
    expect(payload.manual_test_results).toBeUndefined()
    expect(payload.budget_income_entries).toEqual([
      { id: 'income-1', amount: 1500, label: 'Salaire', date: '2026-08-24', created_at: '2026-08-24T09:00:00.000Z' },
    ])

    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('exporte les routines et leurs étapes', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:test')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<SettingsPanel />)
    await userEvent.click(screen.getByRole('button', { name: 'Créer l’utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('user')).not.toHaveTextContent('aucun'))
    await db.routines.add({ id: 'routine-export', name: 'Routine du soir', color: '#ff8800', created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await db.routineSteps.add({ id: 'step-export', routine_id: 'routine-export', title: 'Pyjama', position: 0, duration_minutes: null, weekday: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' })
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Exporter' }))
    })

    const payload = JSON.parse(await readBlob(createObjectURL.mock.calls[0][0] as Blob))
    expect(payload.routines).toEqual([
      { id: 'routine-export', name: 'Routine du soir', color: '#ff8800', created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' },
    ])
    expect(payload.routine_steps).toEqual([
      { id: 'step-export', routine_id: 'routine-export', title: 'Pyjama', position: 0, duration_minutes: null, weekday: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' },
    ])

    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('importe une routine, ses étapes et l’outil qui la référence', async () => {
    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer avec routine' }))
    })
    await waitFor(() => expect(screen.getByTestId('import-result')).toHaveTextContent('ok'))
    expect(await db.routines.toArray()).toEqual([
      { id: 'routine-1', name: 'Routine du matin', color: null, created_at: '2026-09-23T00:00:00.000Z', updated_at: '2026-09-23T00:00:00.000Z' },
    ])
    const steps = await db.routineSteps.toArray()
    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({ id: 'step-1', routine_id: 'routine-1', title: 'Se brosser les dents' })
    expect(steps[0].weekday).toBeNull()
    const tools = await toolRepo.getAll()
    expect(tools.some((t) => t.type === 'routine' && t.routine_id === 'routine-1')).toBe(true)
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

  it('recrée une catégorie par section pour les éléments de liste importés sans category_id', async () => {
    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer format sans catégories' }))
    })
    await waitFor(async () => {
      const items = await listItemRepo.getByListId('list-1')
      expect(items).toHaveLength(2)
      expect(items.every((item) => Boolean(item.category_id))).toBe(true)

      const categories = await db.listCategories.where('list_id').equals('list-1').toArray()
      expect(categories.map((c) => c.name).sort()).toEqual(['Appartement', 'Général'])

      const griffoir = items.find((item) => item.title === 'Griffoir')
      const poufs = items.find((item) => item.title === 'Poufs')
      expect(categories.find((c) => c.id === griffoir?.category_id)?.name).toBe('Général')
      expect(categories.find((c) => c.id === poufs?.category_id)?.name).toBe('Appartement')
    })
  })

  it('accepte un export antérieur à v3.5 sans description ni sous-tâches', async () => {
    render(<SettingsPanel />)
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Importer format sans description ni sous-tâches' }))
    })
    await waitFor(async () => {
      const items = await listItemRepo.getByListId('list-1')
      expect(items).toHaveLength(1)
      expect(items[0].description).toBe('')
      expect(await db.listItemSubTasks.toArray()).toEqual([])
    })
  })
})
