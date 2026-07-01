import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import type { RoutineType } from '@/domain/entities/routine'

function typeLabel(type: RoutineType): string {
  return type === 'morning' ? 'Matin' : 'Soir'
}

export function E70Routines() {
  const { routines, createRoutine, selectRoutine, goTo } = useApp()
  const [showNewForm, setShowNewForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<RoutineType>('morning')
  const [duration, setDuration] = useState('90')
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate() {
    const trimmed = name.trim()
    const durationMinutes = parseInt(duration, 10)
    if (!trimmed || !durationMinutes || durationMinutes <= 0) return
    setSubmitting(true)
    await createRoutine(trimmed, type, durationMinutes)
    setName('')
    setType('morning')
    setDuration('90')
    setShowNewForm(false)
    setSubmitting(false)
  }

  function handleSelectRoutine(id: string) {
    selectRoutine(id)
    goTo('routine-detail')
  }

  const canCreate = name.trim().length > 0 && parseInt(duration, 10) > 0

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
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Mes routines</h1>
      </header>

      {routines.length === 0 && !showNewForm && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Aucune routine pour l'instant.
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
        {routines.map((routine) => (
          <li key={routine.id}>
            <button
              onClick={() => handleSelectRoutine(routine.id)}
              aria-label={routine.name}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{routine.name}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {typeLabel(routine.type)} · {routine.duration_minutes} min
              </span>
            </button>
          </li>
        ))}
      </ul>

      {showNewForm ? (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <label
              htmlFor="new-routine-name"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Nom de la routine
            </label>
            <input
              id="new-routine-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Ex : Routine matin"
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

            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: 0 }}>
                Type
              </legend>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="radio"
                    name="routine-type"
                    checked={type === 'morning'}
                    onChange={() => setType('morning')}
                  />
                  Matin
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="radio"
                    name="routine-type"
                    checked={type === 'evening'}
                    onChange={() => setType('evening')}
                  />
                  Soir
                </label>
              </div>
            </fieldset>

            <label
              htmlFor="new-routine-duration"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}
            >
              Durée (minutes)
            </label>
            <input
              id="new-routine-duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
              <Button fullWidth onClick={handleCreate} disabled={!canCreate || submitting}>
                Créer
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setShowNewForm(false)
                  setName('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button fullWidth onClick={() => setShowNewForm(true)}>
          Nouvelle routine
        </Button>
      )}
    </main>
  )
}
