import { useEffect, useRef, useState } from 'react'
import { isSyncEnabled } from '@/data/sync/syncConfig'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { getLastSyncSuccessAt, syncNow } from '@/data/sync/syncClient'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'

function formatSyncDate(value: string): string {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export function SyncStatusCard() {
  const [lastSuccess, setLastSuccess] = useState(getLastSyncSuccessAt())
  const [syncing, setSyncing] = useState(false)
  const [failed, setFailed] = useState(false)
  const mountedRef = useRef(true)
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  if (!isSyncEnabled()) return null

  async function sync() {
    setSyncing(true)
    setFailed(false)
    const ok = await syncNow({ force: true })
    if (!mountedRef.current) return
    if (ok) setLastSuccess(getLastSyncSuccessAt())
    else setFailed(true)
    setSyncing(false)
  }

  return (
    <Card>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
        Vos données de test sont partagées avec le développeur
      </p>
      <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        {lastSuccess ? `Dernière synchronisation : ${formatSyncDate(lastSuccess)}` : 'Synchronisation en attente'}
      </p>
      {isSyncConsentGranted() ? (
        <>
          <Button
            variant="secondary"
            onClick={sync}
            disabled={syncing}
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            {syncing ? 'Synchronisation…' : 'Synchroniser maintenant'}
          </Button>
          {failed && (
            <p role="alert" style={{ margin: '4px 0 0', color: 'var(--color-error)', fontSize: '0.875rem' }}>
              Échec de la synchronisation. Vérifiez votre connexion et réessayez.
            </p>
          )}
        </>
      ) : (
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Le partage est désactivé dans Confidentialité.
        </p>
      )}
    </Card>
  )
}
