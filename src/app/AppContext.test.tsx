import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useState } from 'react'
import { AppProvider, useApp } from './AppContext'
import { db } from '@/app/repositories'

/**
 * Les tâches créées par un test (y compris les tests qui s'appuient sur `inboxTasks[0]`
 * sans nettoyer) persistaient sinon dans la base partagée du fichier et polluaient les
 * tests suivants (ex. `first` pointant sur un résidu renommé plutôt que sur la tâche
 * fraîchement créée). Les autres tables (utilisateur, réglages...) restent volontairement
 * non réinitialisées : plusieurs blocs `describe` comptent sur l'utilisateur créé dans un
 * test antérieur.
 */
afterEach(async () => {
  await Promise.all([db.tasks.clear(), db.taskRecurrences.clear(), db.taskExceptions.clear()])
})

function ScreenIndicator() {
  const { screen: s, loading } = useApp()
  if (loading) return <div>loading</div>
  return <div data-testid="screen">{s}</div>
}

function CreateUserButton() {
  const { createUser, goTo, completeOnboarding } = useApp()
  return (
    <>
      <button onClick={async () => { await createUser('student'); goTo('energy') }}>
        créer
      </button>
      <button onClick={() => completeOnboarding()}>finir onboarding</button>
    </>
  )
}

function EnergyButton() {
  const { saveTodayEnergy, skipTodayEnergy } = useApp()
  return (
    <>
      <button onClick={() => saveTodayEnergy(5)}>sauvegarder énergie</button>
      <button onClick={() => skipTodayEnergy()}>ignorer énergie</button>
    </>
  )
}

function TaskButton() {
  const { addTask, todayTasks } = useApp()
  return (
    <>
      <button onClick={() => addTask('Ma tâche')}>ajouter tâche</button>
      <div data-testid="task-count">{todayTasks.length}</div>
    </>
  )
}

function addOneDay(date: string): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function OverloadWorkflow() {
  const { overloadMode, saveTodayEnergy, createDetailedTask, completeTaskById, reportTaskById } = useApp()
  const [taskId, setTaskId] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  return (
    <>
      <div data-testid="overload">{String(overloadMode)}</div>
      <button onClick={() => saveTodayEnergy(3)}>énergie basse</button>
      <button
        onClick={async () => {
          const id = await createDetailedTask({
            title: 'Tâche coûteuse',
            description: '',
            icon: null,
            color: null,
            energyCost: 5,
            essential: false,
            durationMinutes: 30,
            date: today,
            startTime: '09:00',
            status: 'planned',
            recurrence: null,
          })
          setTaskId(id)
        }}
      >
        planifier tâche coûteuse
      </button>
      <button onClick={() => taskId && completeTaskById(taskId)}>terminer tâche</button>
      <button onClick={() => taskId && reportTaskById(taskId, addOneDay(today), '09:00', '09:30')}>reporter tâche</button>
    </>
  )
}

function RefreshButton() {
  const { refreshDashboard } = useApp()
  return <button onClick={() => refreshDashboard()}>rafraîchir</button>
}

