import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/data/sync/syncConfig', () => ({
  isSyncEnabled: vi.fn(),
}))
vi.mock('@/data/sync/syncClient', () => ({
  getLastSyncSuccessAt: vi.fn(),
}))

import { isSyncEnabled } from '@/data/sync/syncConfig'
import { getLastSyncSuccessAt } from '@/data/sync/syncClient'
import { SyncStatusCard } from './SyncStatusCard'

const isSyncEnabledMock = vi.mocked(isSyncEnabled)
const getLastSyncSuccessAtMock = vi.mocked(getLastSyncSuccessAt)

describe('SyncStatusCard', () => {
  it("n'affiche rien si la synchronisation n'est pas configurée", () => {
    isSyncEnabledMock.mockReturnValue(false)
    const { container } = render(<SyncStatusCard />)
    expect(container).toBeEmptyDOMElement()
  })

  it('affiche "en attente" si aucune synchronisation réussie', () => {
    isSyncEnabledMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue(null)
    render(<SyncStatusCard />)
    expect(screen.getByText('Vos données de test sont partagées avec le développeur')).toBeInTheDocument()
    expect(screen.getByText('Synchronisation en attente')).toBeInTheDocument()
  })

  it('affiche la date de dernière synchronisation réussie', () => {
    isSyncEnabledMock.mockReturnValue(true)
    getLastSyncSuccessAtMock.mockReturnValue('2026-08-15T10:30:00.000Z')
    render(<SyncStatusCard />)
    expect(screen.getByText(/Dernière synchronisation/)).toBeInTheDocument()
  })
})
