import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E110Settings } from './E110Settings'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

function renderE110(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E110Settings />
    </AppContext.Provider>,
  )
}

describe('E110Settings', () => {
  it('affiche le titre Paramètres', () => {
    renderE110()
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
  })

  it('affiche les 6 sections', () => {
    renderE110()
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Accessibilité')).toBeInTheDocument()
    expect(screen.getByText('Stimulation cognitive')).toBeInTheDocument()
    expect(screen.getByText('Organisation')).toBeInTheDocument()
    expect(screen.getByText('Confidentialité')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('navigue vers settings-profile au clic Profil', () => {
    const goTo = vi.fn()
    renderE110({ goTo })
    fireEvent.click(screen.getByLabelText('Profil'))
    expect(goTo).toHaveBeenCalledWith('settings-profile')
  })

  it('navigue vers settings-accessibility au clic Accessibilité', () => {
    const goTo = vi.fn()
    renderE110({ goTo })
    fireEvent.click(screen.getByLabelText('Accessibilité'))
    expect(goTo).toHaveBeenCalledWith('settings-accessibility')
  })

  it('navigue vers dashboard via Retour', () => {
    const goTo = vi.fn()
    renderE110({ goTo })
    fireEvent.click(screen.getByText('Retour'))
    expect(goTo).toHaveBeenCalledWith('dashboard')
  })
})
