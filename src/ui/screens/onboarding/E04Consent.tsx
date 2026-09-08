import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { grantSyncConsent } from '@/data/sync/syncConsent'

export function E04Consent() {
  const { goTo } = useApp()

  function accept() {
    grantSyncConsent()
    goTo('profile')
  }

  function decline() {
    goTo('profile')
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
        justifyContent: 'center',
      }}
    >
      <div>
        <h1>Partage de vos données pour les tests</h1>
        <p>
          Cette version est en test. Avec votre accord, une copie de vos données est envoyée à
          l’équipe pour suivre le bon fonctionnement de l’application.
        </p>
      </div>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Ce qui est envoyé</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Vos tâches, votre planning, votre historique d’énergie, votre budget, vos listes et vos
          résultats de tests. Aucune adresse e-mail, aucun mot de passe : l’appareil est identifié
          par un code technique.
        </p>
      </Card>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Usage et hébergement</p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Ces données servent uniquement au suivi des tests et à une sauvegarde. Elles sont
          hébergées sur un serveur situé dans l’Union européenne et ne sont ni revendues ni
          utilisées à des fins publicitaires.
        </p>
      </Card>

      <Card>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
          Conservation et effacement
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Les données sont conservées le temps de votre participation aux tests, puis supprimées.
          Vous pouvez retirer votre accord à tout moment dans Paramètres, rubrique « Vie privée » :
          l’envoi s’arrête alors immédiatement.
        </p>
      </Card>

      <Button fullWidth onClick={accept}>
        J’accepte le partage
      </Button>
      <Button variant="secondary" fullWidth onClick={decline}>
        Continuer sans partager
      </Button>
    </main>
  )
}
