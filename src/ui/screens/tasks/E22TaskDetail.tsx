import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { SubTask } from '@/domain/entities/subTask'
import type { Task } from '@/domain/entities/task'
import type { Screen } from '@/app/AppContext'

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

function backScreenForTask(task: Task): Screen {
  if (task.status === 'today') return 'today'
  if (task.status === 'later') return 'later'
  return 'inbox'
}

export function E22TaskDetail() {
  const {
    selectedTaskId,
    inboxTasks,
    todayTasks,
    laterTasks,
    getSubTasks,
    toggleSubTask,
    completeTask,
    deleteTask,
    selectTask,
    goTo,
  } = useApp()

  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const task = [...inboxTasks, ...todayTasks, ...laterTasks].find((t) => t.id === selectedTaskId)

  useEffect(() => {
    if (selectedTaskId) {
      getSubTasks(selectedTaskId).then(setSubTasks)
    }
  }, [selectedTaskId])

  async function handleToggle(subTask: SubTask) {
    await toggleSubTask(subTask)
    if (selectedTaskId) {
      const updated = await getSubTasks(selectedTaskId)
      setSubTasks(updated)
    }
  }

  async function handleComplete() {
    if (!selectedTaskId) return
    await completeTask(selectedTaskId)
    selectTask(null)
    goTo('dashboard')
  }

  async function handleDelete() {
    if (!selectedTaskId) return
    await deleteTask(selectedTaskId)
    selectTask(null)
    goTo(task ? backScreenForTask(task) : 'inbox')
  }

  if (!task) {
    return (
      <main style={pageStyle}>
        <button style={backBtnStyle} onClick={() => goTo('inbox')} aria-label="Retour">
          ← Retour
        </button>
        <p>Tâche introuvable.</p>
      </main>
    )
  }

  const back = backScreenForTask(task)

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo(back)} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>{task.title}</h1>

      {subTasks.length > 0 && (
        <section aria-label="Sous-étapes">
          <h2>Sous-étapes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {subTasks.map((st) => (
              <Card key={st.id} style={{ padding: 'var(--spacing-md)' }}>
                <label style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={st.is_completed}
                    onChange={() => handleToggle(st)}
                    aria-label={st.title}
                  />
                  <span style={{ textDecoration: st.is_completed ? 'line-through' : 'none', color: st.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                    {st.title}
                  </span>
                </label>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <Button fullWidth onClick={() => goTo('task-decompose')}>
          Décomposer
        </Button>
        <Button fullWidth onClick={handleComplete}>
          Terminer
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(true)}>
          Supprimer
        </Button>
      </div>

      {showDeleteConfirm && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la tâche" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette tâche ?</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Cette action est irréversible.
            </p>
            <Button fullWidth onClick={handleDelete}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
