import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { ColorPicker } from '@/ui/components/ColorPicker'
import { RoutineWeekdayPicker } from '@/ui/components/RoutineWeekdayPicker'
import { RoutineTimeKeypad } from '@/ui/components/RoutineTimeKeypad'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'
import { dangerLinkStyle, inputStyle, modalBox, modalOverlay, neutralLinkStyle, pageStyle } from '@/ui/styles/routine'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const WEEKDAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

interface SortableStepRowProps {
  step: RoutineStep
  onEdit: (step: RoutineStep) => void
  onDelete: (id: string) => void
}

function SortableStepRow({ step, onEdit, onDelete }: SortableStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-sm)',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <span aria-hidden style={{ fontSize: '1rem', color: 'var(--color-text-muted)', flexShrink: 0, lineHeight: 1 }}>⠿</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span>{step.title}</span>
        {step.duration_minutes && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}> · {step.duration_minutes} min</span>
        )}
      </div>
      <button
        aria-label={`Modifier ${step.title}`}
        onClick={(e) => {
          e.stopPropagation()
          onEdit(step)
        }}
        style={neutralLinkStyle}
      >
        Modifier
      </button>
      <button
        aria-label={`Supprimer ${step.title}`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(step.id)
        }}
        style={dangerLinkStyle}
      >
        Supprimer
      </button>
    </li>
  )
}

