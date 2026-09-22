import { useCallback, useEffect, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { feedbackMessageRepo, feedbackReportRepo, newId } from '@/app/repositories'
import { syncFeedbackNow } from '@/data/sync/feedbackClient'
import type { FeedbackMessage } from '@/domain/entities/feedbackMessage'
import type { FeedbackReport } from '@/domain/entities/feedbackReport'
import { isFeedbackMessageValid } from '@/domain/rules/feedbackRules'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { inputStyle, modalBox, modalOverlay, pageStyle } from '@/ui/styles/budget'

const STATUS_LABELS = { pending: 'En attente d’envoi', sent: 'Envoyé', failed: 'Échec d’envoi' } as const

interface ThreadEntry {
  id: string
  author: FeedbackMessage['author']
  body: string
  created_at: string
  sync_status: FeedbackMessage['sync_status']
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export function E124FeedbackDetail() {
  const { route, back } = useApp()
  const reportId = route.name === 'feedback-detail' ? (route.reportId ?? null) : null
  const [report, setReport] = useState<FeedbackReport | null>(null)
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmingValidate, setConfirmingValidate] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (isActive: () => boolean = () => true) => {
    if (!reportId) {
      if (isActive()) setLoaded(true)
      return
    }
    const [foundReport, foundMessages] = await Promise.all([
      feedbackReportRepo.getById(reportId),
      feedbackMessageRepo.getByReport(reportId),
    ])
    if (!isActive()) return
    setReport(foundReport ?? null)
    setMessages(foundMessages)
    setLoaded(true)
    if (foundMessages.some((message) => message.read_at === null)) {
      await feedbackMessageRepo.markReportRead(reportId, new Date().toISOString())
    }
  }, [reportId])

  useEffect(() => {
    let active = true
    void load(() => active)
    return () => { active = false }
  }, [load])

  useEffect(() => {
    if (!reportId) return
    let active = true
    void syncFeedbackNow().then(() => { if (active) void load(() => active) })
    return () => { active = false }
  }, [reportId, load])

  useEffect(() => {
    if (!report) return
    const url = URL.createObjectURL(report.image_blob)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [report])

  const canSend = isFeedbackMessageValid(reply)

  async function sendReply() {
    if (!report || !canSend) return
    setSending(true)
    setError('')
    try {
      const now = new Date().toISOString()
      await feedbackMessageRepo.create({
        id: newId(),
        report_id: report.id,
        author: 'user',
        body: reply.trim(),
        created_at: now,
        sync_status: 'pending',
        last_attempt_at: null,
        read_at: now,
      })
      setReply('')
      await load()
      void syncFeedbackNow().then(() => load())
    } catch {
      setError('Le commentaire n’a pas pu être enregistré sur cet appareil.')
    } finally {
      setSending(false)
    }
  }

  async function validate() {
    if (!report) return
    setError('')
    try {
      await feedbackReportRepo.validate(report.id, new Date().toISOString())
      setConfirmingValidate(false)
      void syncFeedbackNow()
      back('feedback-list')
    } catch {
      setError('La validation n’a pas pu être enregistrée sur cet appareil.')
    }
  }

  if (!loaded) return null

  if (!report) {
    return (
      <main style={pageStyle}>
        <button onClick={() => back('feedback-list')} aria-label="Retour" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}>← Retour</button>
        <p>Ce retour n’existe plus.</p>
      </main>
    )
  }

  const thread: ThreadEntry[] = [
    { id: report.id, author: 'user' as const, body: report.comment, created_at: report.created_at, sync_status: report.sync_status },
    ...messages.map((message): ThreadEntry => ({ id: message.id, author: message.author, body: message.body, created_at: message.created_at, sync_status: message.sync_status })),
  ].filter((entry) => entry.body.trim().length > 0)

  return (
    <main style={pageStyle}>
      <button onClick={() => back('feedback-list')} aria-label="Retour" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}>← Retour</button>
      <div>
        <h1 style={{ margin: 0 }}>{report.screen_code}</h1>
        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>
          {formatDateTime(report.created_at)} · v{report.app_version} · {STATUS_LABELS[report.sync_status]}
        </p>
      </div>
      {imageUrl && (
        <figure style={{ margin: 0, padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
          <img src={imageUrl} alt="Capture du retour" style={{ display: 'block', width: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} />
          <figcaption style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>Capture jointe au retour</figcaption>
        </figure>
      )}
      {error && <p role="alert" style={{ margin: 0, color: 'var(--color-error)' }}>{error}</p>}
      <section aria-label="Fil de discussion" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {thread.map((entry) => (
          <Card key={entry.id}>
            <strong>{entry.author === 'agent' ? 'Équipe' : 'Vous'}</strong>
            <p style={{ margin: 'var(--spacing-sm) 0 0' }}>{entry.body}</p>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>{formatDateTime(entry.created_at)}</span>
            {entry.sync_status === 'failed' && (
              <span style={{ display: 'block', color: 'var(--color-error)', fontSize: '0.8125rem', marginTop: 'var(--spacing-xs)' }}>Échec d’envoi</span>
            )}
          </Card>
        ))}
      </section>
      <label htmlFor="feedback-reply">Ajouter un commentaire</label>
      <textarea id="feedback-reply" value={reply} onChange={(event) => setReply(event.target.value)} style={inputStyle} rows={3} placeholder="Écrivez votre message." />
      <Button fullWidth onClick={sendReply} disabled={!canSend || sending}>{sending ? 'Envoi…' : 'Envoyer'}</Button>
      {report.resolution_status === 'open' && report.sync_status === 'sent' && (
        <Button variant="secondary" fullWidth onClick={() => setConfirmingValidate(true)}>Valider</Button>
      )}
      {report.resolution_status === 'open' && report.sync_status !== 'sent' && (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>La validation sera possible une fois ce retour envoyé.</p>
      )}
      {confirmingValidate && (
        <div role="dialog" aria-modal="true" aria-label="Valider ce retour" style={modalOverlay}>
          <div style={modalBox}>
            <h2 style={{ margin: 0 }}>Confirmer que ce retour est résolu ?</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Il disparaîtra de votre liste.</p>
            <Button fullWidth onClick={validate}>Confirmer</Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirmingValidate(false)}>Annuler</Button>
          </div>
        </div>
      )}
    </main>
  )
}
