import { useState } from 'react'
import { EnergyDisplay } from '@/ui/components/EnergyDisplay'
import type { EnergyStatus } from '@/domain/entities/energyEntry'

interface TopBarProps {
  title: string
  energyStatus: EnergyStatus | null
  energyValue: number | null
  onEnergyClick: () => void
  overloadActive: boolean
  plannedCost: number
  onResourcesClick: () => void
  onManualTestsClick: () => void
  hasNewManualTests: boolean
  onOverloadClick: () => void
  ambianceColor: string
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-lg)',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
}

const modalStyle: React.CSSProperties = {
  width: 'min(100%, 420px)',
  padding: 'var(--spacing-xl)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  backgroundColor: 'var(--color-surface)',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
}

const closeButtonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 'var(--spacing-lg)',
  padding: '10px 16px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-accent)',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
}

function overloadButtonStyle(active: boolean): React.CSSProperties {
  return {
    backgroundColor: active ? 'var(--color-warning)' : 'var(--color-surface)',
    border: `2px solid ${active ? 'var(--color-warning)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    padding: '6px 12px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: active ? '#fff' : 'var(--color-text-muted)',
    cursor: 'pointer',
    flexShrink: 0,
  }
}

export function TopBar({
  title,
  energyStatus,
  energyValue,
  onEnergyClick,
  overloadActive,
  plannedCost,
  onResourcesClick,
  onManualTestsClick,
  hasNewManualTests,
  onOverloadClick,
  ambianceColor,
}: TopBarProps) {
  const [showOverloadInfo, setShowOverloadInfo] = useState(false)

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
            onClick={() => (overloadActive ? onOverloadClick() : setShowOverloadInfo(true))}
            aria-expanded={overloadActive ? undefined : showOverloadInfo}
            aria-haspopup={overloadActive ? undefined : 'dialog'}
            aria-label={overloadActive ? 'Mode surcharge actif, ouvrir le centre récupération' : 'Détail du mode surcharge'}
            style={overloadButtonStyle(overloadActive)}
          >
            {overloadActive ? 'Mode surcharge actif' : 'Mode surcharge'}
          </button>
          {!overloadActive && (
            <>
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
                onClick={onManualTestsClick}
                aria-label={hasNewManualTests ? 'Tests à faire, nouveaux tests disponibles' : 'Tests à faire'}
                title="Tests à faire"
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-text-muted)',
                  display: 'inline-flex',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                {hasNewManualTests && (
                  <span
                    aria-label="Nouveaux tests disponibles"
                    style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-error)', border: '1px solid var(--color-surface)' }}
                  />
                )}
              </button>
            </>
          )}
        </div>
      </div>
      {showOverloadInfo && (
        <div style={modalOverlayStyle}>
          <section role="dialog" aria-modal="true" aria-labelledby="overload-info-title" style={modalStyle}>
            <h2 id="overload-info-title" style={{ margin: 0, fontSize: '1.125rem' }}>Mode surcharge</h2>
            <p style={{ margin: 'var(--spacing-md) 0 0', color: 'var(--color-text-muted)' }}>
              {overloadActive
                ? `${plannedCost} énergie planifiée pour ${energyValue} disponible aujourd'hui. L'interface est simplifiée pour vous aider à vous concentrer sur l'essentiel.`
                : "Le mode surcharge s'active automatiquement quand l'énergie planifiée dépasse l'énergie disponible. Il simplifie alors l'interface pour vous aider à vous concentrer sur l'essentiel."}
            </p>
            <button type="button" onClick={() => setShowOverloadInfo(false)} style={closeButtonStyle}>
              Fermer
            </button>
          </section>
        </div>
      )}
      {!overloadActive && (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <EnergyDisplay
            status={energyStatus}
            value={energyValue}
            plannedCost={plannedCost}
            onClick={onEnergyClick}
            ambianceColor={ambianceColor}
          />
        </div>
      )}
    </header>
  )
}
