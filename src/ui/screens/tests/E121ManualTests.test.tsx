import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { makeAppContext, renderWithApp } from '@/test/testUtils'
import { manualTestsCatalog } from '@/domain/data/manualTestsCatalog'
import { E121ManualTests } from './E121ManualTests'

afterEach(() => {
  localStorage.clear()
})

function expandCategory(category: string) {
  fireEvent.click(screen.getByRole('button', { name: `Déplier la catégorie ${category}` }))
}

describe('E121ManualTests', () => {
  it('n’affiche que les catégories, repliées, au chargement', () => {
    renderWithApp(<E121ManualTests />)

    expect(screen.getByRole('heading', { name: 'Outils : Listes' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ouvrir le test Créer une liste' })).not.toBeInTheDocument()
  })

  it('déplie une catégorie pour afficher ses tests', () => {
    renderWithApp(<E121ManualTests />)

    expandCategory('Outils : Listes')

    expect(screen.getByRole('button', { name: 'Ouvrir le test Créer une liste' })).toBeInTheDocument()
  })

  it('affiche les tests nouveaux avec une pastille rouge', () => {
    renderWithApp(<E121ManualTests />)

    for (const category of ['Accueil / Planning', 'Tâches', 'Outils : Budget', 'Outils : Listes', 'Énergie', 'Paramètres / Profil']) {
      expandCategory(category)
    }

    expect(screen.getAllByLabelText('Nouveau test')).toHaveLength(manualTestsCatalog.length)
    expect(screen.getAllByText('Jamais testé')).toHaveLength(manualTestsCatalog.length)
  })

  it('affiche le dernier résultat connu pour un test encore à faire', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'old', test_id: 'menu-actions-tache-simplifie', test_revision: 1, status: 'nok', comment: 'Ancien refus', created_at: '2026-08-14T09:00:00.000Z' },
        { id: 'new', test_id: 'menu-actions-tache-simplifie', test_revision: 1, status: 'nok', comment: 'Toujours en échec', created_at: '2026-08-14T10:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Tâches')

    expect(screen.getByText('Non validé')).toBeInTheDocument()
  })

  it('retire un test valide de la liste affichée', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'new', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T10:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Outils : Listes')

    expect(screen.queryByRole('button', { name: 'Ouvrir le test Créer une liste' })).not.toBeInTheDocument()
  })

  it('masque un test dont le dernier résultat est validé après un échec', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'old', test_id: 'creer-une-liste', status: 'nok', comment: 'Ancien échec', created_at: '2026-08-14T09:00:00.000Z' },
        { id: 'new', test_id: 'creer-une-liste', status: 'ok', comment: null, created_at: '2026-08-14T10:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Outils : Listes')

    expect(screen.queryByRole('button', { name: 'Ouvrir le test Créer une liste' })).not.toBeInTheDocument()
  })

  it('masque un test dont le dernier résultat est un échec sur la révision courante', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'ko', test_id: 'creer-une-liste', status: 'nok', comment: 'Le bouton est absent.', created_at: '2026-08-14T10:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Outils : Listes')

    expect(screen.queryByRole('button', { name: 'Ouvrir le test Créer une liste' })).not.toBeInTheDocument()
  })

  it('réaffiche un test quand sa révision est plus récente que son dernier résultat validé', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'old', test_id: 'menu-actions-tache-simplifie', status: 'ok', comment: null, created_at: '2026-08-25T16:11:25.470Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Tâches')

    expect(screen.getByRole('button', { name: 'Ouvrir le test Menu d’actions simplifié sur la fiche d’une tâche' })).toBeInTheDocument()
  })

  it('masque un test révisé après sa validation dans la révision courante', () => {
    const ctx = makeAppContext({
      manualTestResults: [
        { id: 'current', test_id: 'menu-actions-tache-simplifie', test_revision: 2, status: 'ok', comment: null, created_at: '2026-08-25T18:00:00.000Z' },
      ],
    })
    renderWithApp(<E121ManualTests />, ctx)
    expandCategory('Tâches')

    expect(screen.queryByRole('button', { name: 'Ouvrir le test Menu d’actions simplifié sur la fiche d’une tâche' })).not.toBeInTheDocument()
  })

  it('demande un commentaire avant d’enregistrer un résultat non validé', async () => {
    const submitManualTestResult = vi.fn().mockResolvedValue(undefined)
    renderWithApp(<E121ManualTests />, makeAppContext({ submitManualTestResult }))
    expandCategory('Outils : Listes')

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le test Créer une liste' }))
    expect(screen.getByRole('dialog', { name: 'Résultat du test Créer une liste' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Non validé' }))

    const save = screen.getByRole('button', { name: 'Enregistrer' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Expliquez ce qui n’a pas fonctionné'), { target: { value: 'Le bouton est absent.' } })
    expect(save).not.toBeDisabled()
    fireEvent.click(save)

    await waitFor(() => {
      expect(submitManualTestResult).toHaveBeenCalledWith('creer-une-liste', 'nok', 'Le bouton est absent.', undefined)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('déplie et replie les étapes d’un test depuis la liste', () => {
    renderWithApp(<E121ManualTests />)
    expandCategory('Outils : Listes')

    const toggle = screen.getByRole('button', { name: 'Déplier la description de Créer une liste' })
    const listCountBefore = screen.getAllByRole('list').length

    fireEvent.click(toggle)
    expect(screen.getAllByRole('list')).toHaveLength(listCountBefore + 1)
    expect(screen.getByRole('button', { name: 'Replier la description de Créer une liste' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Replier la description de Créer une liste' }))
    expect(screen.getAllByRole('list')).toHaveLength(listCountBefore)
  })

  it('affiche l’historique complet du test ouvert', () => {
    renderWithApp(
      <E121ManualTests />,
      makeAppContext({
        manualTestResults: [
          { id: 'first', test_id: 'menu-actions-tache-simplifie', test_revision: 1, status: 'nok', comment: 'Le bouton est absent.', created_at: '2026-08-14T09:00:00.000Z' },
          { id: 'second', test_id: 'menu-actions-tache-simplifie', test_revision: 1, status: 'nok', comment: 'Toujours en échec', created_at: '2026-08-14T10:00:00.000Z' },
        ],
      }),
    )
    expandCategory('Tâches')

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le test Menu d’actions simplifié sur la fiche d’une tâche' }))
    expect(screen.getByRole('heading', { name: 'Historique' })).toBeInTheDocument()
    expect(screen.getByText('Le bouton est absent.')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Historique du test' })).getAllByText('Non validé')).toHaveLength(2)
  })

})
