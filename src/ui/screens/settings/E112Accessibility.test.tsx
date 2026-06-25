import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E112Accessibility } from './E112Accessibility'
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

function renderE112(overrides = {}) {
  const ctx = makeAppContext({ settings: defaultSettings, ...overrides })
  return render(
    <AppContext.Provider value={ctx}>
      <E112Accessibility />
    </AppContext.Provider>,
  )
}

describe('E112Accessibility', () => {
  it('affiche le titre Accessibilité', () => {
    renderE112()
    expect(screen.getByText('Accessibilité')).toBeInTheDocument()
  })

  it('affiche les 3 options de taille de texte', () => {
    renderE112()
    expect(screen.getByText('Petite')).toBeInTheDocument()
    expect(screen.getByText('Normale')).toBeInTheDocument()
    expect(screen.getByText('Grande')).toBeInTheDocument()
  })

  it('appelle updateSettings avec font_size small au clic Petite', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByText('Petite'))
    expect(updateSettings).toHaveBeenCalledWith({ font_size: 'small' })
  })

  it('appelle updateSettings avec reduced_motion true au cochage', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByLabelText('Réduire les animations'))
    expect(updateSettings).toHaveBeenCalledWith({ reduced_motion: true })
  })

  it('appelle updateSettings avec dark_mode true au cochage', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE112({ updateSettings })
    fireEvent.click(screen.getByLabelText('Mode sombre'))
    expect(updateSettings).toHaveBeenCalledWith({ dark_mode: true })
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE112({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
