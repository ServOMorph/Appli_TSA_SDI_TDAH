import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import {
  DAY_COUNT,
  DAY_LABELS,
  LEVELS,
  generatePuzzle,
  hint,
  solve,
  validate,
  type Level,
  type Placement,
  type PlanTask,
  type Puzzle,
  type Validation,
} from './logic'

const LEVEL_LABELS: Record<Level, string> = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile' }
const POOL_ID = 'pool'

function emptyPlacement(puzzle: Puzzle): Placement {
  return Object.fromEntries(puzzle.tasks.map((t) => [t.id, null]))
}

function TaskChip({
  task,
  puzzle,
  validation,
  selected,
  onSelect,
}: {
  task: PlanTask
  puzzle: Puzzle
  validation: Validation
  selected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const prereq = task.after ? puzzle.tasks.find((t) => t.id === task.after) : undefined
  const missed = validation.deadlineMissed.has(task.id)
  const broken = validation.orderBroken.has(task.id)
  const flagged = missed || broken

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        textAlign: 'left',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: selected
          ? '3px solid var(--color-accent)'
          : flagged
            ? '2px solid var(--color-warning)'
            : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        cursor: 'grab',
        touchAction: 'none',
        fontFamily: 'var(--font-body)',
        fontSize: '0.95rem',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
    >
      <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
        {task.name}
        <span
          aria-label={`énergie ${task.cost}`}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '0 8px',
            fontSize: '0.85rem',
          }}
        >
          {task.cost}
        </span>
      </span>
      {task.deadline !== null && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Avant la fin de {DAY_LABELS[task.deadline].toLowerCase()}
        </span>
      )}
      {prereq && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Après : {prereq.name}</span>
      )}
      {missed && <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>Échéance dépassée</span>}
      {broken && <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>Ordre non respecté</span>}
    </button>
  )
}

