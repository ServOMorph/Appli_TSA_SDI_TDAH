interface WhatsNewModalProps {
  updates: string[]
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
}

const panelStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(2px)',
  color: '#ffffff',
  padding: 'var(--spacing-md)',
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
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Nouveautés</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.25rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          {updates.map((update, index) => (
            <li key={index} style={{ fontSize: '0.9rem' }}>
              {update}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
