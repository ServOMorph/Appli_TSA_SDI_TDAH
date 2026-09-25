import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { IconPicker } from '@/ui/components/IconPicker'
import { ColorPicker } from '@/ui/components/ColorPicker'
import { DurationRoller } from '@/ui/components/DurationRoller'
import { RecurrenceEditor } from '@/ui/components/RecurrenceEditor'
import { TaskCardLayout, TaskFieldCard, IconFieldValue, ColorFieldValue } from '@/ui/components/TaskCardLayout'
import { todayDate } from '@/app/repositories'
import { formatFrenchDate } from '@/domain/rules/planningSlotRules'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import type { Screen } from '@/app/AppContext'
import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'
import type { TaskStatus } from '@/domain/entities/task'

type FieldKey = 'icon' | 'color' | 'date' | 'time' | 'energy'

type Destination = 'todo' | 'planned'

const DEFAULT_DESTINATION: Destination = 'todo'

const FORCED_DESTINATION_BY_ORIGIN: Partial<Record<Screen, Destination>> = {
  inbox: 'todo',
  tools: 'todo',
  planning: 'planned',
  dashboard: 'planned',
}

const DESTINATION_STATUS: Record<Destination, TaskStatus> = {
  todo: 'inbox',
  planned: 'planned',
}

const DESTINATION_SCREEN: Record<Destination, Screen> = {
  todo: 'inbox',
  planned: 'dashboard',
}

const ENERGY_OPTIONS = Array.from({ length: ENERGY_MAX - ENERGY_MIN + 1 }, (_, i) => ENERGY_MIN + i)

const DEFAULT_RECURRENCE: RecurrenceRuleInput = {
  frequency: 'weekly',
  interval: 1,
  weekdays: null,
  end_type: 'never',
  end_date: null,
  end_count: null,
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 'var(--spacing-xl)',
  gap: 'var(--spacing-lg)',
  width: '100%',
  minWidth: 0,
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
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
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

const subTaskRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
}

const removeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  fontSize: '1.125rem',
  lineHeight: 1,
}

