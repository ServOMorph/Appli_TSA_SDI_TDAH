import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { Screen } from '@/app/AppContext'

interface SettingsEntry {
  label: string
  description: string
  screen: Screen
}

const entries: SettingsEntry[] = [
  { label: 'Profil', description: 'Type de profil et informations', screen: 'settings-profile' },
  { label: 'Accessibilité', description: 'Taille texte, contraste, animations', screen: 'settings-accessibility' },
  { label: 'Stimulation cognitive', description: 'Calme, standard ou dynamique', screen: 'settings-stimulation' },
  { label: 'Organisation', description: 'Modules et affichage', screen: 'settings-organisation' },
  { label: 'Confidentialité', description: 'Gestion des données et consentements', screen: 'settings-privacy' },
  { label: 'Export', description: 'Exporter ou supprimer vos données', screen: 'settings-export' },
]

export function E110Settings() {
  const { goTo } = useApp()

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
      <h1>Paramètres</h1>

      <nav aria-label="Sections paramètres">
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
          {entries.map((entry) => (
            <li key={entry.screen}>
              <button
                onClick={() => goTo(entry.screen)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                aria-label={entry.label}
              >
                <Card>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{entry.label}</p>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {entry.description}
                  </p>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Button variant="secondary" fullWidth onClick={() => goTo('dashboard')}>
        Retour
      </Button>
    </main>
  )
}
