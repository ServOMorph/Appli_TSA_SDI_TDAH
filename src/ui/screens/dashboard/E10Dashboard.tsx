import { useApp } from '@/app/AppContext'
import { Card } from '@/ui/components/Card'
import { Button } from '@/ui/components/Button'
import { getActionImmediate } from '@/domain/rules/actionImmediateRules'

export function E10Dashboard() {
  const { todayTasks, todayEnergy, overloadMode, setOverloadMode, goTo } = useApp()

  const action = getActionImmediate(todayTasks)
  const isEmpty = todayTasks.length === 0

  if (overloadMode) {
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
          justifyContent: 'center',
        }}
      >
        <h1>Mode surcharge</h1>
        <Card>
          {action.type === 'task' && action.task ? (
            <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1.1rem' }}>
              {action.task.title}
            </p>
          ) : (
            <p>Que souhaitez-vous ajouter ?</p>
          )}
        </Card>
        <Button variant="secondary" fullWidth onClick={() => setOverloadMode(false)}>
          Désactiver le mode surcharge
        </Button>
      </main>
    )
  }

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Tableau de bord</h1>
        {todayEnergy !== null && (
          <span
            aria-label={`${todayEnergy} cuillères aujourd'hui`}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 12px',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
            }}
          >
            {todayEnergy} cuillères
          </span>
        )}
      </header>

      <section aria-label="Action immédiate">
        <h2>Que faire maintenant ?</h2>
        <Card>
          {action.type === 'task' && action.task ? (
            <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1.1rem' }}>
              {action.task.title}
            </p>
          ) : (
            <p>Que souhaitez-vous ajouter ?</p>
          )}
        </Card>
      </section>

      {!isEmpty ? (
        <section aria-label="Tâches du jour">
          <h2>Tâches du jour</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {todayTasks.slice(0, 3).map((task) => (
              <Card key={task.id} style={{ padding: 'var(--spacing-md)' }}>
                <p style={{ color: 'var(--color-text)' }}>{task.title}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <Button fullWidth onClick={() => goTo('first-task')}>
        Ajouter une tâche
      </Button>
    </main>
  )
}
