import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'
import { E121ManualTests } from './E121ManualTests'

afterEach(() => {
  localStorage.clear()
})

describe('E121ManualTests', () => {
  it('affiche les tests nouveaux avec une pastille rouge', () => {
    renderWithApp(<E121ManualTests />)

    expect(screen.getAllByLabelText('Nouveau test')).toHaveLength(manualTestsCatalog.length)
    expect(screen.getAllByText('Jamais testé')).toHaveLength(manualTestsCatalog.length)
  })

  it('affiche le dernier résultat connu pour chaque test', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'old', test_id: 'creer-une-liste', status: 'nok', comment: 'Ancien refus', created_at: '2026-08-14T09:00:00.000Z' },
        { id: 'new', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T10:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)

    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Nouveau test')).toHaveLength(manualTestsCatalog.length - 1)
  })

  it('demande un commentaire avant d’enregistrer un résultat non validé', async () => {
    const submitManualTestResult = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E121ManualTests />, makeAppContext({ submitManualTestResult }))

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le test Créer une liste' }))
    expect(screen.getByRole('dialog', { name: 'Résultat du test Créer une liste' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Non validé' }))

    const save = screen.getByRole('button', { name: 'Enregistrer' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Expliquez ce qui n’a pas fonctionné'), { target: { value: 'Le bouton est absent.' } })
    expect(save).not.toBeDisabled()
    fireEvent.click(save)

    await waitFor(() => {
      expect(submitManualTestResult).toHaveBeenCalledWith('creer-une-liste', 'nok', 'Le bouton est absent.')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('affiche l’historique complet du test ouvert', () => {
    renderWithApp(
      <E121ManualTests />,
      makeAppContext({
        manualTestResults: [
          { id: 'first', test_id: 'creer-une-liste', status: 'nok', comment: 'Le bouton est absent.', created_at: '2026-08-14T09:00:00.000Z' },
          { id: 'second', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T10:00:00.000Z' },
        ],
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le test Créer une liste' }))
    expect(screen.getByRole('heading', { name: 'Historique' })).toBeInTheDocument()
    expect(screen.getByText('Le bouton est absent.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Historique du test' })).getByText('Validé')).toBeInTheDocument()
  })

  it('masque la bannière urgente au clic sur Fait, de façon persistante', () => {
    const { unmount } = renderWithApp(<E121ManualTests />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fait' }))
    unmount()
    renderWithApp(<E121ManualTests />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
