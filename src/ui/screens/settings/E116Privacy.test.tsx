import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E116Privacy } from './E116Privacy'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'
import { grantSyncConsent, isSyncConsentGranted } from '@/data/sync/syncConsent'

const syncFeedbackNow = vi.fn().mockResolvedValue(false)
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: (...args: unknown[]) => syncFeedbackNow(...args) }))

afterEach(() => {
  localStorage.clear()
  syncFeedbackNow.mockClear()
})

function renderE116(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E116Privacy />
    </AppContext.Provider>,
  )
}

describe('E116Privacy', () => {
  it('affiche le titre Confidentialité', () => {
    renderE116()
    expect(screen.getByText('Confidentialité')).toBeInTheDocument()
  })

  it('affiche les sections stockage et consentements', () => {
    renderE116()
    expect(screen.getByText('Stockage local')).toBeInTheDocument()
    expect(screen.getByText('Consentements')).toBeInTheDocument()
  })

  it('affiche le bouton supprimer mes données', () => {
    renderE116()
    expect(screen.getByLabelText('Supprimer toutes les données')).toBeInTheDocument()
  })

  it('affiche la modal de confirmation au clic supprimer', () => {
    renderE116()
    fireEvent.click(screen.getByLabelText('Supprimer toutes les données'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Supprimer toutes les données ?')).toBeInTheDocument()
  })

  it('ferme la modal au clic Annuler', () => {
    renderE116()
    fireEvent.click(screen.getByLabelText('Supprimer toutes les données'))
    fireEvent.click(screen.getByText('Annuler'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('appelle deleteAllData au clic Supprimer dans la modal', async () => {
    const deleteAllData = vi.fn().mockResolvedValue(undefined)
    renderE116({ deleteAllData })
    fireEvent.click(screen.getByLabelText('Supprimer toutes les données'))
    fireEvent.click(screen.getByText('Supprimer'))
    await vi.waitFor(() => {
      expect(deleteAllData).toHaveBeenCalled()
    })
  })

  it('n’affirme plus qu’aucune donnée n’est envoyée à un serveur externe', () => {
    renderE116()
    expect(screen.queryByText(/Aucune donnée n'est envoyée/)).not.toBeInTheDocument()
  })

  it('reflète l’état du consentement de synchronisation', () => {
    grantSyncConsent()
    renderE116()
    expect(screen.getByLabelText('Partager mes données pour les tests')).toBeChecked()
  })

  it('active puis retire le consentement via la case', () => {
    renderE116()
    const box = screen.getByLabelText('Partager mes données pour les tests')
    expect(box).not.toBeChecked()
    fireEvent.click(box)
    expect(isSyncConsentGranted()).toBe(true)
    expect(syncFeedbackNow).toHaveBeenCalled()
    fireEvent.click(box)
    expect(isSyncConsentGranted()).toBe(false)
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE116({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