function Zone({
  id,
  title,
  caption,
  excess,
  ratio,
  hasSelection,
  placeLabel,
  onPlace,
  children,
}: {
  id: string
  title: string
  caption?: string
  excess?: number
  ratio?: number
  hasSelection: boolean
  placeLabel: string
  onPlace: () => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const over = (excess ?? 0) > 0
  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: `2px ${isOver ? 'solid' : 'dashed'} ${isOver ? 'var(--color-accent)' : over ? 'var(--color-warning)' : 'var(--color-border)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
        <strong>{title}</strong>
        <span style={{ color: over ? 'var(--color-warning)' : 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {caption}
          {over ? ` - dépasse de ${excess}` : ''}
        </span>
      </div>
      {ratio !== undefined && (
        <div
          aria-hidden="true"
          style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-border)', overflow: 'hidden' }}
        >
          <div
            style={{
              width: `${Math.min(100, ratio * 100)}%`,
              height: '100%',
              backgroundColor: over ? 'var(--color-warning)' : 'var(--color-accent)',
            }}
          />
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', minHeight: 24 }}>{children}</div>
      {hasSelection && (
        <Button variant="secondary" onClick={onPlace} style={{ padding: '6px 12px', alignSelf: 'flex-start' }}>
          {placeLabel}
        </Button>
      )}
    </div>
  )
}

export function PlanningEnergie() {
  const [level, setLevel] = useState<Level>('moyen')
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('moyen'))
  const [placement, setPlacement] = useState<Placement>(() => emptyPlacement(puzzle))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const validation = validate(puzzle, placement)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  function newWeek(nextLevel: Level = level) {
    const next = generatePuzzle(nextLevel)
    setLevel(nextLevel)
    setPuzzle(next)
    setPlacement(emptyPlacement(next))
    setSelectedId(null)
    setMessage('')
  }

  function move(taskId: string, target: number | null) {
    setPlacement((prev) => ({ ...prev, [taskId]: target }))
    setSelectedId(null)
    setMessage('')
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.over) return
    const overId = String(event.over.id)
    move(String(event.active.id), overId === POOL_ID ? null : Number(overId.replace('day-', '')))
  }

  function check() {
    const result = solve(puzzle, placement)
    if (result === 'unknown') setMessage('Vérification trop complexe : impossible de conclure.')
    else if (result === null) setMessage('Avec ces placements, plus aucune solution n’est possible. Retirez-en un.')
    else setMessage('Une solution reste possible avec ces placements.')
  }

  function giveHint() {
    const h = hint(puzzle, placement)
    if (h.kind === 'impasse') setMessage('Avec ces placements, plus aucune solution n’est possible. Retirez-en un.')
    else if (h.kind === 'unknown') setMessage('Pas d’indice disponible.')
    else {
      const task = puzzle.tasks.find((t) => t.id === h.taskId)
      setMessage(`Indice : « ${task?.name} » peut aller le ${DAY_LABELS[h.day].toLowerCase()}.`)
    }
  }

  const unplacedTasks = puzzle.tasks.filter((t) => placement[t.id] === null)
  const selectedTask = selectedId ? puzzle.tasks.find((t) => t.id === selectedId) : undefined
  const totalCost = puzzle.tasks.reduce((s, t) => s + t.cost, 0)
  const totalCapacity = puzzle.capacities.reduce((s, c) => s + c, 0)

  function chip(task: PlanTask) {
    return (
      <TaskChip
        key={task.id}
        task={task}
        puzzle={puzzle}
        validation={validation}
        selected={task.id === selectedId}
        onSelect={() => setSelectedId((cur) => (cur === task.id ? null : task.id))}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div role="group" aria-label="Niveau" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Niveau</span>
            {LEVELS.map((l) => (
              <Button
                key={l}
                variant={l === level ? 'primary' : 'secondary'}
                aria-pressed={l === level}
                onClick={() => newWeek(l)}
                style={{ padding: '8px 14px' }}
              >
                {LEVEL_LABELS[l]}
              </Button>
            ))}
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Placez toutes les tâches sur la semaine sans dépasser l&apos;énergie de chaque jour, en respectant les
            échéances et l&apos;ordre indiqué. Énergie à placer : {totalCost} sur {totalCapacity} disponibles.
          </p>
        </div>
      </Card>

      <p style={{ margin: 0, fontWeight: 600 }} aria-live="polite">
        {validation.complete
          ? 'Semaine équilibrée : tout est placé dans les limites.'
          : unplacedTasks.length > 0
            ? `${unplacedTasks.length} tâche${unplacedTasks.length > 1 ? 's' : ''} à placer.`
            : 'Tout est placé : corrigez les points signalés.'}
      </p>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <Zone
          id={POOL_ID}
          title="À placer"
          hasSelection={selectedTask !== undefined && placement[selectedTask.id] !== null}
          placeLabel="Remettre à placer"
          onPlace={() => selectedId && move(selectedId, null)}
        >
          {unplacedTasks.map(chip)}
        </Zone>

        {Array.from({ length: DAY_COUNT }, (_, d) => (
          <Zone
            key={d}
            id={`day-${d}`}
            title={DAY_LABELS[d]}
            caption={`énergie ${validation.loads[d]} / ${puzzle.capacities[d]}`}
            excess={validation.excess[d]}
            ratio={validation.loads[d] / puzzle.capacities[d]}
            hasSelection={selectedTask !== undefined && placement[selectedTask.id] !== d}
            placeLabel="Placer ici"
            onPlace={() => selectedId && move(selectedId, d)}
          >
            {puzzle.tasks.filter((t) => placement[t.id] === d).map(chip)}
          </Zone>
        ))}
      </DndContext>

      {message && (
        <p role="status" style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          {message}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="secondary" onClick={check}>
          Vérifier
        </Button>
        <Button variant="secondary" onClick={giveHint}>
          Indice
        </Button>
        <Button variant="secondary" onClick={() => setPlacement(emptyPlacement(puzzle))}>
          Tout retirer
        </Button>
        <Button variant={validation.complete ? 'primary' : 'secondary'} onClick={() => newWeek()}>
          Nouvelle semaine
        </Button>
      </div>
    </div>
  )
}