function parsedDuration(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const amount = Number(trimmed)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function E79RoutineDetail() {
  const {
    routines,
    tools,
    selectedRoutineId,
    renameRoutine,
    updateRoutineColor,
    getRoutineSteps,
    addRoutineStep,
    updateRoutineStep,
    deleteRoutineStep,
    reorderRoutineSteps,
    getRoutineSchedules,
    setRoutineDaySchedule,
    removeRoutineDaySchedule,
    deleteTool,
    back,
  } = useApp()

  const routine = routines.find((r) => r.id === selectedRoutineId) ?? null
  const tool = tools.find((t) => t.type === 'routine' && t.routine_id === selectedRoutineId) ?? null

  const [steps, setSteps] = useState<RoutineStep[]>([])
  const [schedules, setSchedules] = useState<RoutineSchedule[]>([])
  const [renaming, setRenaming] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [stepTitle, setStepTitle] = useState('')
  const [stepDuration, setStepDuration] = useState('')
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null)
  const [editStepTitle, setEditStepTitle] = useState('')
  const [editStepDuration, setEditStepDuration] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [schedulingWeekday, setSchedulingWeekday] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedRoutineId) return
    getRoutineSteps(selectedRoutineId).then(setSteps)
    getRoutineSchedules(selectedRoutineId).then(setSchedules)
  }, [selectedRoutineId, getRoutineSteps, getRoutineSchedules])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function refresh() {
    if (!selectedRoutineId) return
    setSteps(await getRoutineSteps(selectedRoutineId))
  }

  async function refreshSchedules() {
    if (!selectedRoutineId) return
    setSchedules(await getRoutineSchedules(selectedRoutineId))
  }

  const currentSchedule = schedulingWeekday !== null ? schedules.find((s) => s.weekday === schedulingWeekday) ?? null : null

  async function handleScheduleDay(time: string) {
    if (!routine || schedulingWeekday === null) return
    await setRoutineDaySchedule(routine.id, schedulingWeekday, time)
    await refreshSchedules()
    setSchedulingWeekday(null)
  }

  async function handleRemoveScheduleDay() {
    if (!currentSchedule) return
    await removeRoutineDaySchedule(currentSchedule.id)
    await refreshSchedules()
    setSchedulingWeekday(null)
  }

  if (!routine) {
    return (
      <main style={pageStyle}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            aria-label="Retour"
            onClick={() => back('tools')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Routine</h1>
        </header>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Cette routine n'existe plus.</p>
      </main>
    )
  }

  async function handleAddStep() {
    if (!routine || !stepTitle.trim()) return
    await addRoutineStep(routine.id, stepTitle, parsedDuration(stepDuration))
    await refresh()
    setStepTitle('')
    setStepDuration('')
    setShowAddForm(false)
  }

  function openEditStep(step: RoutineStep) {
    setEditingStep(step)
    setEditStepTitle(step.title)
    setEditStepDuration(step.duration_minutes ? String(step.duration_minutes) : '')
  }

  async function handleEditStep() {
    if (!editingStep || !editStepTitle.trim()) return
    await updateRoutineStep(editingStep.id, editStepTitle, parsedDuration(editStepDuration))
    await refresh()
    setEditingStep(null)
  }

  async function handleDeleteStep(id: string) {
    await deleteRoutineStep(id)
    await refresh()
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!routine || !over || active.id === over.id) return
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    const newOrder = arrayMove(steps, oldIndex, newIndex)
    setSteps(newOrder)
    await reorderRoutineSteps(
      routine.id,
      newOrder.map((s) => s.id),
    )
  }

  async function handleRenameRoutine() {
    if (!routine || !nameValue.trim()) return
    await renameRoutine(routine.id, nameValue)
    setRenaming(false)
  }

  async function handleDeleteRoutine() {
    if (!tool) return
    await deleteTool(tool.id)
    setConfirmingDelete(false)
    back('tools')
  }

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => back('tools')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>{routine.name}</h1>
        <button
          aria-label="Supprimer la routine"
          onClick={() => setConfirmingDelete(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-error)', padding: 0 }}
        >
          ×
        </button>
      </header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <button
            aria-label="Renommer la routine"
            onClick={() => {
              setNameValue(routine.name)
              setRenaming(true)
            }}
            style={{ ...neutralLinkStyle, alignSelf: 'flex-start' }}
          >
            Renommer
          </button>
          <ColorPicker value={routine.color} onChange={(color) => updateRoutineColor(routine.id, color)} />
        </div>
      </Card>

      <section aria-label="Planification">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Planification</h2>
        <RoutineWeekdayPicker schedules={schedules} onDayClick={(weekday) => setSchedulingWeekday(weekday)} />
      </section>

      <section aria-label="Étapes">
        <h2 style={{ fontSize: '1rem', margin: '0 0 var(--spacing-sm)' }}>Étapes</h2>
        {steps.length === 0 ? (
          <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
            Cette routine n'a pas encore d'étape.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {steps.map((step) => (
                  <SortableStepRow key={step.id} step={step} onEdit={openEditStep} onDelete={handleDeleteStep} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <Button
          fullWidth
          onClick={() => {
            setStepTitle('')
            setStepDuration('')
            setShowAddForm(true)
          }}
        >
          Ajouter une étape
        </Button>
      </section>

      {showAddForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter une étape" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter une étape</h2>
            <label htmlFor="routine-step-title">Titre</label>
            <input id="routine-step-title" autoFocus value={stepTitle} onChange={(e) => setStepTitle(e.target.value)} style={inputStyle} />
            <label htmlFor="routine-step-duration">Durée (minutes, optionnel)</label>
            <input id="routine-step-duration" type="text" inputMode="numeric" value={stepDuration} onChange={(e) => setStepDuration(e.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleAddStep} disabled={!stepTitle.trim()}>
              Ajouter
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {editingStep && (
        <div role="dialog" aria-modal="true" aria-label="Modifier l'étape" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Modifier l'étape</h2>
            <label htmlFor="routine-step-edit-title">Titre</label>
            <input id="routine-step-edit-title" autoFocus value={editStepTitle} onChange={(e) => setEditStepTitle(e.target.value)} style={inputStyle} />
            <label htmlFor="routine-step-edit-duration">Durée (minutes, optionnel)</label>
            <input id="routine-step-edit-duration" type="text" inputMode="numeric" value={editStepDuration} onChange={(e) => setEditStepDuration(e.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleEditStep} disabled={!editStepTitle.trim()}>
              Enregistrer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setEditingStep(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {renaming && (
        <div role="dialog" aria-modal="true" aria-label="Renommer la routine" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Renommer la routine</h2>
            <input aria-label="Nouveau nom de la routine" autoFocus value={nameValue} onChange={(e) => setNameValue(e.target.value)} style={inputStyle} />
            <Button fullWidth onClick={handleRenameRoutine} disabled={!nameValue.trim()}>
              Enregistrer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setRenaming(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {schedulingWeekday !== null && (
        <div role="dialog" aria-modal="true" aria-label={`Planifier ${WEEKDAY_NAMES[schedulingWeekday]}`} style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Planifier {WEEKDAY_NAMES[schedulingWeekday]}</h2>
            {currentSchedule && (
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Horaire actuel : {currentSchedule.time}</p>
            )}
            <RoutineTimeKeypad onComplete={handleScheduleDay} />
            {currentSchedule && (
              <button aria-label={`Retirer ${WEEKDAY_NAMES[schedulingWeekday]}`} onClick={handleRemoveScheduleDay} style={dangerLinkStyle}>
                Retirer ce jour
              </button>
            )}
            <Button variant="secondary" fullWidth onClick={() => setSchedulingWeekday(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <div role="dialog" aria-modal="true" aria-label="Supprimer la routine" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Supprimer cette routine ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Toutes ses étapes seront définitivement supprimées.</p>
            <Button fullWidth onClick={handleDeleteRoutine} style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
              Supprimer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirmingDelete(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