describe('AppProvider', () => {
  it('démarre en mode loading puis affiche welcome si aucun utilisateur', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
      </AppProvider>,
    )
    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })
    expect(screen.getByTestId('screen').textContent).toBe('welcome')
  })

  it('goTo change l\'écran courant', async () => {
    function GoButton() {
      const { goTo } = useApp()
      return <button onClick={() => goTo('profile')}>aller profil</button>
    }
    render(
      <AppProvider>
        <ScreenIndicator />
        <GoButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'aller profil' }))
    expect(screen.getByTestId('screen').textContent).toBe('profile')
  })

  it('createUser crée un utilisateur et goTo change l\'écran', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <CreateUserButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'créer' }))
    await waitFor(() => {
      expect(screen.getByTestId('screen').textContent).toBe('energy')
    })
    await userEvent.click(screen.getByRole('button', { name: 'finir onboarding' }))
  })

  it('saveTodayEnergy enregistre l\'énergie sans erreur', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <EnergyButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'sauvegarder énergie' }))
    })
  })

  it('skipTodayEnergy enregistre le skip sans erreur', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <EnergyButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'ignorer énergie' }))
    })
  })

  it('addTask ajoute une tâche à la liste', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <TaskButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    expect(screen.getByTestId('task-count').textContent).toBe('0')
    await userEvent.click(screen.getByRole('button', { name: 'ajouter tâche' }))
    await waitFor(() => {
      expect(screen.getByTestId('task-count').textContent).toBe('1')
    })
  })

  it('la surcharge se dérive automatiquement de l\'énergie vs coût planifié (E5)', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <CreateUserButton />
        <OverloadWorkflow />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'créer' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('energy'))
    expect(screen.getByTestId('overload').textContent).toBe('false')
    await userEvent.click(screen.getByRole('button', { name: 'énergie basse' }))
    await userEvent.click(screen.getByRole('button', { name: 'planifier tâche coûteuse' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('true')
    })
    await userEvent.click(screen.getByRole('button', { name: 'terminer tâche' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('false')
    })
    await userEvent.click(screen.getByRole('button', { name: 'finir onboarding' }))
  })

  it('reporter une tâche non-obligatoire en surcharge la sort du planning du jour (E8)', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <CreateUserButton />
        <OverloadWorkflow />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'créer' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('energy'))
    await userEvent.click(screen.getByRole('button', { name: 'énergie basse' }))
    await userEvent.click(screen.getByRole('button', { name: 'planifier tâche coûteuse' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('true')
    })
    await userEvent.click(screen.getByRole('button', { name: 'reporter tâche' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('false')
    })
    await userEvent.click(screen.getByRole('button', { name: 'finir onboarding' }))
  })

  it('refreshDashboard s\'exécute sans erreur', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <RefreshButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'rafraîchir' }))
    })
  })

  it('useApp hors AppProvider lève une erreur', () => {
    const originalError = console.error
    console.error = () => {}
    expect(() => render(<ScreenIndicator />)).toThrow()
    console.error = originalError
  })
})

describe('AppProvider — opérations tâches inbox', () => {
  function InboxPanel() {
    const { createTaskInbox, inboxTasks, moveTask, completeTask, deleteTask, updateTaskTitle, loading } = useApp()
    const first = inboxTasks[0]
    if (loading) return <div data-testid="loading">chargement</div>
    return (
      <>
        <button onClick={() => createTaskInbox('Tâche inbox')}>créer inbox</button>
        <div data-testid="inbox-count">{inboxTasks.length}</div>
        {first && (
          <>
            <div data-testid="task-title">{first.title}</div>
            <button onClick={() => moveTask(first.id, 'today')}>déplacer</button>
            <button onClick={() => completeTask(first.id)}>compléter</button>
            <button onClick={() => deleteTask(first.id)}>supprimer</button>
            <button onClick={() => updateTaskTitle(first.id, 'Renommé')}>renommer</button>
          </>
        )}
      </>
    )
  }

  async function waitReady() {
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
  }

  function getCount() {
    return parseInt(screen.getByTestId('inbox-count').textContent ?? '0')
  }

  it('createTaskInbox crée une tâche dans inbox', async () => {
    render(<AppProvider><InboxPanel /></AppProvider>)
    await waitReady()
    const before = getCount()
    await userEvent.click(screen.getByRole('button', { name: 'créer inbox' }))
    await waitFor(() => expect(getCount()).toBe(before + 1))
  })


  it('moveTask déplace une tâche inbox vers today', async () => {
    render(<AppProvider><InboxPanel /></AppProvider>)
    await waitReady()
    const before = getCount()
    await userEvent.click(screen.getByRole('button', { name: 'créer inbox' }))
    await waitFor(() => expect(getCount()).toBe(before + 1))
    await userEvent.click(screen.getByRole('button', { name: 'déplacer' }))
    await waitFor(() => expect(getCount()).toBe(before))
  })

  it('completeTask retire la tâche de la liste', async () => {
    render(<AppProvider><InboxPanel /></AppProvider>)
    await waitReady()
    const before = getCount()
    await userEvent.click(screen.getByRole('button', { name: 'créer inbox' }))
    await waitFor(() => expect(getCount()).toBe(before + 1))
    await userEvent.click(screen.getByRole('button', { name: 'compléter' }))
    await waitFor(() => expect(getCount()).toBe(before))
  })

  it('deleteTask supprime la tâche', async () => {
    render(<AppProvider><InboxPanel /></AppProvider>)
    await waitReady()
    const before = getCount()
    await userEvent.click(screen.getByRole('button', { name: 'créer inbox' }))
    await waitFor(() => expect(getCount()).toBe(before + 1))
    await userEvent.click(screen.getByRole('button', { name: 'supprimer' }))
    await waitFor(() => expect(getCount()).toBe(before))
  })

  it('updateTaskTitle renomme la tâche sans erreur', async () => {
    render(<AppProvider><InboxPanel /></AppProvider>)
    await waitReady()
    if (getCount() === 0) {
      await userEvent.click(screen.getByRole('button', { name: 'créer inbox' }))
      await waitFor(() => expect(getCount()).toBeGreaterThan(0))
    }
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'renommer' }))
    })
    expect(screen.getByTestId('inbox-count')).toBeInTheDocument()
  })
})

