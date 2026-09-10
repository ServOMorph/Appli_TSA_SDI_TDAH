import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { grantSyncConsent } from '@/data/sync/syncConsent'

const mocks = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue('feedback-1'),
  flattenImage: vi.fn().mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' })),
}))

vi.mock('@/app/repositories', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/repositories')>()),
  feedbackReportRepo: { create: mocks.create },
  newId: () => 'feedback-1',
}))
vi.mock('@/data/images/flattenImage', () => ({ flattenImage: mocks.flattenImage }))
vi.mock('@/data/sync/feedbackClient', () => ({ syncFeedbackNow: vi.fn() }))

import { E122FeedbackCapture } from '@/ui/screens/feedback/E122FeedbackCapture'

describe('E122FeedbackCapture', () => {
  beforeEach(() => {
    mocks.create.mockClear()
    mocks.flattenImage.mockClear()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:capture') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => ({ clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn() })),
    })
  })

  afterEach(() => localStorage.clear())

  it('signale que le partage est désactivé et masque la note une fois activé', () => {
    const { unmount } = renderWithApp(<E122FeedbackCapture />, makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } }))
    expect(screen.getByText(/partage des données est désactivé/i)).toBeInTheDocument()
    unmount()
    grantSyncConsent()
    renderWithApp(<E122FeedbackCapture />, makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } }))
    expect(screen.queryByText(/partage des données est désactivé/i)).not.toBeInTheDocument()
  })

  it('désactive l’envoi sans image', () => {
    renderWithApp(<E122FeedbackCapture />, makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } }))
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
  })

  it('attache une image collée dans la page', () => {
    renderWithApp(<E122FeedbackCapture />, makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } }))
    const file = new File(['image'], 'capture.png', { type: 'image/png' })
    const clipboardData = {
      items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }],
      files: [file],
    }
    fireEvent.paste(screen.getByLabelText('Commentaire'), { clipboardData })
    expect(screen.getByRole('button', { name: 'Annuler le trait' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Choisir une image' })).not.toBeInTheDocument()
  })

  it('n’active le mode trait que sur choix explicite', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    renderWithApp(<E122FeedbackCapture />, makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } }))
    await userEvent.upload(screen.getByLabelText('Choisir une image'), new File(['image'], 'capture.png', { type: 'image/png' }))
    const canvas = screen.getByLabelText('Zone d’annotation')
    expect(canvas.style.pointerEvents).toBe('none')
    await userEvent.click(screen.getByRole('button', { name: 'Annoter l’image' }))
    expect(canvas.style.pointerEvents).toBe('auto')
    expect(screen.getByRole('button', { name: 'Terminer l’annotation' })).toBeInTheDocument()
  })

  it('aplatit puis enregistre le retour local', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const ctx = makeAppContext({ screen: 'feedback', route: { name: 'feedback', sourceScreen: 'dashboard' } })
    renderWithApp(<E122FeedbackCapture />, ctx)
    const file = new File(['image'], 'capture.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText('Choisir une image'), file)
    await userEvent.type(screen.getByLabelText('Commentaire'), 'Le bouton ne répond pas')
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }))
    expect(mocks.flattenImage).toHaveBeenCalledWith(file, [])
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ screen_code: 'E10', comment: 'Le bouton ne répond pas', sync_status: 'pending' }))
    expect(ctx.goTo).toHaveBeenCalledWith('feedback-list')
  })
})
