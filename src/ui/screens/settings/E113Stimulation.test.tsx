import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E113Stimulation } from './E113Stimulation'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'
import type { Settings } from '@/domain/entities/settings'

const defaultSettings: Settings = {
  id: 's1',
  user_id: 'u1',
  stimulation_mode: 'standard',
  dark_mode: false,
  font_size: 'medium',
  reduced_motion: false,
  overload_mode: false,
  local_encryption: false,
}

function renderE113(overrides = {}) {
  const ctx = makeAppContext({ settings: defaultSettings, ...overrides })
  return render(
    <AppContext.Provider value={ctx}>
      <E113Stimulation />
    </AppContext.Provider>,
  )
}

describe('E113Stimulation', () => {
  it('affiche le titre Stimulation cognitive', () => {
    renderE113()
    expect(screen.getByText('Stimulation cognitive')).toBeInTheDocument()
  })

  it('affiche les 3 modes', () => {
    renderE113()
    expect(screen.getByText('Calme')).toBeInTheDocument()
    expect(screen.getByText('Standard')).toBeInTheDocument()
    expect(screen.getByText('Dynamique')).toBeInTheDocument()
  })

  it('le mode standard est sélectionné par défaut', () => {
    renderE113()
    const radios = screen.getAllByRole('radio', { hidden: true })
    const radio = radios.find((r) => (r as HTMLInputElement).value === 'standard')
    expect(radio).toBeChecked()
  })

  it('appelle updateSettings avec calm au clic Calme', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE113({ updateSettings })
    fireEvent.click(screen.getByText('Calme'))
    expect(updateSettings).toHaveBeenCalledWith({ stimulation_mode: 'calm' })
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE113({ goTo })
    fireEvent.click(screen.getByText('Retour'))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
