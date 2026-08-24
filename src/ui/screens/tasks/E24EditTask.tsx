import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { IconPicker } from '@/ui/components/IconPicker'
import { ColorPicker } from '@/ui/components/ColorPicker'
import { DurationRoller } from '@/ui/components/DurationRoller'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import { todayDate } from '@/app/repositories'
import type { Task } from '@/domain/entities/task'
import type { TaskEditScope, TaskFieldEdit } from '@/app/contexts/usePlanningState'

const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 'var(--spacing-sm)',
  color: 'var(--color-text-muted)',
}

const fieldGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', minWidth: 0 }

const energyGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 'var(--spacing-xs)',
}

function energyGridButtonStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '10px 0',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: selected ? 'var(--color-accent)' : 'var(--color-surface)',
    color: selected ? '#fff' : 'var(--color-text)',
    fontSize: '0.9375rem',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
  }
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

export function E24EditTask() {
  const { selectedTaskId, inboxTasks, todayTasks, getTaskById, updateTaskFields, goTo, back } = useApp()

  const taskFromLists = [...inboxTasks, ...todayTasks].find((t) => t.id === selectedTaskId)
  const [fetchedTask, setFetchedTask] = useState<Task | null>(null)
  const task = taskFromLists ?? fetchedTask ?? undefined

  useEffect(() => {
    if (selectedTaskId && !taskFromLists) {
      getTaskById(selectedTaskId).then((t) => setFetchedTask(t ?? null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskId])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)
  const [date, setDate] = useState(todayDate())
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [pendingEdit, setPendingEdit] = useState<TaskFieldEdit | null>(null)

  useEffect(() => {
    if (task && !initialized) {
      setTitle(task.title)
      setDescription(task.description)
      setIcon(task.icon)
      setColor(task.color)
      setEnergyCost(task.energy_cost)
      setEssential(task.essential)
      setDate(task.scheduled_date ?? todayDate())
      setStartTime(task.scheduled_start ?? '')
      setDurationMinutes(task.duration_minutes)
      setInitialized(true)
    }
  }, [task, initialized])

  const canSubmit = title.trim().length > 0

  function returnToDetail() {
    back('task-detail')
  }

  async function saveEdit(edit: TaskFieldEdit, scope: TaskEditScope) {
    if (!selectedTaskId) return
    await updateTaskFields(selectedTaskId, edit, scope)
    goTo('task-detail')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !task) return
    const edit: TaskFieldEdit = {
      title: title.trim(),
      description,
      icon,
      color,
      energyCost,
      essential,
      date,
      startTime: startTime || null,
      durationMinutes,
    }
    if (task.recurrence_id) {
      setPendingEdit(edit)
    } else {
      await saveEdit(edit, 'occurrence')
    }
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

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={returnToDetail} aria-label="Retour">
        &larr; Retour
      </button>

      <h1 style={{ margin: 0 }}>Modifier la tâche</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div style={fieldGroupStyle}>
          <span style={labelStyle}>Icône</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <label htmlFor="edit-task-title" style={labelStyle}>
            Titre de la tâche
          </label>
          <input
            id="edit-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="edit-task-description" style={labelStyle}>
            Description
          </label>
          <textarea
            id="edit-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={fieldGroupStyle}>
          <span style={labelStyle}>Couleur</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div style={fieldGroupStyle}>
          <span style={labelStyle}>Coût en énergie</span>
          <div style={energyGridStyle} role="group" aria-label="Coût en énergie">
            {ENERGY_OPTIONS.map((v) => (
              <button
                key={v}
                type="button"
                style={energyGridButtonStyle(energyCost === v)}
                onClick={() => setEnergyCost((current) => (current === v ? null : v))}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
          <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
          Obligatoire
        </label>

        <div style={fieldGroupStyle}>
          <div style={{ minWidth: 0 }}>
            <label htmlFor="edit-task-date" style={labelStyle}>
              Date
            </label>
            <input
              id="edit-task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, minWidth: 0, maxWidth: '100%' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <label htmlFor="edit-task-start-time" style={labelStyle}>
              Heure de début
            </label>
            <input
              id="edit-task-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ ...inputStyle, minWidth: 0, maxWidth: '100%' }}
            />
          </div>
          <div>
            <span style={labelStyle}>Durée</span>
            <DurationRoller minutes={durationMinutes} onChange={setDurationMinutes} />
          </div>
        </div>

        <Button fullWidth type="submit" disabled={!canSubmit}>
          Enregistrer
        </Button>
        <Button variant="secondary" fullWidth type="button" onClick={returnToDetail}>
          Annuler
        </Button>
      </form>

      {pendingEdit && (
        <div role="dialog" aria-modal="true" aria-label="Modifier la série récurrente" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Tâche récurrente</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
              Appliquer la modification à cette occurrence seulement, ou à toutes les occurrences
              futures de la série ?
            </p>
            <Button fullWidth onClick={() => saveEdit(pendingEdit, 'occurrence')}>
              Cette occurrence
            </Button>
            <Button fullWidth onClick={() => saveEdit(pendingEdit, 'series')}>
              Toutes les occurrences
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setPendingEdit(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
