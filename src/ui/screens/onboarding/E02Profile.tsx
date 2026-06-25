import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { ProfileType } from '@/domain/entities/user'

const profiles: { value: ProfileType; label: string }[] = [
  { value: 'teenager', label: 'Adolescent' },
  { value: 'student', label: 'Étudiant' },
  { value: 'adult', label: 'Adulte' },
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
          </button>
        ))}
      </div>
      <Button variant="secondary" onClick={() => { createUser('adult').then(() => goTo('energy')) }}>
        Ignorer
      </Button>
    </main>
  )
}