describe('AppProvider — sous-tâches', () => {
  function SubTaskPanel() {
    const { createTaskInbox, inboxTasks, addSubTask, deleteSubTask, toggleSubTask, getSubTasks } = useApp()
    const first = inboxTasks[0]
    const [done, setDone] = useState(false)

    async function runSubOps() {
      if (!first) return
      await addSubTask(first.id, 'Sous-tâche 1')
      const subs = await getSubTasks(first.id)
      await toggleSubTask(subs[0])
      await deleteSubTask(subs[0].id)
      setDone(true)
    }

    return (
      <>
        <button onClick={() => createTaskInbox('Tâche subs')}>créer tâche</button>
        <button onClick={runSubOps} disabled={!first}>ops sous-tâches</button>
        {done && <div data-testid="done">ok</div>}
      </>
    )
  }

  it('addSubTask, getSubTasks, toggleSubTask, deleteSubTask fonctionnent', async () => {
    render(<AppProvider><SubTaskPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer tâche' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'ops sous-tâches' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'ops sous-tâches' }))
    })
    await waitFor(() => expect(screen.getByTestId('done')).toBeInTheDocument())
  })
})

describe('AppProvider — planification des sous-tâches (E9a)', () => {
  function SubTaskPlanningPanel() {
    const {
      createTaskInbox,
      inboxTasks,
      addSubTask,
      getSubTasks,
      getPlannedSubTasksForDate,
      scheduleSubTask,
      reportSubTask,
      renameSubTask,
    } = useApp()
    const first = inboxTasks[0]
    const [planned, setPlanned] = useState<string | null>(null)
    const [subTaskId, setSubTaskId] = useState<string | null>(null)
    const today = new Date().toISOString().slice(0, 10)

    async function schedule() {
      if (!first) return
      await addSubTask(first.id, 'Sous-étape planifiable')
      const subs = await getSubTasks(first.id)
      const sub = subs[0]
      setSubTaskId(sub.id)
      await scheduleSubTask(sub.id, today, '09:00', '09:30')
      const plannedToday = await getPlannedSubTasksForDate(today)
      const match = plannedToday.find((s) => s.id === sub.id)
      setPlanned(match ? `${match.parentTitle}|${match.scheduled_start}|${String(match.postponed)}` : null)
    }

    async function report() {
      if (!subTaskId) return
      await reportSubTask(subTaskId, today, '14:00', '14:30')
      const plannedToday = await getPlannedSubTasksForDate(today)
      const match = plannedToday.find((s) => s.id === subTaskId)
      setPlanned(match ? `${match.parentTitle}|${match.scheduled_start}|${String(match.postponed)}` : null)
    }

    async function rename() {
      if (!subTaskId) return
      await renameSubTask(subTaskId, 'Sous-étape renommée')
      const plannedToday = await getPlannedSubTasksForDate(today)
      const match = plannedToday.find((s) => s.id === subTaskId)
      setPlanned(match ? match.title : null)
    }

    return (
      <>
        <button onClick={() => createTaskInbox('Tâche parente')}>créer tâche</button>
        <button onClick={schedule} disabled={!first}>planifier sous-étape</button>
        <button onClick={report} disabled={!subTaskId}>reporter sous-étape</button>
        <button onClick={rename} disabled={!subTaskId}>renommer sous-étape</button>
        <div data-testid="planned">{planned ?? 'none'}</div>
      </>
    )
  }

  it('scheduleSubTask planifie la sous-tâche et la rattache à sa tâche parente', async () => {
    render(<AppProvider><SubTaskPlanningPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer tâche' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'planifier sous-étape' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'planifier sous-étape' }))
    })
    await waitFor(() => {
      expect(screen.getByTestId('planned').textContent).toBe('Tâche parente|09:00|false')
    })
  })

  it('reportSubTask reprogramme la sous-tâche et la marque reportée', async () => {
    render(<AppProvider><SubTaskPlanningPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer tâche' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'planifier sous-étape' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'planifier sous-étape' }))
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'reporter sous-étape' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'reporter sous-étape' }))
    })
    await waitFor(() => {
      expect(screen.getByTestId('planned').textContent).toBe('Tâche parente|14:00|true')
    })
  })

  it('renameSubTask renomme uniquement la sous-tâche', async () => {
    render(<AppProvider><SubTaskPlanningPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer tâche' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'planifier sous-étape' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'planifier sous-étape' }))
    })
    await waitFor(() => expect(screen.getByRole('button', { name: 'renommer sous-étape' })).not.toBeDisabled())
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'renommer sous-étape' }))
    })
    await waitFor(() => {
      expect(screen.getByTestId('planned').textContent).toBe('Sous-étape renommée')
    })
  })
})

