import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'Nouvel essai pour corriger l’affichage du champ « Heure de début » sur le formulaire de tâche.',
  'Nouveau flux de retours annotés : capture d’écran, annotation au crayon et commentaire directement dans l’appli.',
  'Le bandeau des jours de l’accueil, le logo énergie et les cartes des outils : plus de fond coloré, juste un contour de couleur.',
  'Nouveau réglage dans Paramètres > Accessibilité : créer des catégories de couleur pour les tâches (sport, plaisir, travail…), reprises ensuite comme raccourci de couleur.',
  'Fiche de tâche refaite : titre dans un bandeau coloré en haut, informations en cases sur deux colonnes modifiables directement au clic. Même présentation pour la création d’une tâche.',
  'Le glissement du bandeau des jours de l’accueil est plus fluide, sans saut à la fin du geste.',
  'La catégorie « Tâche du jour » est retirée : ajouter une tâche depuis la Boîte de réception ne demande plus que son titre.',
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
