import { useApp } from '@/app/AppContext'
import { useEffect, useState } from 'react'
import { getRemainingPlannedCost } from '@/domain/rules/taskRules'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { TopBar } from '@/ui/components/TopBar'
import { AppShell } from '@/ui/components/AppShell'
import { PlanningBoard } from '@/ui/screens/dashboard/PlanningBoard'
import { ToolCreateModal } from '@/ui/components/ToolCreateModal'
import { toolLabel } from '@/ui/components/ToolWidgetCard'
import { DEFAULT_AMBIANCE_COLOR, outlineOnlyStyle } from '@/ui/styles/ambiance'
import { feedbackMessageRepo } from '@/app/repositories'
import { syncFeedbackNow } from '@/data/sync/feedbackClient'

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
    routines,
    selectList,
    selectRoutine,
    settings,
  } = useApp()
  const [showCreateTool, setShowCreateTool] = useState(false)
  const [hasUnreadFeedback, setHasUnreadFeedback] = useState(false)

  const rootFolders = folders
  const rootTools = tools.filter((t) => t.folder_id === null)

  useEffect(() => {
    function checkUnread() {
      void feedbackMessageRepo.getUnreadReportIds().then((ids) => setHasUnreadFeedback(ids.length > 0))
    }
    checkUnread()
    // La synchronisation globale (startFeedbackSync, demarrage de l'appli) tourne en parallele du
    // montage de ce tableau de bord : sans ce second appel, une reponse d'agent recue juste apres
    // le premier controle local restait invisible tant que l'ecran n'etait pas remonte.
    void syncFeedbackNow().then(checkUnread)
  }, [])

  function openTool(toolId: string) {
    const tool = rootTools.find((t) => t.id === toolId)
    if (!tool) return
    if (tool.type === 'tableau_comptage') {
      goTo('budget')
    } else if (tool.type === 'liste' && tool.list_id) {
      selectList(tool.list_id)
      goTo('list-detail')
    } else if (tool.type === 'routine' && tool.routine_id) {
      selectRoutine(tool.routine_id)
      goTo('routine-detail')
    }
  }

  function handleToolListCreated(listId: string) {
    setShowCreateTool(false)
    selectList(listId)
    goTo('list-detail')
  }

  function handleToolRoutineCreated(routineId: string) {
    setShowCreateTool(false)
    selectRoutine(routineId)
    goTo('routine-detail')
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
        onFeedbackClick={() => goTo('feedback-list')}
        hasUnreadFeedback={hasUnreadFeedback}
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
          <Card style={settings?.mon_compte_color ? outlineOnlyStyle(settings.mon_compte_color) : undefined}>
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
            const routine = tool.routine_id ? routines.find((r) => r.id === tool.routine_id) : undefined
            const accentColor = tool.type === 'routine' ? routine?.color : tool.color
            return (
              <Card
                key={tool.id}
                style={accentColor ? outlineOnlyStyle(accentColor) : undefined}
              >
                <button style={widgetBtnStyle} onClick={() => openTool(tool.id)}>
                  {toolLabel(tool, list?.name, routine?.name)}
                </button>
              </Card>
            )
          })}
        </div>
      </section>

      {showCreateTool && (
        <ToolCreateModal
          folderId={null}
          onClose={() => setShowCreateTool(false)}
          onListCreated={handleToolListCreated}
          onRoutineCreated={handleToolRoutineCreated}
        />
      )}

    </AppShell>
  )
}