describe('AppProvider — settings et données', () => {
  function DataPanel() {
    const { createUser, goTo, settings, updateSettings, exportData, deleteAllData, importData, currentUser, screen: s } = useApp()
    return (
      <>
        <div data-testid="screen">{s}</div>
        <div data-testid="font-size">{settings?.font_size ?? 'none'}</div>
        <div data-testid="user-id">{currentUser?.id ?? 'none'}</div>
        <button onClick={async () => { await createUser('student'); goTo('dashboard') }}>créer utilisateur</button>
        <button onClick={() => updateSettings({ font_size: 'large' })}>changer font</button>
        <button onClick={() => exportData()}>exporter</button>
        <button onClick={() => deleteAllData()}>supprimer tout</button>
        <button
          onClick={() =>
            importData({
              user: { id: 'imported-user', profile_type: 'adult', onboarding_completed: true, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' },
              tasks: [],
            })
          }
        >
          importer valide
        </button>
        <button onClick={() => importData({ not_a_user: true })}>importer invalide</button>
      </>
    )
  }

  it('updateSettings met à jour les settings', async () => {
    render(<AppProvider><DataPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'changer font' }))
    })
    await waitFor(() => expect(screen.getByTestId('font-size').textContent).toBe('large'))
  })

  it('exportData s\'exécute sans erreur avec utilisateur', async () => {
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:test'), revokeObjectURL: vi.fn() })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    render(<AppProvider><DataPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'exporter' }))
    })
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('deleteAllData remet l\'app à l\'état welcome', async () => {
    render(<AppProvider><DataPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'supprimer tout' }))
    })
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('welcome'))
  })

  it('importData remplace les données et bascule vers energy-checkin', async () => {
    render(<AppProvider><DataPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'importer valide' }))
    })
    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('imported-user')
      expect(screen.getByTestId('screen').textContent).toBe('energy-checkin')
    })
  })

  it('importData rejette un fichier sans profil utilisateur sans toucher aux données actuelles', async () => {
    render(<AppProvider><DataPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    const userIdBefore = screen.getByTestId('user-id').textContent
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'importer invalide' }))
    })
    expect(screen.getByTestId('screen').textContent).toBe('dashboard')
    expect(screen.getByTestId('user-id').textContent).toBe(userIdBefore)
  })
})

