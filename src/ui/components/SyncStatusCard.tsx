import { isSyncEnabled } from '@/data/sync/supabaseClient'
import { getLastSyncSuccessAt } from '@/data/sync/syncClient'
import { Card } from '@/ui/components/Card'

function formatSyncDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export function SyncStatusCard() {
  if (!isSyncEnabled()) return null

  const lastSuccess = getLastSyncSuccessAt()

  return (
    <Card>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
        Vos données de test sont partagées avec le développeur
      </p>
      <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        {lastSuccess ? `Dernière synchronisation : ${formatSyncDate(lastSuccess)}` : 'Synchronisation en attente'}
      </p>
    </Card>
  )
}
