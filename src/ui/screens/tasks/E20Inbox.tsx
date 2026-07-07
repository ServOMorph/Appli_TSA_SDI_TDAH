import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { Task } from '@/domain/entities/task'

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

export function E20Inbox() {
  const {
    inboxTasks,
    inboxSubTasksMap,
    lists,
    selectTask,
    selectList,
    goTo,
    moveTask,
    startPlanTask,
    moveTodoTaskToList,
    createList,
  } = useApp()
  const [listPickerTask, setListPickerTask] = useState<Task | null>(null)
  const [newListName, setNewListName] = useState('')
  const [subtaskWarning, setSubtaskWarning] = useState<{ task: Task; action: 'plan' | 'list' } | null>(null)

  async function handleMoveToToday(taskId: string) {
    await moveTask(taskId, 'today')
  }

  function handlePlan(task: Task) {
    startPlanTask(task.title, task.id)
    goTo('planning')
  }

  async function handleChooseList(listId: string) {
    if (!listPickerTask) return
    await moveTodoTaskToList(listPickerTask.id, listId)
    setListPickerTask(null)
    selectList(listId)
    goTo('list-detail')
  }

  async function handleCreateList() {
    if (!listPickerTask || !newListName.trim()) return
    const listId = await createList(newListName.trim())
    await moveTodoTaskToList(listPickerTask.id, listId)
    setNewListName('')
    setListPickerTask(null)
    selectList(listId)
    goTo('list-detail')
  }

  function handleClickPlan(task: Task) {
    const subs = inboxSubTasksMap[task.id] ?? []
    if (subs.length > 0) {
      setSubtaskWarning({ task, action: 'plan' })
    } else {
      handlePlan(task)
    }
  }

  function handleClickList(task: Task) {
    const subs = inboxSubTasksMap[task.id] ?? []
    if (subs.length > 0) {
      setSubtaskWarning({ task, action: 'list' })
    } else {
      setListPickerTask(task)
    }
  }

  function confirmSubtaskWarning() {
    if (!subtaskWarning) return
    const { task, action } = subtaskWarning
    setSubtaskWarning(null)
    if (action === 'plan') {
      handlePlan(task)
    } else {
      setListPickerTask(task)
    }
  }

  function openDetail(task: Task) {
    selectTask(task.id)
    goTo('task-detail')
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={() => goTo('dashboard')} aria-label="Retour">
        ← Retour
      </button>

      <h1 style={{ margin: 0 }}>Todo</h1>

      {inboxTasks.length === 0 ? (
        <p aria-live="polite">Aucune tâche enregistrée.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {inboxTasks.map((task) => {
            const subs = inboxSubTasksMap[task.id] ?? []
            const done = subs.filter((s) => s.is_completed).length
            const total = subs.length
            return (
            <Card key={task.id} style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1rem', padding: 0, textAlign: 'left', flex: 1 }}
                  onClick={() => openDetail(task)}
                >
                  {task.title}
                </button>
                {total > 0 && (
                  <span
                    aria-label={`${done} sur ${total} étapes`}
                    style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}
                  >
                    {done}/{total}
                  </span>
                )}
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                  <button
                    aria-label={`Déplacer ${task.title} vers Tâche du jour`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    onClick={() => handleMoveToToday(task.id)}
                  >
                    Tâche du jour
                  </button>
                  <button
                    aria-label={`Planifier ${task.title}`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    onClick={() => handleClickPlan(task)}
                  >
                    Planifier
                  </button>
                  <button
                    aria-label={`Ajouter ${task.title} à une liste`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    onClick={() => handleClickList(task)}
                  >
                    Liste
                  </button>
                </div>
              </div>
            </Card>
            )
          })}
        </div>
      )}

      <Button fullWidth onClick={() => goTo('task-create-v2')}>
        Ajouter une tâche
      </Button>

      {listPickerTask && (
        <div role="dialog" aria-modal="true" aria-label="Choisir une liste" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter à une liste</h2>
            {lists.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Aucune liste pour l'instant.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {lists.map((l) => (
                  <button
                    key={l.id}
                    aria-label={`Ajouter à ${l.name}`}
                    style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', cursor: 'pointer', color: 'var(--color-text)', textAlign: 'left' }}
                    onClick={() => handleChooseList(l.id)}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nouvelle liste"
                aria-label="Nom de la nouvelle liste"
                style={{ flex: 1, padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
              <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                Créer
              </Button>
            </div>
            <Button variant="secondary" fullWidth onClick={() => setListPickerTask(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {subtaskWarning && (
        <div role="dialog" aria-modal="true" aria-label="Sous-tâches perdues" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Sous-tâches non conservées</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              {(() => {
                const count = (inboxSubTasksMap[subtaskWarning.task.id] ?? []).length
                return `« ${subtaskWarning.task.title} » a ${count} sous-tâche${count > 1 ? 's' : ''}. ${
                  count > 1 ? 'Elles seront' : 'Elle sera'
                } supprimée${count > 1 ? 's' : ''} et ne sera pas reportée sur la nouvelle destination. Continuer ?`
              })()}
            </p>
            <Button fullWidth onClick={confirmSubtaskWarning}>
              Continuer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setSubtaskWarning(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