describe('AppProvider — outils et dossiers (V5-3)', () => {
  function ToolsPanel() {
    const { createUser, goTo, screen: s, tools, folders, createFolder, createToolList, deleteTool, deleteFolder } = useApp()
    return (
      <>
        <div data-testid="screen">{s}</div>
        <div data-testid="tool-count">{tools.length}</div>
        <div data-testid="folder-count">{folders.length}</div>
        <button onClick={async () => { await createUser('student'); goTo('dashboard') }}>créer utilisateur</button>
        <button onClick={() => createFolder('Maison')}>créer dossier</button>
        <button onClick={() => createToolList('Courses', null)}>créer liste</button>
        <button onClick={() => folders[0] && deleteFolder(folders[0].id)}>supprimer dossier</button>
        <button onClick={() => tools.find((t) => t.type === 'liste' && t.folder_id === null) && deleteTool(tools.find((t) => t.type === 'liste' && t.folder_id === null)!.id)}>
          supprimer première liste
        </button>
      </>
    )
  }

  it('createUser seede une To Do et un Budget par défaut', async () => {
    render(<AppProvider><ToolsPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('tool-count').textContent)).toBeGreaterThanOrEqual(2)
    })
  })

  it('createFolder puis createToolList ajoutent bien un dossier et une liste', async () => {
    render(<AppProvider><ToolsPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    const toolCountBefore = Number(screen.getByTestId('tool-count').textContent)
    const folderCountBefore = Number(screen.getByTestId('folder-count').textContent)

    await act(async () => { await userEvent.click(screen.getByRole('button', { name: 'créer dossier' })) })
    await waitFor(() => expect(Number(screen.getByTestId('folder-count').textContent)).toBe(folderCountBefore + 1))

    await act(async () => { await userEvent.click(screen.getByRole('button', { name: 'créer liste' })) })
    await waitFor(() => expect(Number(screen.getByTestId('tool-count').textContent)).toBe(toolCountBefore + 1))
  })

  it('deleteTool retire un outil de type liste', async () => {
    render(<AppProvider><ToolsPanel /></AppProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'créer utilisateur' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('dashboard'))
    const toolCountBefore = Number(screen.getByTestId('tool-count').textContent)

    await act(async () => { await userEvent.click(screen.getByRole('button', { name: 'supprimer première liste' })) })
    await waitFor(() => expect(Number(screen.getByTestId('tool-count').textContent)).toBe(toolCountBefore - 1))
  })
})

describe('AppProvider — createDetailedTask (E21)', () => {
  function DetailedTaskPanel() {
    const { createUser, completeOnboarding, createDetailedTask, inboxTasks, todayTasks, loading } = useApp()
    if (loading) return <div data-testid="loading">chargement</div>
    return (
      <>
        <button onClick={async () => { await createUser('student'); await completeOnboarding() }}>init</button>
        <button
          onClick={() =>
            createDetailedTask({
              title: 'Tâche détaillée inbox',
              description: '',
              icon: null,
              color: null,
              energyCost: null,
              essential: false,
              durationMinutes: null,
              date: null,
              startTime: null,
              status: 'inbox',
              recurrence: null,
            })
          }
        >
          créer inbox détaillée
        </button>
        <button
          onClick={() =>
            createDetailedTask({
              title: 'Tâche détaillée today',
              description: '',
              icon: null,
              color: null,
              energyCost: null,
              essential: false,
              durationMinutes: null,
              date: null,
              startTime: null,
              status: 'today',
              recurrence: null,
            })
          }
        >
          créer today détaillée
        </button>
        <div data-testid="inbox-count">{inboxTasks.length}</div>
        <div data-testid="today-count">{todayTasks.length}</div>
      </>
    )
  }

  it('une tâche créée via createDetailedTask apparaît immédiatement dans inboxTasks / todayTasks', async () => {
    render(<AppProvider><DetailedTaskPanel /></AppProvider>)
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'init' }))
    await waitFor(() => expect(screen.getByTestId('inbox-count')).toBeInTheDocument())

    const inboxBefore = parseInt(screen.getByTestId('inbox-count').textContent ?? '0')
    await userEvent.click(screen.getByRole('button', { name: 'créer inbox détaillée' }))
    await waitFor(() => expect(parseInt(screen.getByTestId('inbox-count').textContent ?? '0')).toBe(inboxBefore + 1))

    const todayBefore = parseInt(screen.getByTestId('today-count').textContent ?? '0')
    await userEvent.click(screen.getByRole('button', { name: 'créer today détaillée' }))
    await waitFor(() => expect(parseInt(screen.getByTestId('today-count').textContent ?? '0')).toBe(todayBefore + 1))
  })
})

