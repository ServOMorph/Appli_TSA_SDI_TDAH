import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { RoutineStep } from '@/domain/entities/routineStep'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6)

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function E71RoutineDetail() {
  const {
    routines,
    selectedRoutineId,
    getRoutineSteps,
    addRoutineStep,
    deleteRoutineStep,
    toggleRoutineStep,
    scheduleRoutine,
    goTo,
  } = useApp()
  const routine = routines.find((r) => r.id === selectedRoutineId) ?? null

  const [steps, setSteps] = useState<RoutineStep[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(todayStr())
  const [scheduleHour, setScheduleHour] = useState(HOURS[0])

  useEffect(() => {
    if (!selectedRoutineId) return
    getRoutineSteps(selectedRoutineId).then(setSteps)
  }, [selectedRoutineId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || !selectedRoutineId) return
    setSubmitting(true)
    await addRoutineStep(selectedRoutineId, title)
    const updated = await getRoutineSteps(selectedRoutineId)
    setSteps(updated)
    setNewTitle('')
    setShowAddForm(false)
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await deleteRoutineStep(id)
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleToggle(step: RoutineStep) {
    await toggleRoutineStep(step)
    setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, is_completed: !s.is_completed } : s)))
  }

  async function handleSchedule() {
    if (!selectedRoutineId) return
    const start = `${String(scheduleHour).padStart(2, '0')}:00`
    await scheduleRoutine(selectedRoutineId, scheduleDate, start)
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
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => goTo('routines')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--color-text)',
            padding: 0,
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{routine?.name ?? 'Routine'}</h1>
      </header>

      {steps.length === 0 && !showAddForm && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Cette routine n'a pas d'étape.
        </p>
      )}

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
        {steps.map((step) => (
          <li
            key={step.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <input
                type="checkbox"
                checked={step.is_completed}
                onChange={() => handleToggle(step)}
                aria-label={`Étape ${step.title}`}
              />
              <span
                style={{
                  textDecoration: step.is_completed ? 'line-through' : 'none',
                  color: step.is_completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                }}
              >
                {step.title}
              </span>
            </label>
            <button
              aria-label={`Supprimer ${step.title}`}
              onClick={() => handleDelete(step.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                color: 'var(--color-text-muted)',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showAddForm ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <label
              htmlFor="new-step-title"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Étape
            </label>
            <input
              id="new-step-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              autoFocus
              placeholder="Nom de l'étape…"
              style={{
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button fullWidth onClick={handleAdd} disabled={!newTitle.trim() || submitting}>
                Ajouter
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowAddForm(false)
                  setNewTitle('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button fullWidth onClick={() => setShowAddForm(true)}>
          Ajouter une étape
        </Button>
      )}

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>Réserver un créneau</p>
          {routine?.scheduled_date && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Prévue le {routine.scheduled_date} à {routine.scheduled_start}
            </p>
          )}
          <label htmlFor="routine-schedule-date" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Date
          </label>
          <input
            id="routine-schedule-date"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
            }}
          />
          <label htmlFor="routine-schedule-hour" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Heure de début
          </label>
          <select
            id="routine-schedule-hour"
            value={scheduleHour}
            onChange={(e) => setScheduleHour(parseInt(e.target.value, 10))}
            style={{
              padding: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
            }}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}h00
              </option>
            ))}
          </select>
          <Button fullWidth onClick={handleSchedule}>
            Placer dans le planning
          </Button>
        </div>
      </Card>
    </main>
  )
}
