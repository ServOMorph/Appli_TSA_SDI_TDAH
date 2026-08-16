import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'La page d’accueil affiche maintenant les jours de la semaine et le mois, comme l’écran Planning. Le trait gris en bas de cette zone se glisse vers le bas pour agrandir le planning, ou vers le haut pour le refermer.',
  'Les flèches du bandeau de dates avancent maintenant d’une semaine à chaque clic, au lieu d’un jour.',
  'Vos listes peuvent maintenant être organisées en catégories : à la création, définissez-en une ou plusieurs. En ouvrant une liste, choisissez d’abord la catégorie, puis ses éléments s’affichent. Vous pouvez ajouter une catégorie à tout moment.',
  'Dans le budget, les catégories de dépenses sont maintenant regroupées sous « Semaine » et « Mois » pour s’y retrouver plus facilement.',
  'Sur l’accueil, le bouton « + » pour ajouter un outil est maintenant juste à côté du titre « Outils », plus discret. Un peu plus d’espace sépare aussi ce titre des cases Comptes, To Do, À acheter et Budget.',
  'Dans « Tests à faire », chaque test peut être déplié pour voir le détail des étapes à suivre, ou replié pour ne garder que le titre. Un test déjà validé n’apparaît plus dans la liste.',
]

const WHATS_NEW_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev'
const WHATS_NEW_SEEN_STORAGE_KEY = 'whats_new_seen_version'

export function E01Welcome() {
  const { goTo } = useApp()
  const [showWhatsNew, setShowWhatsNew] = useState(
    () => WHATS_NEW.length > 0 && localStorage.getItem(WHATS_NEW_SEEN_STORAGE_KEY) !== WHATS_NEW_VERSION,
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
