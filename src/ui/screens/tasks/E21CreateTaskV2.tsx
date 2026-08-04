import { useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { IconPicker } from '@/ui/components/IconPicker'
import { ColorPicker } from '@/ui/components/ColorPicker'
import { DurationRoller } from '@/ui/components/DurationRoller'
import { RecurrenceEditor } from '@/ui/components/RecurrenceEditor'
import { todayDate } from '@/app/repositories'
import { ENERGY_MIN, ENERGY_MAX } from '@/domain/rules/energyRules'
import type { Screen } from '@/app/AppContext'
import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'
import type { TaskStatus } from '@/domain/entities/task'

type Destination = 'todo' | 'planned' | 'list' | 'today'

const FORCED_DESTINATION_BY_ORIGIN: Partial<Record<Screen, Destination>> = {
  inbox: 'todo',
  tools: 'todo',
  today: 'today',
  planning: 'planned',
  dashboard: 'planned',
  lists: 'list',
}

const DESTINATION_STATUS: Record<Exclude<Destination, 'list'>, TaskStatus> = {
  todo: 'inbox',
  today: 'today',
  planned: 'planned',
}

const DESTINATION_SCREEN: Record<Exclude<Destination, 'list'>, Screen> = {
  todo: 'inbox',
  today: 'today',
  planned: 'planning',
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

const fieldGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }

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

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'today', label: 'Tâche du jour' },
  { value: 'planned', label: 'Planifier' },
  { value: 'list', label: 'Mettre dans une liste' },
]

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

function destinationBtnStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
    backgroundColor: selected ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'var(--color-surface)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    width: '100%',
  }
}

export function E21CreateTaskV2() {
  const {
    goTo,
    lists,
    addListItem,
    addSubTask,
    createList,
    selectList,
    goToPath,
    createDetailedTask,
    back,
    originScreen,
    planningTargetDate,
  } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [energyCost, setEnergyCost] = useState<number | null>(null)
  const [essential, setEssential] = useState(false)
  const [subTasks, setSubTasks] = useState<string[]>([])
  const [subTaskInput, setSubTaskInput] = useState('')
  const [destination, setDestination] = useState<Destination | null>(null)
  const [date, setDate] = useState(planningTargetDate ?? todayDate())
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [recurring, setRecurring] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrenceRuleInput>(DEFAULT_RECURRENCE)
  const [showListPicker, setShowListPicker] = useState(false)
  const [newListName, setNewListName] = useState('')
  const forcedDestination = originScreen ? FORCED_DESTINATION_BY_ORIGIN[originScreen] : undefined
  const effectiveDestination = forcedDestination ?? destination
  const isPlanned = effectiveDestination === 'planned'
  const canSubmit = title.trim().length > 0 && !!effectiveDestination && (!isPlanned || startTime.length > 0)

  function returnToOrigin() {
    back('inbox')
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
    })
    for (const subTaskTitle of subTasks) {
      await addSubTask(taskId, subTaskTitle)
    }
    return taskId
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !effectiveDestination) return

    if (effectiveDestination === 'list') {
      setShowListPicker(true)
      return
    }

    await createFullTask(DESTINATION_STATUS[effectiveDestination])
    goTo(DESTINATION_SCREEN[effectiveDestination])
  }

  async function handleChooseList(listId: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    await addListItem(listId, trimmed)
    setShowListPicker(false)
    selectList(listId)
    goToPath(['lists', 'list-detail'])
  }

  async function handleCreateList() {
    const trimmed = title.trim()
    if (!trimmed || !newListName.trim()) return
    const listId = await createList(newListName.trim())
    await addListItem(listId, trimmed)
    setNewListName('')
    setShowListPicker(false)
    selectList(listId)
    goToPath(['lists', 'list-detail'])
  }

  return (
    <main style={pageStyle}>
      <button style={backBtnStyle} onClick={returnToOrigin} aria-label="Retour">
        &larr; Retour
      </button>

      <h1 style={{ margin: 0 }}>Nouvelle tâche</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div style={fieldGroupStyle}>
          <span style={labelStyle}>Icône</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <label htmlFor="task-title" style={labelStyle}>
            Titre de la tâche
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Que faut-il faire ?"
            autoFocus
            style={inputStyle}
          />
        </div>

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

        {!forcedDestination && (
          <div style={fieldGroupStyle}>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Que faire de cette tâche ?</p>
            {DESTINATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                aria-pressed={destination === d.value}
                onClick={() => setDestination(d.value)}
                style={destinationBtnStyle(destination === d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {isPlanned && (
          <div style={fieldGroupStyle}>
            <div>
              <label htmlFor="task-date" style={labelStyle}>
                Date
              </label>
              <input
                id="task-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="task-start-time" style={labelStyle}>
                Heure de début
              </label>
              <input
                id="task-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={inputStyle}
              />
              {!startTime && (
                <p style={{ margin: 'var(--spacing-xs) 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  L'heure de début est requise pour planifier la tâche.
                </p>
              )}
            </div>
            <div>
              <span style={labelStyle}>Durée</span>
              <DurationRoller minutes={durationMinutes} onChange={setDurationMinutes} />
            </div>
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
        <Button variant="secondary" fullWidth type="button" onClick={() => goTo('inbox')}>
          Annuler
        </Button>
      </form>

      {showListPicker && (
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
            <Button variant="secondary" fullWidth onClick={() => setShowListPicker(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

    </main>
  )
}
