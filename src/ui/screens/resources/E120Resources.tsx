import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'

type ResourceTab = 'foundations' | 'guide' | 'links'

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '12px 10px',
    border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface)',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    textAlign: 'center',
  }
}

const foundations = [
  {
    title: 'Réduire la charge mentale',
    text: 'L’application privilégie peu de choix visibles, des écrans courts et une action principale, car le projet vise à servir de système externe de fonctions exécutives plutôt que d’outil de productivité classique.',
  },
  {
    title: 'Rendre le prochain pas explicite',
    text: 'Le dashboard met en avant “Que faire maintenant ?” avec une règle déterministe : l’utilisateur n’a pas à prioriser seul quand l’initiation ou la décision devient coûteuse.',
  },
  {
    title: 'Respecter la tension TSA / TDAH',
    text: 'La structure reste stable et prévisible, tandis que le contenu peut varier légèrement. Ce choix répond au besoin de routine côté TSA sans ignorer le besoin de nouveauté et d’élan côté TDAH.',
  },
  {
    title: 'Traiter l’énergie comme une indication',
    text: "L’énergie est demandée comme repère du jour, pas comme mesure objective. La demande peut être ignorée, car l’auto-estimation de l’énergie peut être difficile, notamment en contexte d’alexithymie.",
  },
  {
    title: 'Prévoir la surcharge',
    text: 'Le mode surcharge est accessible directement et simplifie l’interface. Le principe retenu est qu’en surcharge, aller chercher une option dans les réglages demanderait déjà trop d’effort.',
  },
  {
    title: 'Garder le contrôle utilisateur',
    text: 'Les règles restent explicites, les suppressions sont confirmées et les données restent locales en MVP. Ces choix limitent les décisions opaques sur des informations personnelles sensibles.',
  },
]

const guide = [
  {
    title: 'Commencer par “Que faire maintenant ?”',
    text: 'Le dashboard sert de point de départ. Quand une tâche du jour existe, l’application affiche l’action à faire maintenant pour éviter de devoir choisir seul.',
  },
  {
    title: 'Capturer sans organiser tout de suite',
    text: `Le bouton “Ajouter une tâche” permet de noter rapidement une idée. Une tâche peut ensuite rester dans le Todo, être mise à Aujourd’hui ou être reportée à faire plus tard.`,
  },
  {
    title: 'Limiter la journée',
    text: 'La vue Aujourd’hui garde peu de tâches visibles. Si la limite est atteinte, l’application demande quoi remplacer au lieu d’empiler davantage.',
  },
  {
    title: 'Découper quand une tâche bloque',
    text: 'Depuis le détail d’une tâche, “Décomposer” sert à créer des sous-étapes. La prochaine sous-étape peut ensuite apparaître comme aide au démarrage.',
  },
  {
    title: "Indiquer son énergie si c’est utile",
    text: "L’énergie du jour peut être renseignée ou ignorée. L’ignorer n’a pas de conséquence punitive et l’application ne repropose pas automatiquement la question le même jour.",
  },
  {
    title: 'Activer le mode surcharge',
    text: 'Le bouton “Mode surcharge” simplifie l’interface quand continuer à naviguer devient trop coûteux. Le centre récupération reste accessible depuis ce mode.',
  },
  {
    title: 'Retrouver ses réglages et ses données',
    text: 'La roue des paramètres permet d’ajuster l’accessibilité, la stimulation, l’organisation, la confidentialité et l’export des données.',
  },
]

export function E120Resources() {
  const { goTo } = useApp()
  const [tab, setTab] = useState<ResourceTab>('foundations')

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
      <button style={backBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
        ← Retour
      </button>

      <div>
        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Ressources</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Comprendre et utiliser l’application.
        </p>
      </div>

      <nav
        aria-label="Sections ressources"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}
      >
        <button
          type="button"
          onClick={() => setTab('foundations')}
          aria-pressed={tab === 'foundations'}
          style={tabStyle(tab === 'foundations')}
        >
          Fondements de conception
        </button>
        <button
          type="button"
          onClick={() => setTab('guide')}
          aria-pressed={tab === 'guide'}
          style={tabStyle(tab === 'guide')}
        >
          Mode d’emploi de l’application
        </button>
        <button
          type="button"
          onClick={() => setTab('links')}
          aria-pressed={tab === 'links'}
          style={tabStyle(tab === 'links')}
        >
          Liens utiles
        </button>
      </nav>

      {tab === 'foundations' ? (
        <section aria-label="Fondements de conception">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {foundations.map((item) => (
              <Card key={item.title}>
                <h2 style={{ marginTop: 0, fontSize: '1rem' }}>{item.title}</h2>
                <p style={{ marginBottom: 0, color: 'var(--color-text-muted)' }}>{item.text}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : tab === 'guide' ? (
        <section aria-label="Mode d’emploi de l’application">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {guide.map((item) => (
              <Card key={item.title}>
                <h2 style={{ marginTop: 0, fontSize: '1rem' }}>{item.title}</h2>
                <p style={{ marginBottom: 0, color: 'var(--color-text-muted)' }}>{item.text}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <section aria-label="Liens utiles">
          <Card>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Liens utiles</h2>
            <p style={{ marginBottom: 0, color: 'var(--color-text-muted)' }}>
              En cours de développement.
            </p>
          </Card>
        </section>
      )}
    </main>
  )
}