describe('AppProvider — updateTaskFields / deleteTaskScoped sur une série récurrente (M4)', () => {
  interface RecurringSeriesPanelProps {
    title: string
    startDate: string
    nextDate: string
  }

  function RecurringSeriesPanel({ title, startDate, nextDate }: RecurringSeriesPanelProps) {
    const {
      createUser,
      completeOnboarding,
      createDetailedTask,
      getPlannedTasksForDate,
      updateTaskFields,
      deleteTaskScoped,
      loading,
    } = useApp()
    const [rootId, setRootId] = useState<string | null>(null)
    const [energyByDate, setEnergyByDate] = useState<string>('none')
    const [countByDate, setCountByDate] = useState<number>(0)
    const [opCount, setOpCount] = useState(0)
    if (loading) return <div data-testid="loading">chargement</div>

    async function createSeries() {
      const id = await createDetailedTask({
        title,
        description: '',
        icon: null,
        color: null,
        energyCost: 3,
        essential: false,
        durationMinutes: 30,
        date: startDate,
        startTime: '09:00',
        status: 'planned',
        recurrence: { frequency: 'weekly', interval: 1, weekdays: [1], end_type: 'never', end_date: null, end_count: null },
      })
      setRootId(id)
      setOpCount((c) => c + 1)
    }

    async function modifySeries() {
      if (!rootId) return
      await updateTaskFields(rootId, { energyCost: 7 }, 'series')
      setOpCount((c) => c + 1)
    }

    async function detachRoot() {
      if (!rootId) return
      await updateTaskFields(rootId, { energyCost: 5 }, 'occurrence')
      setOpCount((c) => c + 1)
    }

    async function deleteSeries() {
      if (!rootId) return
      await deleteTaskScoped(rootId, 'series')
      setOpCount((c) => c + 1)
    }

    async function inspect() {
      const tasks = (await getPlannedTasksForDate(nextDate)).filter((t) => t.title === title)
      setEnergyByDate(String(tasks[0]?.energy_cost ?? 'none'))
      setCountByDate(tasks.length)
    }

    async function inspectStart() {
      const tasks = (await getPlannedTasksForDate(startDate)).filter((t) => t.title === title)
      setEnergyByDate(String(tasks[0]?.energy_cost ?? 'none'))
      setCountByDate(tasks.length)
    }

    return (
      <>
        <button onClick={async () => { await createUser('student'); await completeOnboarding() }}>init</button>
        <button onClick={createSeries}>créer série</button>
        <button onClick={modifySeries}>modifier série</button>
        <button onClick={detachRoot}>détacher occurrence de départ</button>
        <button onClick={deleteSeries}>supprimer série</button>
        <button onClick={inspect}>inspecter semaine suivante</button>
        <button onClick={inspectStart}>inspecter semaine de départ</button>
        <div data-testid="op-count">{opCount}</div>
        <div data-testid="energy">{energyByDate}</div>
        <div data-testid="count">{countByDate}</div>
      </>
    )
  }

  it('propage une modification de champ à toute la série future', async () => {
    render(
      <AppProvider>
        <RecurringSeriesPanel title="Série hebdo A" startDate="2026-08-10" nextDate="2026-08-17" />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'init' }))
    await userEvent.click(screen.getByRole('button', { name: 'créer série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'inspecter semaine suivante' }))
    await waitFor(() => expect(screen.getByTestId('energy').textContent).toBe('3'))

    await userEvent.click(screen.getByRole('button', { name: 'modifier série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('2'))
    await userEvent.click(screen.getByRole('button', { name: 'inspecter semaine suivante' }))
    await waitFor(() => expect(screen.getByTestId('energy').textContent).toBe('7'))
  })

  it('une occurrence déjà détachée est tout de même mise à jour quand on la modifie à nouveau en série', async () => {
    render(
      <AppProvider>
        <RecurringSeriesPanel title="Série hebdo C" startDate="2026-10-05" nextDate="2026-10-12" />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'init' }))
    await userEvent.click(screen.getByRole('button', { name: 'créer série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('1'))

    await userEvent.click(screen.getByRole('button', { name: 'détacher occurrence de départ' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('2'))

    await userEvent.click(screen.getByRole('button', { name: 'modifier série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('3'))

    await userEvent.click(screen.getByRole('button', { name: 'inspecter semaine de départ' }))
    await waitFor(() => expect(screen.getByTestId('energy').textContent).toBe('7'))
  })

  it('supprime la série entière à partir de cette occurrence', async () => {
    render(
      <AppProvider>
        <RecurringSeriesPanel title="Série hebdo B" startDate="2026-09-07" nextDate="2026-09-14" />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByTestId('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'init' }))
    await userEvent.click(screen.getByRole('button', { name: 'créer série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('1'))
    await userEvent.click(screen.getByRole('button', { name: 'inspecter semaine suivante' }))
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'))

    await userEvent.click(screen.getByRole('button', { name: 'supprimer série' }))
    await waitFor(() => expect(screen.getByTestId('op-count').textContent).toBe('2'))
    await userEvent.click(screen.getByRole('button', { name: 'inspecter semaine suivante' }))
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'))
  })
})
