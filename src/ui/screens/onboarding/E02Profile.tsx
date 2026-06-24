import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { ProfileType } from '@/domain/entities/user'

const profiles: { value: ProfileType; label: string; description: string }[] = [
  { value: 'teenager', label: 'Adolescent', description: '14–17 ans' },
  { value: 'student', label: 'Étudiant', description: '18–25 ans' },
  { value: 'adult', label: 'Adulte', description: '26–40 ans' },
]

export function E02Profile() {
  const { createUser, goTo } = useApp()

  async function select(profile: ProfileType) {
    await createUser(profile)
    goTo('energy')
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
        <h1>Votre profil</h1>
        <p>Choisissez le profil qui vous correspond.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {profiles.map((p) => (
          <button
            key={p.value}
            onClick={() => select(p.value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1rem' }}>
              {p.label}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              {p.description}
            </span>
          </button>
        ))}
      </div>
      <Button variant="secondary" onClick={() => { createUser('adult').then(() => goTo('energy')) }}>
        Ignorer
      </Button>
    </main>
  )
}
