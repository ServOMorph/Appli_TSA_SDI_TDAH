interface TopBarProps {
  title: string
  energyLabel: string
  energyAriaLabel: string
  onEnergyClick: () => void
  onOverloadClick: () => void
  onResourcesClick: () => void
  onSettingsClick: () => void
}

const chipStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
}

export function TopBar({
  title,
  energyLabel,
  energyAriaLabel,
  onEnergyClick,
  onOverloadClick,
  onResourcesClick,
  onSettingsClick,
}: TopBarProps) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-sm)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h1>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexShrink: 0 }}
        >
          <button
            onClick={onResourcesClick}
            aria-label="Ressources"
            title="Ressources"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </button>
          <button
            onClick={onSettingsClick}
            aria-label="Paramètres"
            title="Paramètres"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
        <button onClick={onEnergyClick} aria-label={energyAriaLabel} style={chipStyle}>
          {energyLabel}
        </button>
        <button onClick={onOverloadClick} aria-label="Activer le mode surcharge" style={chipStyle}>
          Mode surcharge
        </button>
      </div>
    </header>
  )
}
