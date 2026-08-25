import { useApp } from '@/app/AppContext'
import { useState, useRef } from 'react'
import { getRemainingPlannedCost } from '@/domain/rules/taskRules'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { PlanningBoard } from '@/ui/screens/dashboard/PlanningBoard'
import { ToolCreateModal } from '@/ui/components/ToolCreateModal'
import { toolLabel } from '@/ui/components/ToolWidgetCard'
import { DEFAULT_AMBIANCE_COLOR } from '@/ui/styles/ambiance'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'

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

const PLANNING_MIN_HEIGHT_PX = 190
const PLANNING_MAX_HEIGHT_PX = 460
const DRAG_MOVE_EPSILON_PX = 6

function clampPlanningHeight(value: number): number {
  return Math.min(PLANNING_MAX_HEIGHT_PX, Math.max(PLANNING_MIN_HEIGHT_PX, value))
}

const widgetBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'ui-rounded, "SF Pro Rounded", "Segoe UI Rounded", var(--font-body)',
  padding: 0,
}

export function E10Dashboard() {
  const {
    route,
    todayEnergy,
    todayEnergyStatus,
    todayPlannedTasks,
    overloadMode,
    goTo,
    folders,
    tools,
    lists,
    selectList,
    manualTestResults,
    settings,
  } = useApp()
  const [showCreateTool, setShowCreateTool] = useState(false)

  const expanded = route.name === 'planning'

  const dragStartY = useRef<number | null>(null)
  const dragTriggered = useRef(false)
  const [dragDeltaY, setDragDeltaY] = useState<number | null>(null)

  const baseHeight = expanded ? PLANNING_MAX_HEIGHT_PX : PLANNING_MIN_HEIGHT_PX
  const planningHeight = dragDeltaY === null ? baseHeight : clampPlanningHeight(baseHeight + dragDeltaY)

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

  function handleHandlePointerDown(event: React.PointerEvent) {
    dragStartY.current = event.clientY
    dragTriggered.current = false
    setDragDeltaY(0)
  }

  function handleHandlePointerMove(event: React.PointerEvent) {
    if (dragStartY.current === null) return
    const delta = event.clientY - dragStartY.current
    if (!dragTriggered.current && Math.abs(delta) > DRAG_MOVE_EPSILON_PX) dragTriggered.current = true
    setDragDeltaY(delta)
  }

  function handleHandlePointerUp() {
    if (dragTriggered.current && dragStartY.current !== null) {
      const releasedHeight = clampPlanningHeight(baseHeight + (dragDeltaY ?? 0))
      const shouldExpand = releasedHeight > (PLANNING_MIN_HEIGHT_PX + PLANNING_MAX_HEIGHT_PX) / 2
      if (shouldExpand !== expanded) goTo(shouldExpand ? 'planning' : 'dashboard')
    }
    dragStartY.current = null
    setDragDeltaY(null)
  }

  function handleHandleClick() {
    if (dragTriggered.current) {
      dragTriggered.current = false
      return
    }
    goTo(expanded ? 'dashboard' : 'planning')
  }

  const handle = (
    <button
      onClick={handleHandleClick}
      onPointerDown={handleHandlePointerDown}
      onPointerMove={handleHandlePointerMove}
      onPointerUp={handleHandlePointerUp}
      aria-expanded={expanded}
      aria-label={expanded ? 'Replier le planning' : 'Déplier le planning'}
      style={{ ...handleStyle, touchAction: 'none' }}
    >
      <span aria-hidden style={handleBarStyle} />
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

      {overloadMode && (
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

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {expanded && handle}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: `${planningHeight}px`,
            overflowY: dragDeltaY === null ? 'auto' : 'hidden',
            transition: dragDeltaY === null ? 'height 0.2s ease' : 'none',
          }}
        >
          <PlanningBoard collapsed={!expanded} />
        </div>
        {!expanded && handle}
      </div>

      {!overloadMode && (
        <section aria-label="Outils">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Outils</h2>
            <Button
              onClick={() => setShowCreateTool(true)}
              aria-label="Ajouter un outil"
              style={{ padding: '4px 10px', fontSize: '1rem', lineHeight: 1 }}
            >
              +
            </Button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-md)',
            }}
          >
            <Card>
              <button style={widgetBtnStyle} onClick={() => goTo('budget-account')}>
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

    </AppShell>
  )
}
