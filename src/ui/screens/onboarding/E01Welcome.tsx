import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'Une tâche sans couleur choisie n’est plus teintée avec la couleur d’ambiance dans le planning : elle reste neutre, seules les tâches où vous choisissez une couleur l’affichent.',
  'Dans une liste, vous pouvez maintenant supprimer une seule catégorie (croix rouge à côté de son nom) sans supprimer toute la liste.',
  'Le badge énergie de l’accueil ouvre maintenant directement l’écran pour changer votre énergie, sans passer par un écran de consultation.',
  'En touchant le titre d’un élément de liste, un nouvel écran s’ouvre pour lui ajouter une description et des sous-tâches.',
  'Le bandeau de dates du planning est maintenant encadré par votre couleur d’ambiance, et suit votre doigt de façon animée quand vous le faites glisser.',
  'Chaque outil (liste, budget...) peut maintenant avoir sa propre couleur de fond : touchez le sélecteur de couleur sur sa carte.',
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
