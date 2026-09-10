import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/app/AppContext'
import { feedbackReportRepo, newId } from '@/app/repositories'
import { flattenImage } from '@/data/images/flattenImage'
import { syncFeedbackNow } from '@/data/sync/feedbackClient'
import { SCREEN_CODES } from '@/domain/data/screenCodes'
import type { FeedbackStroke } from '@/domain/entities/feedbackReport'
import { isFeedbackReportValid } from '@/domain/rules/feedbackRules'
import { AnnotationCanvas } from '@/ui/components/AnnotationCanvas'
import { Button } from '@/ui/components/Button'
import { clearStrokes, undoStroke } from '@/domain/rules/annotationStrokes'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { inputStyle, pageStyle } from '@/ui/styles/budget'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function imageFromClipboard(data: DataTransfer | null): Blob | null {
  if (!data) return null
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) return file
    }
  }
  for (let i = 0; i < data.files.length; i++) {
    if (data.files[i].type.startsWith('image/')) return data.files[i]
  }
  return null
}

export function E122FeedbackCapture() {
  const { back, goTo, route, originScreen } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<Blob | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [strokes, setStrokes] = useState<FeedbackStroke[]>([])
  const sourceScreen = route.name === 'feedback' ? route.sourceScreen ?? originScreen : null
  const [screenCode, setScreenCode] = useState(sourceScreen ? SCREEN_CODES[sourceScreen].code : '')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [annotating, setAnnotating] = useState(false)

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  function chooseImage(file: Blob | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choisissez une image.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('L’image doit faire au maximum 8 Mo.')
      return
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImage(file)
    setImageUrl(URL.createObjectURL(file))
    setStrokes([])
    setAnnotating(false)
    setError('')
  }

  function handlePaste(event: React.ClipboardEvent) {
    const blob = imageFromClipboard(event.clipboardData)
    if (!blob) return
    event.preventDefault()
    chooseImage(blob)
  }

  async function pasteImage() {
    if (!navigator.clipboard?.read) {
      inputRef.current?.click()
      return
    }
    try {
      const items = await navigator.clipboard.read()
      const imageItem = items.find((item) => item.types.some((type) => type.startsWith('image/')))
      const type = imageItem?.types.find((candidate) => candidate.startsWith('image/'))
      const blob = type ? await imageItem?.getType(type) : undefined
      if (!blob) {
        setError('Aucune image dans le presse-papier. Copiez une image, ou utilisez « Choisir une image ».')
        return
      }
      chooseImage(blob)
    } catch {
      inputRef.current?.click()
    }
  }

  const canSend = Boolean(image && isFeedbackReportValid({ screen_code: screenCode, comment, image_blob: image, image_bytes: image.size, strokes }))

  async function send() {
    if (!image || !canSend) return
    setSaving(true)
    setError('')
    try {
      const flattened = await flattenImage(image, strokes)
      await feedbackReportRepo.create({
        id: newId(),
        screen_code: screenCode.trim(),
        comment: comment.trim(),
        image_blob: flattened,
        image_path: null,
        image_bytes: flattened.size,
        strokes,
        app_version: __APP_DEV_VERSION__,
        created_at: new Date().toISOString(),
        sync_status: 'pending',
        last_attempt_at: null,
      })
      void syncFeedbackNow()
      goTo('feedback-list')
    } catch {
      setError('Le retour n’a pas pu être enregistré sur cet appareil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={pageStyle} onPaste={handlePaste}>
      <button onClick={() => back('dashboard')} aria-label="Retour" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: 0 }}>← Retour</button>
      <div>
        <h1 style={{ margin: 0 }}>Nouveau retour</h1>
        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--color-text-muted)' }}>Ajoutez une capture. L’annotation au crayon est facultative : activez-la si vous voulez entourer ce qui pose problème.</p>
      </div>
      <input ref={inputRef} aria-label="Choisir une image" type="file" accept="image/*" hidden onChange={(event) => chooseImage(event.target.files?.[0])} />
      {!imageUrl ? (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <Button onClick={() => inputRef.current?.click()}>Choisir une image</Button>
          <Button variant="secondary" onClick={pasteImage}>Coller une image</Button>
        </div>
      ) : (
        <>
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              display: 'flex',
              gap: 'var(--spacing-sm)',
              flexWrap: 'wrap',
              padding: 'var(--spacing-sm) 0',
              backgroundColor: 'var(--color-background)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <Button onClick={() => setAnnotating((current) => !current)} aria-pressed={annotating}>
              {annotating ? 'Terminer l’annotation' : 'Annoter l’image'}
            </Button>
            <Button variant="secondary" onClick={() => setStrokes(undoStroke(strokes))} disabled={strokes.length === 0}>Annuler le trait</Button>
            <Button variant="secondary" onClick={() => setStrokes(clearStrokes())} disabled={strokes.length === 0}>Effacer les traits</Button>
          </div>
          <AnnotationCanvas imageUrl={imageUrl} strokes={strokes} onChange={setStrokes} active={annotating} />
        </>
      )}
      <label htmlFor="feedback-screen-code">Numéro d’écran</label>
      <input id="feedback-screen-code" value={screenCode} onChange={(event) => setScreenCode(event.target.value)} style={inputStyle} placeholder="E10" />
      <label htmlFor="feedback-comment">Commentaire</label>
      <textarea id="feedback-comment" value={comment} onChange={(event) => setComment(event.target.value)} style={inputStyle} rows={4} placeholder="Décrivez ce qui s’est passé." />
      {error && <p role="alert" style={{ margin: 0, color: 'var(--color-error)' }}>{error}</p>}
      {!isSyncConsentGranted() && (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Le partage des données est désactivé. Votre retour sera conservé sur cet appareil et envoyé
          dès que vous l’activez dans Réglages › Confidentialité.
        </p>
      )}
      <Button fullWidth onClick={send} disabled={!canSend || saving}>{saving ? 'Enregistrement…' : 'Envoyer'}</Button>
      <Button variant="secondary" fullWidth onClick={() => goTo('feedback-list')}>Voir mes retours</Button>
    </main>
  )
}
