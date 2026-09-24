import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { Button } from '@/ui/components/Button'
import type { RoutineStep } from '@/domain/entities/routineStep'
import type { RoutineSchedule } from '@/domain/entities/routineSchedule'
import type { Task } from '@/domain/entities/task'
import { isCompleted } from '@/domain/rules/taskRules'
import { todayStr, weekdayOf } from '@/domain/rules/planningSlotRules'
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

function parsedDuration(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const amount = Number(trimmed)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

const stepRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--spacing-sm)',
  gap: 'var(--spacing-sm)',
}

const stepHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
}

const stepCheckboxStyle: React.CSSProperties = {
  width: '22px',
  height: '22px',
  margin: 0,
  accentColor: 'var(--color-accent)',
  cursor: 'pointer',
  flexShrink: 0,
}

function stepTitleStyle(completed: boolean): React.CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    textDecoration: completed ? 'line-through' : 'none',
    color: completed ? 'var(--color-text-muted)' : 'var(--color-text)',
  }
}

const expandBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '0.8125rem',
  padding: '0 4px',
  flexShrink: 0,
  fontVariantNumeric: 'tabular-nums',
}

const subTaskListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '0 0 0 34px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}

const subTaskRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
}

const subTaskCheckboxStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  flexShrink: 0,
  cursor: 'pointer',
  accentColor: 'var(--color-accent)',
}

function subTaskTitleStyle(completed: boolean): React.CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    fontSize: '0.875rem',
    textDecoration: completed ? 'line-through' : 'none',
    color: completed ? 'var(--color-text-muted)' : 'var(--color-text)',
  }
}

const subTaskDeleteStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  color: 'var(--color-text-muted)',
  padding: '0 4px',
}

const addSubTaskRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-sm)',
  paddingLeft: '34px',
}

const addSubTaskBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-secondary)',
  fontSize: '0.8125rem',
  padding: '2px 4px',
  marginLeft: '34px',
  alignSelf: 'flex-start',
}

const editStepRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--spacing-sm)',
}

const dragHandleStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: 'var(--color-text-muted)',
  flexShrink: 0,
  lineHeight: 1,
}

