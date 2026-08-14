import { useRef, useState } from 'react'
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
  const { exportData, importData, goTo } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<unknown>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    await exportData()
    setExporting(false)
    setDone(true)
    setShowConfirm(false)
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        setPendingImport(parsed)
      } catch {
        setImportError('Fichier illisible : JSON invalide.')
      }
    }
    reader.onerror = () => setImportError('Échec de la lecture du fichier.')
    reader.readAsText(file)
  }

  async function handleImport() {
    setImporting(true)
    setImportError(null)
    const result = await importData(pendingImport)
    if (!result.ok) {
      setImporting(false)
      setImportError(result.error)
      return
    }
    setPendingImport(null)
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
        paddingBottom: 'var(--bottomnav-h)',
      }}
    >
      <button style={backBtnStyle} onClick={() => goTo('settings')} aria-label="Retour">
        ← Retour
      </button>

      <h1>Export et import des données</h1>

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

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-error)' }}>Importer une sauvegarde</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Restaure vos données à partir d'un fichier JSON exporté précédemment. Remplace
          définitivement toutes les données actuelles de l'appareil.
        </p>
      </Card>

      {importError && (
        <Card>
          <p style={{ margin: 0, color: 'var(--color-error)', fontWeight: 600 }} role="alert">
            {importError}
          </p>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <Button
        variant="secondary"
        fullWidth
        onClick={() => fileInputRef.current?.click()}
        aria-label="Importer un fichier JSON"
      >
        Importer un fichier JSON
      </Button>

      {pendingImport != null && (
        <div role="dialog" aria-modal="true" aria-label="Confirmer l'import" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Remplacer toutes les données ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Cette action est irréversible. Toutes les données actuelles de l'appareil seront
              supprimées et remplacées par le contenu du fichier importé.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setPendingImport(null)}
                disabled={importing}
              >
                Annuler
              </Button>
              <Button
                fullWidth
                onClick={handleImport}
                disabled={importing}
                style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                {importing ? 'Import en cours...' : 'Remplacer'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
