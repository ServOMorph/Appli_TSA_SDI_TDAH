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

  it('affiche les 4 sections', () => {
    renderE110()
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Accessibilité')).toBeInTheDocument()
    expect(screen.getByText('Confidentialité')).toBeInTheDocument()
    expect(screen.getByText('Export et import')).toBeInTheDocument()
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

  it('le <main> tient dans la fenêtre : width 100% borné à 480px (#32)', () => {
    renderE110()
    const main = document.querySelector('main') as HTMLElement
    expect(main.style.width).toBe('100%')
    expect(main.style.maxWidth).toBe('480px')
  })

  it('navigue vers dashboard via Retour', () => {
    const goTo = vi.fn()
    renderE110({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('dashboard')
  })
})