function formatFullDate(date: string): string {
  const label = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

interface SortableEditStepRowProps {
  step: RoutineStep
  onEdit: (step: RoutineStep) => void
  onDelete: (id: string) => void
}

function SortableEditStepRow({ step, onEdit, onDelete }: SortableEditStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        ...editStepRowStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <span aria-hidden style={dragHandleStyle}>⠿</span>
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

export function E80RoutineSteps() {
  const {
    routines,
    selectedRoutineId,
    getRoutineStepsForDate,
    getRoutineSchedules,
    getRoutineStepCompletionsForDate,
    toggleRoutineStepCompletion,
    addRoutineStep,
    updateRoutineStep,
    deleteRoutineStep,
    reorderRoutineSteps,
    detachRoutineDay,
    reattachRoutineDay,
    getSubTasks,
    addSubTask,
    deleteSubTask,
    toggleSubTask,
    route,
    back,
  } = useApp()

  const date = route.name === 'routine-steps' && route.date ? route.date : todayStr()
  const weekday = weekdayOf(date)
  const routine = routines.find((r) => r.id === selectedRoutineId) ?? null

  const [steps, setSteps] = useState<RoutineStep[]>([])
  const [overridden, setOverridden] = useState(false)
  const [schedules, setSchedules] = useState<RoutineSchedule[]>([])
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set())
  const [subTasksByStep, setSubTasksByStep] = useState<Record<string, Task[]>>({})
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null)
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [editingDay, setEditingDay] = useState(false)
  const [showAddStepForm, setShowAddStepForm] = useState(false)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDuration, setNewStepDuration] = useState('')
  const [editingStep, setEditingStep] = useState<RoutineStep | null>(null)
  const [editStepTitle, setEditStepTitle] = useState('')
  const [editStepDuration, setEditStepDuration] = useState('')

  const daySchedule = schedules.find((s) => s.weekday === weekday) ?? null

  async function reload() {
    if (!selectedRoutineId) return
    const [{ steps: stepList, overridden: isOverridden }, completedIds, scheduleList] = await Promise.all([
      getRoutineStepsForDate(selectedRoutineId, date),
      getRoutineStepCompletionsForDate(selectedRoutineId, date),
      getRoutineSchedules(selectedRoutineId),
    ])
    setSteps(stepList)
    setOverridden(isOverridden)
    setSchedules(scheduleList)
    setCompletedStepIds(completedIds)
    const subLists = await Promise.all(stepList.map((s) => getSubTasks(s.id)))
    const map: Record<string, Task[]> = {}
    stepList.forEach((s, i) => {
      map[s.id] = subLists[i]
    })
    setSubTasksByStep(map)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoutineId, date])

  function toggleExpand(stepId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) next.delete(stepId)
      else next.add(stepId)
      return next
    })
  }

  async function handleToggleStep(stepId: string) {
    if (!selectedRoutineId) return
    await toggleRoutineStepCompletion(selectedRoutineId, stepId, date)
    setCompletedStepIds(await getRoutineStepCompletionsForDate(selectedRoutineId, date))
  }

  async function refreshSubTasks(stepId: string) {
    setSubTasksByStep((prev) => ({ ...prev, [stepId]: [] }))
    const updated = await getSubTasks(stepId)
    setSubTasksByStep((prev) => ({ ...prev, [stepId]: updated }))
  }

  async function handleToggleSubTask(stepId: string, subTask: Task) {
    await toggleSubTask(subTask)
    await refreshSubTasks(stepId)
  }

  async function handleDeleteSubTask(stepId: string, id: string) {
    await deleteSubTask(id)
    await refreshSubTasks(stepId)
  }

  async function handleAddSubTask(stepId: string) {
    const trimmed = newSubTaskTitle.trim()
    if (!trimmed) return
    await addSubTask(stepId, trimmed)
    await refreshSubTasks(stepId)
    setNewSubTaskTitle('')
    setAddingSubTaskFor(null)
  }

  async function handleEnterEditMode() {
    if (!selectedRoutineId) return
    if (!overridden) {
      await detachRoutineDay(selectedRoutineId, weekday)
      await reload()
    }
    setEditingDay(true)
  }

  async function handleRevertToCommon() {
    if (!selectedRoutineId) return
    await reattachRoutineDay(selectedRoutineId, weekday)
    await reload()
    setEditingDay(false)
  }

  async function handleAddStep() {
    if (!selectedRoutineId || !newStepTitle.trim()) return
    await addRoutineStep(selectedRoutineId, newStepTitle, parsedDuration(newStepDuration), weekday)
    await reload()
    setNewStepTitle('')
    setNewStepDuration('')
    setShowAddStepForm(false)
  }

  function openEditStep(step: RoutineStep) {
    setEditingStep(step)
    setEditStepTitle(step.title)
    setEditStepDuration(step.duration_minutes ? String(step.duration_minutes) : '')
  }

  async function handleEditStep() {
    if (!editingStep || !editStepTitle.trim()) return
    await updateRoutineStep(editingStep.id, editStepTitle, parsedDuration(editStepDuration))
    await reload()
    setEditingStep(null)
  }

  async function handleDeleteStep(id: string) {
    await deleteRoutineStep(id)
    await reload()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !selectedRoutineId) return
    const oldIndex = steps.findIndex((s) => s.id === active.id)
    const newIndex = steps.findIndex((s) => s.id === over.id)
    const newOrder = arrayMove(steps, oldIndex, newIndex)
    setSteps(newOrder)
    await reorderRoutineSteps(
      selectedRoutineId,
      newOrder.map((s) => s.id),
    )
  }

  if (!routine) {
    return (
      <main style={pageStyle}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            aria-label="Retour"
            onClick={() => back('dashboard')}
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

  return (
    <main style={pageStyle}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          aria-label="Retour"
          onClick={() => back('dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{routine.name}</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{formatFullDate(date)}</p>
        </div>
        {daySchedule && !editingDay && (
          <button aria-label="Modifier les étapes de ce jour" onClick={handleEnterEditMode} style={neutralLinkStyle}>
            Modifier ce jour
          </button>
        )}
        {editingDay && (
          <button aria-label="Terminer la modification de ce jour" onClick={() => setEditingDay(false)} style={neutralLinkStyle}>
            Terminer
          </button>
        )}
      </header>

      {editingDay ? (
        <section aria-label={`Étapes du ${formatFullDate(date)}`}>
          {overridden && (
            <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Ce jour a ses propres étapes, indépendantes des autres jours.{' '}
              <button aria-label="Revenir à la version commune" onClick={handleRevertToCommon} style={neutralLinkStyle}>
                Revenir à la version commune
              </button>
            </p>
          )}
          {steps.length === 0 ? (
            <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--color-text-muted)' }}>Aucune étape ce jour-là.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {steps.map((step) => (
                    <SortableEditStepRow key={step.id} step={step} onEdit={openEditStep} onDelete={handleDeleteStep} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          <Button
            fullWidth
            onClick={() => {
              setNewStepTitle('')
              setNewStepDuration('')
              setShowAddStepForm(true)
            }}
          >
            Ajouter une étape
          </Button>
        </section>
      ) : steps.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Cette routine n'a pas encore d'étape.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {steps.map((step) => {
            const completed = completedStepIds.has(step.id)
            const subs = subTasksByStep[step.id] ?? []
            const hasSubs = subs.length > 0
            const done = subs.filter(isCompleted).length
            const expanded = expandedIds.has(step.id)
            return (
              <li key={step.id} style={stepRowStyle}>
                <div style={stepHeaderStyle}>
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => handleToggleStep(step.id)}
                    aria-label={`Terminer ${step.title}`}
                    style={stepCheckboxStyle}
                  />
                  <span style={stepTitleStyle(completed)}>
                    {step.title}
                    {step.duration_minutes && (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}> · {step.duration_minutes} min</span>
                    )}
                  </span>
                  <button
                    aria-label={`${done} sur ${subs.length} sous-tâches, ${expanded ? 'replier' : 'déplier'}`}
                    onClick={() => toggleExpand(step.id)}
                    style={expandBtnStyle}
                  >
                    {done}/{subs.length} {expanded ? '▾' : '▸'}
                  </button>
                </div>

                {expanded && (
                  <>
                    {hasSubs && (
                      <ul style={subTaskListStyle}>
                        {subs.map((sub) => (
                          <li key={sub.id} style={subTaskRowStyle}>
                            <input
                              type="checkbox"
                              checked={isCompleted(sub)}
                              onChange={() => handleToggleSubTask(step.id, sub)}
                              aria-label={`${isCompleted(sub) ? 'Décocher' : 'Cocher'} ${sub.title}`}
                              style={subTaskCheckboxStyle}
                            />
                            <span style={subTaskTitleStyle(isCompleted(sub))}>{sub.title}</span>
                            <button
                              aria-label={`Supprimer ${sub.title}`}
                              onClick={() => handleDeleteSubTask(step.id, sub.id)}
                              style={subTaskDeleteStyle}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {addingSubTaskFor === step.id ? (
                      <div style={addSubTaskRowStyle}>
                        <input
                          type="text"
                          value={newSubTaskTitle}
                          onChange={(e) => setNewSubTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubTask(step.id)
                          }}
                          autoFocus
                          placeholder="Nom de la sous-tâche…"
                          aria-label="Nom de la sous-tâche"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          onClick={() => handleAddSubTask(step.id)}
                          disabled={!newSubTaskTitle.trim()}
                          style={addSubTaskBtnStyle}
                        >
                          Ajouter
                        </button>
                      </div>
                    ) : (
                      <button
                        aria-label={`Ajouter une sous-tâche à ${step.title}`}
                        onClick={() => {
                          setNewSubTaskTitle('')
                          setAddingSubTaskFor(step.id)
                        }}
                        style={addSubTaskBtnStyle}
                      >
                        + Ajouter une sous-tâche
                      </button>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {showAddStepForm && (
        <div role="dialog" aria-modal="true" aria-label="Ajouter une étape" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Ajouter une étape</h2>
            <label htmlFor="routine-day-step-title">Titre</label>
            <input id="routine-day-step-title" autoFocus value={newStepTitle} onChange={(e) => setNewStepTitle(e.target.value)} style={inputStyle} />
            <label htmlFor="routine-day-step-duration">Durée (minutes, optionnel)</label>
            <input
              id="routine-day-step-duration"
              type="text"
              inputMode="numeric"
              value={newStepDuration}
              onChange={(e) => setNewStepDuration(e.target.value)}
              style={inputStyle}
            />
            <Button fullWidth onClick={handleAddStep} disabled={!newStepTitle.trim()}>
              Ajouter
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowAddStepForm(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {editingStep && (
        <div role="dialog" aria-modal="true" aria-label="Modifier l'étape" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Modifier l'étape</h2>
            <label htmlFor="routine-day-step-edit-title">Titre</label>
            <input id="routine-day-step-edit-title" autoFocus value={editStepTitle} onChange={(e) => setEditStepTitle(e.target.value)} style={inputStyle} />
            <label htmlFor="routine-day-step-edit-duration">Durée (minutes, optionnel)</label>
            <input
              id="routine-day-step-edit-duration"
              type="text"
              inputMode="numeric"
              value={editStepDuration}
              onChange={(e) => setEditStepDuration(e.target.value)}
              style={inputStyle}
            />
            <Button fullWidth onClick={handleEditStep} disabled={!editStepTitle.trim()}>
              Enregistrer
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setEditingStep(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
