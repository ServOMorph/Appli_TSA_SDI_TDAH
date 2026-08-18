import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'La page d’accueil affiche maintenant les jours de la semaine et le mois, comme l’écran Planning. Le trait gris en bas de cette zone se glisse vers le bas pour agrandir le planning, ou vers le haut pour le refermer.',
  'Les flèches du bandeau de dates avancent maintenant d’une semaine à chaque clic, au lieu d’un jour.',
  'Vos listes peuvent maintenant être organisées en catégories : à la création, définissez-en une ou plusieurs. En ouvrant une liste, choisissez d’abord la catégorie, puis ses éléments s’affichent. Vous pouvez ajouter une catégorie à tout moment.',
  'Dans le budget, les catégories de dépenses sont maintenant regroupées sous « Semaine » et « Mois » pour s’y retrouver plus facilement.',
  'Vos données de test sont désormais envoyées automatiquement au développeur en arrière-plan, sans action de votre part. Un indicateur dans Paramètres affiche la date de la dernière synchronisation.',
]

const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'
const URGENT_BANNER_STORAGE_KEY = 'urgent_banner_dismissed'

export function E01Welcome() {
  const { goTo } = useApp()
  const [showWhatsNew, setShowWhatsNew] = useState(
    () => WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION,
  )
  const [urgentBannerDismissed, setUrgentBannerDismissed] = useState(
    () => localStorage.getItem(URGENT_BANNER_STORAGE_KEY) === 'true',
  )

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
      {!urgentBannerDismissed && (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 'var(--spacing-sm)',
            width: '100%',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error)',
            color: 'white',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, textAlign: 'left', color: 'white' }}>
            URGENCE : dans Paramètres, ouvre « Export et import » et réimporte le fichier que tu m'as envoyé — ça va réparer le bouton Budget disparu. Vérifie ensuite que tout est bien là.
          </p>
          <button
            onClick={() => {
              localStorage.setItem(URGENT_BANNER_STORAGE_KEY, 'true')
              setUrgentBannerDismissed(true)
            }}
            style={{
              background: 'none',
              border: '1px solid white',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontWeight: 600,
              padding: '6px 16px',
              cursor: 'pointer',
            }}
          >
            Fait
          </button>
        </div>
      )}
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
        {showWhatsNew && (
          <WhatsNewModal
            updates={WHATS_NEW}
            onClose={() => {
              localStorage.setItem(WHATS_NEW_SEEN_STORAGE_KEY, WHATS_NEW_VERSION)
              setShowWhatsNew(false)
            }}
          />
        )}
      </div>
      <Button fullWidth onClick={() => goTo('profile')} style={{ flex: '0 0 auto' }}>
        {import.meta.env.VITE_APP_VERSION ? `Entrer dans la ${import.meta.env.VITE_APP_VERSION}` : 'Entrer'}
      </Button>
    </main>
  )
}
