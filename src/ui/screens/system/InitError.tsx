import { Button } from '@/ui/components/Button'

/**
 * Écran affiché quand l'initialisation de l'application (ouverture IndexedDB, migration
 * Dexie, etc.) lève une exception — distinct du cas « aucun utilisateur trouvé » (compte
 * neuf), qui reste sur `welcome`. Sans cet écran dédié, l'utilisateur restait sur `welcome`
 * en cas d'erreur technique et croyait avoir perdu ses données (roadmap_fiabilite_sync.md
 * Phase 2, incident v5.124).
 */
export function InitError() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        minHeight: '100svh',
        padding: '24px',
        textAlign: 'center',
      }}
      role="alert"
    >
      <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', fontWeight: 500 }}>
        Impossible de charger l'application
      </p>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '32em' }}>
        Vos données locales ne sont pas perdues. Un problème technique empêche seulement d'y
        accéder pour le moment.
      </p>
      <Button onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  )
}
