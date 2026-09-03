import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'

const WHATS_NEW: string[] = [
  'Le point rouge « Tests à faire » de l’accueil s’éteint dès que vous avez passé un test, que vous l’ayez marqué « Validé » ou « Non validé ». Il se rallume seulement pour un nouveau test ou pour un test corrigé, à repasser.',
  'Le bandeau des jours de la semaine, sur l’accueil, a maintenant un fond dans votre couleur d’ambiance, pas seulement un contour. Le jour affiché reste bien visible.',
  'Quand vous faites glisser le bandeau des jours, seuls les jours défilent à l’intérieur : la case colorée, elle, ne bouge plus. Le jour au centre grossit légèrement pour mieux le repérer.',
  'Nouvelle vue « Planning de la semaine » : touchez le logo à gauche du mois, sur l’accueil, pour voir les sept jours de la semaine côte à côte, chacun avec ses tâches en icônes. Glissez pour changer de semaine.',
  'Une tâche sans couleur choisie reste lisible une fois cochée : son texte se barre en noir, plus en blanc.',
  'Quand vous donnez une couleur à un outil dans les Paramètres, sa carte sur l’accueil prend aussitôt cette couleur, plus seulement le réglage.',
  'L’outil « Comptes » de l’accueil s’appelle maintenant « Mon compte ». Depuis la page Budget, l’écran équivalent s’appelle « Prévisions », pour ne plus confondre les deux.',
  'Sur le planning, le nom de la tâche reste toujours en haut de la case, même quand elle est grande. L’heure de début s’affiche en haut, l’heure de fin en bas.',
  'Pour planifier une tâche à une heure précise, il faut maintenant lui donner une durée. Une tâche sans horaire (liste à faire) n’a rien de nouveau à remplir.',
  'En haut de l’écran « Mon compte », un « Solde du mois » affiche la somme prévue pour toutes les sous-catégories ; chaque dépense saisie le fait baisser. Sur la page Budget, ce montant reste fixe.',
  'Sur la page Budget, la carte « Prévisions » affiche maintenant son montant en positif et en vert, comme la carte « Mes livrets ».',
  'Sur l’écran d’énergie, « Retour » et « Ignorer » ramènent directement à l’accueil. L’ancien écran « Mon énergie » séparé a été retiré.',
  'Dans Paramètres > Accessibilité, « Couleur des outils » propose maintenant aussi la carte « Mon compte » : la couleur choisie s’applique à sa carte sur l’accueil.',
  'Dans une liste, un élément qui a des sous-tâches les montre directement sous lui : on peut les plier, les déplier et les cocher sans ouvrir l’élément.',
  'Les écrans « Paramètres » (et ses sous-écrans) ainsi que le formulaire de tâche ne débordent plus à droite sur téléphone : tous les cadres tiennent dans la largeur de l’écran, avec la même marge de chaque côté.',
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
