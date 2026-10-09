import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E110Settings } from './E110Settings'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

const mocks = vi.hoisted(() => ({
  hasUnseenWhatsNew: vi.fn().mockReturnValue(false),
  markWhatsNewSeen: vi.fn(),
}))

vi.mock('@/domain/data/whatsNew', () => ({
  WHATS_NEW: ['Nouvelle fonctionnalité de test'],
  hasUnseenWhatsNew: mocks.hasUnseenWhatsNew,
  markWhatsNewSeen: mocks.markWhatsNewSeen,
}))

function renderE110(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E110Settings />
    </AppContext.Provider>,
  )
}

describe('E110Settings', () => {
  beforeEach(() => {
    mocks.hasUnseenWhatsNew.mockReturnValue(false)
    mocks.markWhatsNewSeen.mockClear()
  })

  it('affiche le bouton Nouveautés sans pastille quand la version courante a déjà été vue', () => {
    renderE110()
    expect(screen.getByRole('button', { name: 'Nouveautés' })).toBeInTheDocument()
  })

  it('signale les nouveautés non lues, ouvre la modale et la marque vue à la fermeture', () => {
    mocks.hasUnseenWhatsNew.mockReturnValue(true)
    renderE110()
    fireEvent.click(screen.getByRole('button', { name: 'Nouveautés, non lu' }))
    expect(screen.getByRole('dialog', { name: 'Nouveautés' })).toBeInTheDocument()
    expect(screen.getByText('Nouvelle fonctionnalité de test')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(mocks.markWhatsNewSeen).toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Nouveautés' })).toBeNull()
  })

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

  it('affiche la version de l’application', () => {
    renderE110()
    expect(screen.getByText('Version test')).toBeInTheDocument()
  })

  it('n’affiche plus l’entrée Mes retours, déplacée sur l’icône de l’Accueil (roadmap_retours_conversationnels.md, Phase 6)', () => {
    renderE110()
    expect(screen.queryByText('Mes retours')).toBeNull()
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