export function E21CreateTaskV2() {
  const {
    goTo,
    createDetailedTask,
    back,
    originScreen,
    taskCategories,
  } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)
  const [subTasks, setSubTasks] = useState<string[]>([])
  const [subTaskInput, setSubTaskInput] = useState('')
  const [date, setDate] = useState(todayDate())
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [recurring, setRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrenceRuleInput>(DEFAULT_RECURRENCE)
  const [expandedField, setExpandedField] = useState<FieldKey | null>(null)
  const effectiveDestination = (originScreen ? FORCED_DESTINATION_BY_ORIGIN[originScreen] : undefined) ?? DEFAULT_DESTINATION
  const isPlanned = effectiveDestination === 'planned'
  const hasDuration = durationMinutes != null && durationMinutes > 0
  const canSubmit =
    title.trim().length > 0 && (!isPlanned || (startTime.length > 0 && hasDuration))

  function returnToOrigin() {
    back('inbox')
  }

  function toggleField(field: FieldKey) {
    setExpandedField((current) => (current === field ? null : field))
  }

  function addSubTaskEntry() {
    const trimmed = subTaskInput.trim()
    if (!trimmed) return
    setSubTasks((prev) => [...prev, trimmed])
    setSubTaskInput('')
  }

  function removeSubTaskEntry(index: number) {
    setSubTasks((prev) => prev.filter((_, i) => i !== index))
  }

  async function createFullTask(status: TaskStatus): Promise<string> {
    const taskId = await createDetailedTask({
      title,
      description,
      icon,
      color,
      energyCost,
      essential,
      durationMinutes,
      date: isPlanned ? date : null,
      startTime: isPlanned && startTime ? startTime : null,
      status,
      recurrence: isPlanned && recurring ? recurrence : null,
      subTaskTitles: subTasks,
    })
    return taskId
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !effectiveDestination) return

    await createFullTask(DESTINATION_STATUS[effectiveDestination])
    goTo(DESTINATION_SCREEN[effectiveDestination])
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={returnToOrigin} aria-label="Retour">
        &larr; Retour
      </button>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', width: '100%', minWidth: 0 }}>
        <TaskCardLayout
          icon={icon}
          color={color}
          titleSlot={
            <div>
              <label htmlFor="task-title" style={{ ...labelStyle, color: color ? 'inherit' : 'var(--color-text-muted)' }}>
                Titre de la tâche
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Que faut-il faire ?"
                style={inputStyle}
              />
            </div>
          }
        >
          <TaskFieldCard
            label="Icône"
            value={<IconFieldValue icon={icon} />}
            color={color}
            expanded={expandedField === 'icon'}
            onToggle={() => toggleField('icon')}
          >
            <IconPicker
              value={icon}
              onChange={(v) => {
                setIcon(v)
                setExpandedField(null)
              }}
            />
          </TaskFieldCard>

          <TaskFieldCard
            label="Couleur"
            value={<ColorFieldValue color={color} categories={taskCategories} />}
            color={color}
            expanded={expandedField === 'color'}
            onToggle={() => toggleField('color')}
          >
            <ColorPicker
              value={color}
              onChange={(v) => {
                setColor(v)
                setExpandedField(null)
              }}
              categories={taskCategories}
            />
          </TaskFieldCard>

          {isPlanned && (
            <TaskFieldCard
              label="Date"
              value={formatFrenchDate(date)}
              color={color}
              expanded={expandedField === 'date'}
              onToggle={() => toggleField('date')}
            >
              <input
                type="date"
                aria-label="Date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setExpandedField(null)
                }}
                style={{ ...inputStyle, minWidth: 0, maxWidth: '100%', WebkitAppearance: 'none', appearance: 'none' }}
              />
            </TaskFieldCard>
          )}

          {isPlanned && (
            <TaskFieldCard
              label="Horaire"
              value={startTime ? `${startTime} (${durationMinutes ?? 0} min)` : 'Non planifié'}
              color={color}
              expanded={expandedField === 'time'}
              onToggle={() => toggleField('time')}
            >
              <label htmlFor="task-start-time" style={labelStyle}>
                Heure de début
              </label>
              <input
                id="task-start-time"
                type="time"
                aria-label="Heure de début"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ ...inputStyle, minWidth: 0, maxWidth: '100%', WebkitAppearance: 'none', appearance: 'none' }}
              />
              {!startTime && (
                <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  L'heure de début est requise pour planifier la tâche.
                </p>
              )}
              <span style={labelStyle}>Durée</span>
              <DurationRoller minutes={durationMinutes} onChange={setDurationMinutes} />
              {!hasDuration && (
                <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  La durée est obligatoire pour planifier la tâche.
                </p>
              )}
              <Button fullWidth type="button" onClick={() => setExpandedField(null)}>
                Fermer
              </Button>
            </TaskFieldCard>
          )}

          <TaskFieldCard
            label="Coût en énergie"
            value={energyCost ?? 'Non défini'}
            color={color}
            expanded={expandedField === 'energy'}
            onToggle={() => toggleField('energy')}
          >
            <div style={energyGridStyle} role="group" aria-label="Coût en énergie">
              {ENERGY_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  style={energyGridButtonStyle(energyCost === v)}
                  onClick={() => {
                    setEnergyCost((current) => (current === v ? null : v))
                    setExpandedField(null)
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </TaskFieldCard>
        </TaskCardLayout>

        <div style={fieldGroupStyle}>
          <span style={labelStyle}>Sous-tâches</span>
          {subTasks.map((st, i) => (
            <div key={i} style={subTaskRowStyle}>
              <span>{st}</span>
              <button type="button" aria-label={`Retirer ${st}`} style={removeBtnStyle} onClick={() => removeSubTaskEntry(i)}>
                &times;
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <input
              type="text"
              value={subTaskInput}
              onChange={(e) => setSubTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSubTaskEntry()
                }
              }}
              placeholder="Ajouter une sous-tâche"
              aria-label="Nouvelle sous-tâche"
              style={{ ...inputStyle, flex: 1 }}
            />
            <Button type="button" onClick={addSubTaskEntry} disabled={!subTaskInput.trim()}>
              Ajouter
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="task-description" style={labelStyle}>
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
          <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} />
          Obligatoire
        </label>

        {isPlanned && (
          <div style={fieldGroupStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              Tâche récurrente
            </label>
            {recurring && <RecurrenceEditor value={recurrence} onChange={setRecurrence} />}
          </div>
        )}

        <Button fullWidth type="submit" disabled={!canSubmit}>
          Valider
        </Button>
        <Button variant="secondary" fullWidth type="button" onClick={returnToOrigin}>
          Annuler
        </Button>
      </form>
    </main>
  )
}
