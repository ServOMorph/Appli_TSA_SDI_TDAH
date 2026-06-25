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

export function E116Privacy() {
  const { deleteAllData, goTo } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    await deleteAllData()
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

      <h1>Confidentialité</h1>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Stockage local</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Toutes vos données sont stockées uniquement sur votre appareil. Aucune donnée n'est envoyée
          à un serveur externe.
        </p>
      </Card>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Consentements</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Aucun cookie de tracking, aucune analyse comportementale, aucun compte obligatoire.
        </p>
      </Card>

      <Card>
        <p style={{ margin: '0 0 var(--spacing-sm)', fontWeight: 600, color: 'var(--color-error)' }}>
          Supprimer toutes les données
        </p>
        <p style={{ margin: '0 0 var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Cette action supprime définitivement toutes vos données locales. Elle est irréversible.
        </p>
        <Button
          variant="secondary"
          onClick={() => setShowConfirm(true)}
          aria-label="Supprimer toutes les données"
        >
          Supprimer mes données
        </Button>
      </Card>

      {showConfirm && (
        <div role="dialog" aria-modal="true" aria-label="Confirmer la suppression" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer toutes les données ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Cette action est irréversible. Toutes vos tâches, votre historique d'énergie et votre profil
              seront supprimés.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button variant="secondary" fullWidth onClick={() => setShowConfirm(false)}>
                Annuler
              </Button>
              <Button
                fullWidth
                onClick={handleDelete}
                style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
