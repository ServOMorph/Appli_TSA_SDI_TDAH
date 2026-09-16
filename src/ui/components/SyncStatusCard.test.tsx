import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/data/sync/syncConfig', () => ({
  isSyncEnabled: vi.fn(),
}))
vi.mock('@/data/sync/syncConsent', () => ({
  isSyncConsentGranted: vi.fn(),
}))
vi.mock('@/data/sync/syncClient', () => ({
  getLastSyncSuccessAt: vi.fn(),
  syncNow: vi.fn(),
}))

import { isSyncEnabled } from '@/data/sync/syncConfig'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { getLastSyncSuccessAt, syncNow } from '@/data/sync/syncClient'
import { SyncStatusCard } from './SyncStatusCard'

const isSyncEnabledMock = vi.mocked(isSyncEnabled)
const isSyncConsentGrantedMock = vi.mocked(isSyncConsentGranted)
const getLastSyncSuccessAtMock = vi.mocked(getLastSyncSuccessAt)
const syncNowMock = vi.mocked(syncNow)

describe('SyncStatusCard', () => {
  it("n'affiche rien si la synchronisation n'est pas configurée", () => {
    isSyncEnabledMock.mockReturnValue(false)
    const { container } = render(<SyncStatusCard />)
    expect(container).toBeEmptyDOMElement()
  })

  it('affiche "en attente" si aucune synchronisation réussie', () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue(null)
    render(<SyncStatusCard />)
    expect(screen.getByText('Vos données de test sont partagées avec le développeur')).toBeInTheDocument()
    expect(screen.getByText('Synchronisation en attente')).toBeInTheDocument()
  })

  it('affiche la date de dernière synchronisation réussie', () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue('2026-08-15T10:30:00.000Z')
    render(<SyncStatusCard />)
    expect(screen.getByText(/Dernière synchronisation/)).toBeInTheDocument()
  })

  it("n'affiche pas le bouton de synchronisation quand le partage est désactivé", () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(false)
    getLastSyncSuccessAtMock.mockReturnValue(null)
    render(<SyncStatusCard />)
    expect(screen.queryByRole('button', { name: 'Synchroniser maintenant' })).toBeNull()
    expect(screen.getByText('Le partage est désactivé dans Confidentialité.')).toBeInTheDocument()
  })

  it('synchronise en forçant l’envoi et met à jour la date au clic', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue(null)
    syncNowMock.mockImplementation(async () => {
      getLastSyncSuccessAtMock.mockReturnValue('2026-09-16T12:00:00.000Z')
      return true
    })
    render(<SyncStatusCard />)
    await userEvent.click(screen.getByRole('button', { name: 'Synchroniser maintenant' }))
    expect(syncNowMock).toHaveBeenCalledWith({ force: true })
    expect(screen.getByText(/Dernière synchronisation/)).toBeInTheDocument()
  })

  it('affiche un message d’échec si la synchronisation forcée échoue', async () => {
    isSyncEnabledMock.mockReturnValue(true)
    isSyncConsentGrantedMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue(null)
    syncNowMock.mockResolvedValue(false)
    render(<SyncStatusCard />)
    await userEvent.click(screen.getByRole('button', { name: 'Synchroniser maintenant' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Échec de la synchronisation')
  })
})
