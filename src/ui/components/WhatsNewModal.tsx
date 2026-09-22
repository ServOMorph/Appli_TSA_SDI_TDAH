interface WhatsNewModalProps {
  updates: string[]
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-lg)',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
}

const panelStyle: React.CSSProperties = {
  width: 'min(100%, 420px)',
  maxHeight: '80svh',
  overflowY: 'auto',
  padding: 'var(--spacing-xl)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  backgroundColor: 'var(--color-surface)',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  textAlign: 'left',
}

export function WhatsNewModal({ updates, onClose }: WhatsNewModalProps) {
  return (
    <div style={overlayStyle} role="dialog" aria-label="Nouveautés">
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Nouveautés</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '1.25rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>
        {updates.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Aucune nouveauté pour le moment.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {updates.map((update, index) => (
              <li key={index} style={{ fontSize: '0.9rem' }}>
                {update}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
