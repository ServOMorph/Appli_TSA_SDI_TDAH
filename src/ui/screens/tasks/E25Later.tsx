import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  maxWidth: '480px',
  margin: '0 auto',
  minHeight: '100svh',
}

const backBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
  padding: 0,
  alignSelf: 'flex-start',
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const modalBox: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '360px',
  width: '90%',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-md)',
}

export function E25Later() {
  const { laterTasks, todayTasks, selectTask, goTo, moveTask } = useApp()
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null)

  async function handleMoveToToday(taskId: string) {
    if (todayTasks.length >= 3) {
      setPendingMoveId(taskId)
    } else {
      await moveTask(taskId, 'today')
    }
  }

  async function handleM04Replace(replacedId: string) {
    if (!pendingMoveId) return
    await moveTask(replacedId, 'inbox')
    await moveTask(pendingMoveId, 'today')
    setPendingMoveId(null)
  }

  function openDetail(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>Plus tard</h1>

      {laterTasks.length === 0 ? (
        <p aria-live="polite">Aucune tâche reportée.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {laterTasks.map((task) => (
            <Card key={task.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', padding: 0, textAlign: 'left', flex: 1 }}
                  onClick={() => openDetail(task.id)}
                >
                  {task.title}
                </button>
                <button
                  aria-label={`Déplacer ${task.title} vers Aujourd'hui`}
                  style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                  onClick={() => handleMoveToToday(task.id)}
                >
                  Aujourd'hui
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Button variant="secondary" fullWidth onClick={() => goTo('inbox')}>
        Voir l'inbox
      </Button>

      {pendingMoveId && (
        <div role="dialog" aria-modal="true" aria-label="Remplacer une tâche" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Choisir la tâche à remplacer</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Vous avez déjà 3 tâches aujourd'hui. Sélectionnez celle à déplacer vers l'inbox :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {todayTasks.map((t) => (
                <button
                  key={t.id}
                  aria-label={`Remplacer par ${t.title}`}
                  style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', textAlign: 'left' }}
                  onClick={() => handleM04Replace(t.id)}
                >
                  {t.title}
                </button>
              ))}
            </div>
            <Button variant="secondary" fullWidth onClick={() => setPendingMoveId(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
