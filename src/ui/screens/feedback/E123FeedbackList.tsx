import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { feedbackReportRepo } from '@/app/repositories'
import { syncFeedbackNow } from '@/data/sync/feedbackClient'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { pageStyle } from '@/ui/styles/budget'

const STATUS_LABELS = { pending: 'En attente d’envoi', sent: 'Envoyé', failed: 'Échec d’envoi' } as const

export function E123FeedbackList() {
  const { back, goTo } = useApp()
  const [reports, setReports] = useState<FeedbackReport[]>([])

  async function load() {
    setReports(await feedbackReportRepo.getAll())
  }

  useEffect(() => { void load() }, [])

  async function retry(id: string) {
    await feedbackReportRepo.markPending(id)
    await syncFeedbackNow({ force: true })
    await load()
  }

  return (
    <main style={pageStyle}>
      <button onClick={() => back('dashboard')} aria-label="Retour" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}>← Retour</button>
      <div>
        <h1 style={{ margin: 0 }}>Mes retours</h1>
        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>Vos retours restent sur cet appareil tant qu’ils ne sont pas envoyés.</p>
      </div>
      {reports.length === 0 ? <p>Aucun retour pour le moment.</p> : reports.map((report) => (
        <Card key={report.id}>
          <strong>{report.screen_code}</strong>
          <p style={{ margin: 'var(--spacing-sm) 0' }}>{report.comment || 'Annotation sans commentaire'}</p>
          <span>{STATUS_LABELS[report.sync_status]}</span>
          {report.sync_status === 'failed' && <Button variant="secondary" onClick={() => retry(report.id)} style={{ marginTop: 'var(--spacing-sm)' }}>Relancer</Button>}
        </Card>
      ))}
      <Button fullWidth onClick={() => goTo('feedback')}>Nouveau retour</Button>
    </main>
  )
}
