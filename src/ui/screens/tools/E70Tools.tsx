import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
  paddingBottom: 'var(--bottomnav-h)',
}

const entryBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  padding: 0,
}

export function E70Tools() {
  const { goTo, lists, selectList } = useApp()
  const pinnedLists = lists.filter((l) => l.pinned_to_tools)

  function handleOpenList(id: string) {
    selectList(id)
    goTo('list-detail')
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => goTo('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Outils</h1>
      </header>

      <Card>
        <button style={entryBtnStyle} onClick={() => goTo('inbox')}>
          Todo
        </button>
      </Card>

      <Card>
        <button style={entryBtnStyle} onClick={() => goTo('budget')}>
          Budget
        </button>
      </Card>

      <section>
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm) 0' }}>Listes épinglées</h2>
        {pinnedLists.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Aucune liste épinglée pour l'instant.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {pinnedLists.map((list) => (
              <li key={list.id}>
                <Card>
                  <button style={entryBtnStyle} onClick={() => handleOpenList(list.id)}>
                    {list.name}
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
