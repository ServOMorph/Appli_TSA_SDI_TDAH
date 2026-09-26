import { useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'

export function E01Welcome() {
  const { goTo, importData } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportError(null)
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const result = await importData(parsed)
        if (!result.ok) setImportError(result.error)
      } catch {
        setImportError('Fichier illisible : JSON invalide.')
      } finally {
        setImporting(false)
      }
    }
    reader.onerror = () => {
      setImportError('Échec de la lecture du fichier.')
      setImporting(false)
    }
    reader.readAsText(file)
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100svh',
        overflow: 'hidden',
        padding: 'clamp(16px, 4svh, 32px)',
        gap: 'var(--spacing-md)',
        textAlign: 'center',
        width: '100%',
        minWidth: 0,
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h1 className="sr-only">Bienvenue</h1>
      <div style={{ position: 'relative', width: '100%', flex: '1 1 auto', minHeight: 0 }}>
        <img
          src="/images/welcome-hero.png"
          alt="Bienvenue - Appli TSA SDI TDAH"
          style={{
            width: '100%',
            height: '100%',
            maxHeight: 'calc(100svh - 96px)',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </div>
      <Button fullWidth onClick={() => goTo('consent')} style={{ flex: '0 0 auto' }}>
        {import.meta.env.VITE_APP_VERSION ? `Entrer dans la ${import.meta.env.VITE_APP_VERSION}` : 'Entrer'}
      </Button>
      {importError && (
        <p role="alert" style={{ margin: 0, color: 'var(--color-error)', fontSize: '0.875rem' }}>
          {importError}
        </p>
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
        disabled={importing}
        style={{ flex: '0 0 auto' }}
        aria-label="Retrouver mes données"
      >
        {importing ? 'Import en cours...' : 'Retrouver mes données'}
      </Button>
    </main>
  )
}
