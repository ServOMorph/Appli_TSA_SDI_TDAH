import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const tips = [
  'Fermez les yeux 2 minutes et respirez lentement.',
  'Réduisez les sources de bruit et de lumière.',
  'Hydratez-vous et bougez doucement.',
  'Une seule chose à la fois — pas de multitâche.',
  'Il est normal de se sentir débordé. Cela passe.',
]

export function E90OverloadRecovery() {
  const { setOverloadMode, goTo } = useApp()

  async function handleDeactivate() {
    await setOverloadMode(false)
    goTo('dashboard')
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
      <h1>Mode surcharge actif</h1>

      <Card>
        <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)', color: 'var(--color-warning)' }}>
          Notifications réduites · Interface simplifiée
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Prenez le temps qu'il vous faut. Il n'y a rien d'urgent.
        </p>
      </Card>

      <section aria-label="Conseils de récupération">
        <h2>Conseils</h2>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          {tips.map((tip, i) => (
            <li key={i}>
              <Card>
                <p style={{ margin: 0, color: 'var(--color-text)' }}>{tip}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="secondary" fullWidth onClick={handleDeactivate}>
        Désactiver le mode surcharge
      </Button>
    </main>
  )
}
