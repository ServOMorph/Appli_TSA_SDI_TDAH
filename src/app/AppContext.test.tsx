import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { AppProvider, useApp } from './AppContext'

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
  const { overloadMode, saveTodayEnergy, schedulePendingTask, getPlannedTasksForDate, completeV2Task, reportV2Task } = useApp()
  const [taskId, setTaskId] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  return (
    <>
      <div data-testid="overload">{String(overloadMode)}</div>
      <button onClick={() => saveTodayEnergy(3)}>énergie basse</button>
      <button
        onClick={async () => {
          await schedulePendingTask('Tâche coûteuse', today, '09:00', '09:30', undefined, 5, false)
          const planned = await getPlannedTasksForDate(today)
          const target = planned.find((t) => t.title === 'Tâche coûteuse' && t.status === 'planned')
          setTaskId(target?.id ?? null)
        }}
      >
        planifier tâche coûteuse
      </button>
      <button onClick={() => taskId && completeV2Task(taskId)}>terminer tâche</button>
      <button onClick={() => taskId && reportV2Task(taskId, addOneDay(today), '09:00', '09:30')}>reporter tâche</button>
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
      scheduleSubTaskV2,
      reportSubTaskV2,
      renameSubTaskV2,
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
      await scheduleSubTaskV2(sub.id, today, '09:00', '09:30')
      const plannedToday = await getPlannedSubTasksForDate(today)
      const match = plannedToday.find((s) => s.id === sub.id)
      setPlanned(match ? `${match.parentTitle}|${match.scheduled_start}|${String(match.postponed)}` : null)
    }

    async function report() {
      if (!subTaskId) return
      await reportSubTaskV2(subTaskId, today, '14:00', '14:30')
      const plannedToday = await getPlannedSubTasksForDate(today)
      const match = plannedToday.find((s) => s.id === subTaskId)
      setPlanned(match ? `${match.parentTitle}|${match.scheduled_start}|${String(match.postponed)}` : null)
    }

    async function rename() {
      if (!subTaskId) return
      await renameSubTaskV2(subTaskId, 'Sous-étape renommée')
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

  it('scheduleSubTaskV2 planifie la sous-tâche et la rattache à sa tâche parente', async () => {
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

  it('reportSubTaskV2 reprogramme la sous-tâche et la marque reportée', async () => {
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

  it('renameSubTaskV2 renomme uniquement la sous-tâche', async () => {
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
    const { createUser, goTo, settings, updateSettings, exportData, deleteAllData, screen: s } = useApp()
    return (
      <>
        <div data-testid="screen">{s}</div>
        <div data-testid="font-size">{settings?.font_size ?? 'none'}</div>
        <button onClick={async () => { await createUser('student'); goTo('dashboard') }}>créer utilisateur</button>
        <button onClick={() => updateSettings({ font_size: 'large' })}>changer font</button>
        <button onClick={() => exportData()}>exporter</button>
        <button onClick={() => deleteAllData()}>supprimer tout</button>
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
})
