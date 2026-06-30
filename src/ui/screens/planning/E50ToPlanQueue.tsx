import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function E50ToPlanQueue() {
  const { toPlanTasks, scheduleV2Task, goTo } = useApp()

  const [index, setIndex] = useState(0)
  const [date, setDate] = useState(todayIso())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('09:30')
  const [submitting, setSubmitting] = useState(false)

  const task = toPlanTasks[index]

  if (!task) {
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
          alignItems: 'center',
        }}
      >
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Toutes les tâches ont été planifiées.
        </p>
        <Button fullWidth onClick={() => goTo('dashboard')}>
          Retour au tableau de bord
        </Button>
      </main>
    )
  }

  async function handleSchedule() {
    setSubmitting(true)
    await scheduleV2Task(task.id, date, start, end)
    setDate(todayIso())
    setStart('09:00')
    setEnd('09:30')
    setIndex((prev) => prev + 1)
    setSubmitting(false)
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
          onClick={() => goTo('dashboard')}
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
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>À planifier</h1>
      </header>

      <Card>
        <p
          aria-label="Tâche à planifier"
          style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}
        >
          {task.title}
        </p>
      </Card>

      <section aria-label="Choisir date et heure" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="tpq-date" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Date
          </label>
          <input
            id="tpq-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="tpq-start" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Début
            </label>
            <input
              id="tpq-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
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
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="tpq-end" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Fin
            </label>
            <input
              id="tpq-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
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
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'auto' }}>
        <Button fullWidth onClick={handleSchedule} disabled={submitting}>
          Planifier
        </Button>
        <Button variant="secondary" fullWidth onClick={() => goTo('dashboard')}>
          Arrêter
        </Button>
      </div>
    </main>
  )
}
