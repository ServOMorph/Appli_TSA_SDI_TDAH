import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { feedbackMessageRepo, feedbackReportRepo } from '@/app/repositories'
import { syncFeedbackNow } from '@/data/sync/feedbackClient'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { WHATS_NEW, hasUnseenWhatsNew, markWhatsNewSeen } from '@/domain/data/whatsNew'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { WhatsNewModal } from '@/ui/components/WhatsNewModal'
import { pageStyle } from '@/ui/styles/budget'

const STATUS_LABELS = { pending: 'En attente d’envoi', sent: 'Envoyé', failed: 'Échec d’envoi' } as const

export function E123FeedbackList() {
  const { back, goTo } = useApp()
  const [reports, setReports] = useState<FeedbackReport[]>([])
  const [unreadReportIds, setUnreadReportIds] = useState<string[]>([])
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const consentGranted = isSyncConsentGranted()
  const hasUnsent = reports.some((report) => report.sync_status !== 'sent')

  async function load() {
    const [openReports, unread] = await Promise.all([
      feedbackReportRepo.getOpen(),
      feedbackMessageRepo.getUnreadReportIds(),
    ])
    setReports(openReports)
    setUnreadReportIds(unread)
  }

  useEffect(() => {
    void load()
    void syncFeedbackNow().then(() => { void load() })
  }, [])

  async function retry(id: string) {
    await feedbackReportRepo.markPending(id)
    await syncFeedbackNow({ force: true })
    await load()
  }

  return (
    <main style={pageStyle}>
      <button onClick={() => back('dashboard')} aria-label="Retour" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}>← Retour</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
        <div>
          <h1 style={{ margin: 0 }}>Mes retours</h1>
          <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>Vos retours restent sur cet appareil tant qu’ils ne sont pas envoyés.</p>
        </div>
        <button
          onClick={() => setShowWhatsNew(true)}
          aria-label={hasUnseenWhatsNew() ? 'Nouveautés, non lu' : 'Nouveautés'}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          Nouveautés
          {hasUnseenWhatsNew() && (
            <span
              aria-hidden
              style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-error)', border: '1px solid var(--color-surface)' }}
            />
          )}
        </button>
      </div>
      {showWhatsNew && (
        <WhatsNewModal
          updates={WHATS_NEW}
          onClose={() => {
            markWhatsNewSeen()
            setShowWhatsNew(false)
          }}
        />
      )}
      {!consentGranted && hasUnsent && (
        <Card>
          <p style={{ margin: 0 }}>Le partage des données est désactivé : vos retours ne peuvent pas être envoyés. Activez-le pour qu’ils partent automatiquement.</p>
          <Button variant="secondary" onClick={() => goTo('settings-privacy')} style={{ marginTop: 'var(--spacing-sm)' }}>Ouvrir Confidentialité</Button>
        </Card>
      )}
      {reports.length === 0 ? <p>Aucun retour pour le moment.</p> : reports.map((report) => (
        <Card key={report.id}>
          <div
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => goTo({ name: 'feedback-detail', reportId: report.id })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                goTo({ name: 'feedback-detail', reportId: report.id })
              }
            }}
          >
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              {report.screen_code}
              {unreadReportIds.includes(report.id) && (
                <span aria-label="Nouvelle réponse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
              )}
            </strong>
            <p style={{ margin: 'var(--spacing-sm) 0' }}>{report.comment || 'Annotation sans commentaire'}</p>
            <span>{consentGranted || report.sync_status === 'sent' ? STATUS_LABELS[report.sync_status] : 'En attente d’activation du partage'}</span>
          </div>
          {consentGranted && report.sync_status === 'failed' && (
            <Button variant="secondary" onClick={() => retry(report.id)} style={{ marginTop: 'var(--spacing-sm)' }}>Relancer</Button>
          )}
        </Card>
      ))}
      <Button fullWidth onClick={() => goTo('feedback')}>Nouveau retour</Button>
    </main>
  )
}
