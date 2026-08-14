import { useApp } from '@/app/AppContext'
import { useState, useEffect } from 'react'
import type { Task } from '@/domain/entities/task'
import { getRemainingPlannedCost, isCompleted } from '@/domain/rules/taskRules'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { PlanningBoard } from '@/ui/screens/dashboard/PlanningBoard'
import { ToolCreateModal } from '@/ui/components/ToolCreateModal'
import { BudgetExpenseModal } from '@/ui/components/BudgetExpenseModal'
import { toolLabel } from '@/ui/components/ToolWidgetCard'
import { flashyBackground, DEFAULT_AMBIANCE_COLOR } from '@/ui/styles/ambiance'
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
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'

interface SortableTaskItemProps {
  task: Task
  subs: Task[]
  onOpen: (id: string) => void
}

function SortableTaskItem({ task, subs, onOpen }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const done = subs.filter(isCompleted).length
  const total = subs.length
  const completed = isCompleted(task)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
        cursor: 'grab',
      }}
    >
      <Card style={{
        padding: 'var(--spacing-12)',
        ...(completed ? { backgroundColor: flashyBackground('var(--color-accent)'), borderColor: 'var(--color-accent)', color: '#fff' } : {}),
      }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '0.9rem',
              color: completed ? '#fff' : 'var(--color-text-muted)',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ⠿
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen(task.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: completed ? '#fff' : 'var(--color-text)',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: 0,
              textAlign: 'left',
              flex: 1,
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </button>
          {total > 0 && (
            <span
              aria-label={`${done} sur ${total} étapes`}
              style={{ fontSize: '0.75rem', color: completed ? '#fff' : 'var(--color-text-muted)', flexShrink: 0 }}
            >
              {done}/{total}
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

const handleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-xs)',
  width: '100%',
  padding: '8px 0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  fontSize: '0.8125rem',
  fontFamily: 'var(--font-body)',
}

const handleBarStyle: React.CSSProperties = {
  display: 'block',
  width: '36px',
  height: '4px',
  borderRadius: '2px',
  background: 'var(--color-border)',
}

const widgetBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  padding: 0,
}

export function E10Dashboard() {
  const {
    route,
    todayTasks,
    todaySubTasksMap,
    todayEnergy,
    todayEnergyStatus,
    todayPlannedTasks,
    overloadMode,
    goTo,
    selectTask,
    reorderTodayTasks,
    folders,
    tools,
    lists,
    selectList,
    budgetCategories,
    createBudgetEntry,
    manualTestResults,
    settings,
  } = useApp()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showNoExpenseCategory, setShowNoExpenseCategory] = useState(false)
  const [showCreateTool, setShowCreateTool] = useState(false)

  const expanded = route.name === 'planning'

  const [visibleOrder, setVisibleOrder] = useState<Task[]>(() => todayTasks)

  useEffect(() => {
    setVisibleOrder(todayTasks)
  }, [todayTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function openDetail(taskId: string) {
    selectTask(taskId)
    goTo('task-detail')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = visibleOrder.findIndex((t) => t.id === active.id)
    const newIndex = visibleOrder.findIndex((t) => t.id === over.id)
    const newVisible = arrayMove(visibleOrder, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i,
    }))
    setVisibleOrder(newVisible)
    reorderTodayTasks(newVisible.map((t) => t.id))
  }

  const isEmpty = todayTasks.length === 0
  const showSecondary = !expanded
  const rootFolders = folders
  const rootTools = tools.filter((t) => t.folder_id === null)
  const hasNewManualTests = manualTestsCatalog.some(
    (test) => !manualTestResults.some((result) => result.test_id === test.id),
  )

  function openTool(toolId: string) {
    const tool = rootTools.find((t) => t.id === toolId)
    if (!tool) return
    if (tool.type === 'tableau_comptage') {
      goTo('budget')
    } else if (tool.type === 'liste' && tool.list_id) {
      selectList(tool.list_id)
      goTo('list-detail')
    }
  }

  function handleToolListCreated(listId: string) {
    setShowCreateTool(false)
    selectList(listId)
    goTo('list-detail')
  }

  const expenseCategories = budgetCategories.filter((category) => category.kind === 'expense')

  function openExpenseForm() {
    if (expenseCategories.length === 0) {
      setShowNoExpenseCategory(true)
      return
    }
    setShowExpenseForm(true)
  }

  async function handleCreateExpense(categoryId: string, amount: number, label: string, date: string) {
    await createBudgetEntry(categoryId, amount, label, date)
    setShowExpenseForm(false)
  }

  const handle = (
    <button
      onClick={() => goTo(expanded ? 'dashboard' : 'planning')}
      aria-expanded={expanded}
      aria-label={expanded ? 'Replier le planning' : 'Déplier le planning'}
      style={handleStyle}
    >
      <span aria-hidden style={handleBarStyle} />
      <span>{expanded ? 'Replier' : 'Déplier'}</span>
    </button>
  )

  return (
    <AppShell overloadMode={overloadMode}>
      <TopBar
        title="AuDHD"
        energyStatus={todayEnergyStatus}
        energyValue={todayEnergy}
        onEnergyClick={() => goTo('energy-view')}
        overloadActive={overloadMode}
        plannedCost={getRemainingPlannedCost(todayPlannedTasks)}
        onResourcesClick={() => goTo('resources')}
        onManualTestsClick={() => goTo('manual-tests')}
        hasNewManualTests={hasNewManualTests}
        onOverloadClick={() => goTo('overload-recovery')}
        ambianceColor={settings?.ambiance_color ?? DEFAULT_AMBIANCE_COLOR}
      />

      {overloadMode && showSecondary && (
        <Card style={{ borderColor: 'var(--color-warning)' }}>
          <p style={{ fontWeight: 600, margin: 0, color: 'var(--color-warning)' }}>
            Mode surcharge actif
          </p>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
            Prenez le temps qu'il vous faut.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => goTo('overload-recovery')}
            style={{ marginTop: 'var(--spacing-sm)' }}
          >
            Centre récupération
          </Button>
        </Card>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          ...(expanded ? { flex: 1 } : {}),
        }}
      >
        {expanded && handle}
        <PlanningBoard collapsed={!expanded} />
        {!expanded && handle}
      </div>

      {showSecondary && !overloadMode && (
        <section aria-label="Tâche du jour">
          <h2 style={{ fontSize: '1.1rem' }}>Tâche du jour</h2>
          {isEmpty ? (
            <p>Rien à faire aujourd'hui</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleOrder.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {visibleOrder.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      subs={todaySubTasksMap[task.id] ?? []}
                      onOpen={openDetail}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      )}

      {showSecondary && !overloadMode && (
        <section aria-label="Outils">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <h2 style={{ fontSize: '1.1rem', flex: 1 }}>Outils</h2>
            <Button onClick={() => setShowCreateTool(true)} aria-label="Ajouter un outil">
              +
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
            <Card>
              <button style={widgetBtnStyle} onClick={openExpenseForm}>
                Comptes
              </button>
            </Card>
            {rootFolders.map((folder) => (
              <Card key={folder.id}>
                <button style={widgetBtnStyle} onClick={() => goTo({ name: 'folder-detail', folderId: folder.id })}>
                  📁 {folder.name}
                </button>
              </Card>
            ))}
            {rootTools.map((tool) => {
              const list = tool.list_id ? lists.find((l) => l.id === tool.list_id) : undefined
              return (
                <Card key={tool.id}>
                  <button style={widgetBtnStyle} onClick={() => openTool(tool.id)}>
                    {toolLabel(tool, list?.name)}
                  </button>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {showCreateTool && (
        <ToolCreateModal
          folderId={null}
          onClose={() => setShowCreateTool(false)}
          onListCreated={handleToolListCreated}
        />
      )}

      {showExpenseForm && (
        <BudgetExpenseModal
          categories={expenseCategories}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpenseForm(false)}
        />
      )}
      {showNoExpenseCategory && (
        <div
          role="dialog"
          aria-label="Aucune catégorie de dépense"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
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
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Aucune catégorie de dépense</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Créez d'abord une catégorie de type « dépense » dans le Budget pour pouvoir saisir une dépense depuis ce widget.
            </p>
            <Button fullWidth onClick={() => setShowNoExpenseCategory(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
