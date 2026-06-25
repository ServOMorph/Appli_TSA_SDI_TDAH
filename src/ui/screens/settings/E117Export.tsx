import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-xl)',
  zIndex: 1000,
}

const modalBox: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '400px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

export function E117Export() {
  const { exportData, goTo } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleExport() {
    setExporting(true)
    await exportData()
    setExporting(false)
    setDone(true)
    setShowConfirm(false)
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('settings')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Export des données</h1>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Export JSON (RGPD)</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Télécharge l'intégralité de vos données dans un fichier JSON lisible et portable.
          Conforme au droit d'accès RGPD.
        </p>
      </Card>

      {done && (
        <Card>
          <p style={{ margin: 0, color: 'var(--color-success)', fontWeight: 600 }} role="status">
            Export téléchargé avec succès.
          </p>
        </Card>
      )}

      <Button fullWidth onClick={() => setShowConfirm(true)} aria-label="Exporter mes données JSON">
        Exporter en JSON
      </Button>

      {showConfirm && (
        <div role="dialog" aria-modal="true" aria-label="Confirmer l'export" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Exporter vos données ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Un fichier JSON contenant toutes vos données sera téléchargé sur votre appareil.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button variant="secondary" fullWidth onClick={() => setShowConfirm(false)} disabled={exporting}>
                Annuler
              </Button>
              <Button fullWidth onClick={handleExport} disabled={exporting}>
                {exporting ? 'Export en cours...' : 'Télécharger'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
