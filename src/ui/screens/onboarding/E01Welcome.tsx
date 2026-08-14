import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'Nouvelle icône « Tests à faire » en haut de l\'écran : des tests à réaliser et à valider',
]

export function E01Welcome() {
  const { goTo } = useApp()
  const [showWhatsNew, setShowWhatsNew] = useState(WHATS_NEW.length > 0)

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
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h1 className="sr-only">Bienvenue</h1>
      <p
        role="alert"
        style={{
          margin: 0,
          width: '100%',
          padding: 'var(--spacing-sm)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-error)',
          color: 'white',
          fontWeight: 600,
        }}
      >
        URGENCE : importe tes données, vérifie-les, puis exporte-les et envoie-les-moi.
      </p>
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
        {showWhatsNew && <WhatsNewModal updates={WHATS_NEW} onClose={() => setShowWhatsNew(false)} />}
      </div>
      <Button fullWidth onClick={() => goTo('profile')} style={{ flex: '0 0 auto' }}>
        {import.meta.env.VITE_APP_VERSION ? `Entrer dans la ${import.meta.env.VITE_APP_VERSION}` : 'Entrer'}
      </Button>
    </main>
  )
}
