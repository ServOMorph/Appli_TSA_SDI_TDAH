import { useApp } from '@/app/AppContext'
import { useState } from 'react'
import { getRemainingPlannedCost } from '@/domain/rules/taskRules'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { PlanningBoard } from '@/ui/screens/dashboard/PlanningBoard'
import { ToolCreateModal } from '@/ui/components/ToolCreateModal'
import { toolLabel } from '@/ui/components/ToolWidgetCard'
import { DEFAULT_AMBIANCE_COLOR, pastelBackground } from '@/ui/styles/ambiance'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'
import { hasPendingManualTests } from '@/domain/rules/manualTestRules'

export const PLANNING_HEIGHT_PX = 325

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

  const rootFolders = folders
  const rootTools = tools.filter((t) => t.folder_id === null)
  const hasNewManualTests = hasPendingManualTests(manualTestsCatalog, manualTestResults)

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

  return (
    <AppShell overloadMode={overloadMode}>
      <TopBar
        title="AuDHD"
        energyStatus={todayEnergyStatus}
        energyValue={todayEnergy}
        onEnergyClick={() => goTo('energy-checkin')}
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

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: `${PLANNING_HEIGHT_PX}px`,
          overflow: 'hidden',
        }}
      >
        <PlanningBoard />
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
            <Card style={settings?.mon_compte_color ? { backgroundColor: pastelBackground(settings.mon_compte_color) } : undefined}>
              <button style={widgetBtnStyle} onClick={() => goTo('budget-account')}>
                Mon compte
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
                <Card
                  key={tool.id}
                  style={tool.color ? { backgroundColor: pastelBackground(tool.color) } : undefined}
                >
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
