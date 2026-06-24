import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { AppProvider, useApp } from './AppContext'

function ScreenIndicator() {
  const { screen: s, loading } = useApp()
  if (loading) return <div>loading</div>
  return <div data-testid="screen">{s}</div>
}

function CreateUserButton() {
  const { createUser, goTo } = useApp()
  return (
    <button onClick={async () => { await createUser('student'); goTo('energy') }}>
      créer
    </button>
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

function OverloadButton() {
  const { overloadMode, setOverloadMode } = useApp()
  return (
    <>
      <div data-testid="overload">{String(overloadMode)}</div>
      <button onClick={() => setOverloadMode(true)}>activer surcharge</button>
      <button onClick={() => setOverloadMode(false)}>désactiver surcharge</button>
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

  it('setOverloadMode change l\'état de surcharge', async () => {
    render(
      <AppProvider>
        <ScreenIndicator />
        <CreateUserButton />
        <OverloadButton />
      </AppProvider>,
    )
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull())
    await userEvent.click(screen.getByRole('button', { name: 'créer' }))
    await waitFor(() => expect(screen.getByTestId('screen').textContent).toBe('energy'))
    expect(screen.getByTestId('overload').textContent).toBe('false')
    await userEvent.click(screen.getByRole('button', { name: 'activer surcharge' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('true')
    })
    await userEvent.click(screen.getByRole('button', { name: 'désactiver surcharge' }))
    await waitFor(() => {
      expect(screen.getByTestId('overload').textContent).toBe('false')
    })
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
