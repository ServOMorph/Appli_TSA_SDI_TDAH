import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E02Profile } from './E02Profile'

describe('E02Profile', () => {
  it('affiche les 7 catégories et le champ âge, sans les anciens profils', () => {
    renderWithApp(<E02Profile />)
    for (const label of ['TSA', 'TDAH', 'SDI', 'Avec DI', 'HPI', 'Neurotypique', 'Je ne sais pas']) {
      expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked()
    }
    expect(screen.getByLabelText('Votre âge')).toHaveValue('')
    expect(screen.queryByText('Adolescent')).toBeNull()
    expect(screen.queryByText('Étudiant')).toBeNull()
    expect(screen.queryByText('Adulte')).toBeNull()
  })

  it('n\'affiche pas de bouton Ignorer', () => {
    renderWithApp(<E02Profile />)
    expect(screen.queryByRole('button', { name: 'Ignorer' })).toBeNull()
  })

  it('désactive Continuer tant qu\'aucune catégorie ni âge valide n\'est renseigné', async () => {
    renderWithApp(<E02Profile />)
    const next = screen.getByRole('button', { name: 'Continuer' })
    expect(next).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: 'TSA' }))
    expect(next).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Votre âge'), '0')
    expect(next).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Entrez un âge entre 1 et 120.')
  })

  it('désactive Continuer sans catégorie même avec un âge valide', async () => {
    renderWithApp(<E02Profile />)
    await userEvent.type(screen.getByLabelText('Votre âge'), '30')
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled()
  })

  it('permet de cocher plusieurs catégories', async () => {
    renderWithApp(<E02Profile />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'TSA' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'TDAH' }))
    expect(screen.getByRole('checkbox', { name: 'TSA' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'TDAH' })).toBeChecked()
  })

  it('« Je ne sais pas » décoche les autres catégories, et inversement', async () => {
    renderWithApp(<E02Profile />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'TSA' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Je ne sais pas' }))
    expect(screen.getByRole('checkbox', { name: 'TSA' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Je ne sais pas' })).toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: 'TDAH' }))
    expect(screen.getByRole('checkbox', { name: 'Je ne sais pas' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'TDAH' })).toBeChecked()
  })

  it('« Neurotypique » décoche les autres catégories, et inversement', async () => {
    renderWithApp(<E02Profile />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'TSA' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'TDAH' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Neurotypique' }))
    expect(screen.getByRole('checkbox', { name: 'Neurotypique' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'TSA' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'TDAH' })).not.toBeChecked()
    await userEvent.click(screen.getByRole('checkbox', { name: 'SDI' }))
    expect(screen.getByRole('checkbox', { name: 'Neurotypique' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'SDI' })).toBeChecked()
  })

  describe('rattrapage d\'un profil existant', () => {
    const catchUpContext = (overrides = {}) =>
      makeAppContext({
        route: { name: 'profile', next: 'dashboard' },
        screen: 'profile',
        currentUser: { id: 'u1', profile_type: 'adult', onboarding_completed: true, created_at: '', updated_at: '' },
        ...overrides,
      })

    it('met à jour le profil existant au lieu de créer un utilisateur, puis va à la destination', async () => {
      const ctx = catchUpContext()
      renderWithApp(<E02Profile />, ctx)
      await userEvent.click(screen.getByRole('checkbox', { name: 'TDAH' }))
      await userEvent.type(screen.getByLabelText('Votre âge'), '41')
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(ctx.updateProfile).toHaveBeenCalledWith({ neuro_categories: ['tdah'], age: 41 })
      expect(ctx.createUser).not.toHaveBeenCalled()
      expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
    })

    it('préremplit ce qui est déjà connu', () => {
      const ctx = catchUpContext({
        currentUser: { id: 'u1', neuro_categories: ['tsa'], onboarding_completed: true, created_at: '', updated_at: '' },
      })
      renderWithApp(<E02Profile />, ctx)
      expect(screen.getByRole('checkbox', { name: 'TSA' })).toBeChecked()
      expect(screen.getByLabelText('Votre âge')).toHaveValue('')
    })

    it('explique pourquoi l\'écran apparaît', () => {
      renderWithApp(<E02Profile />, catchUpContext())
      expect(screen.getByText(/maintenant demandées/)).toBeInTheDocument()
    })
  })

  it('crée l\'utilisateur avec les catégories et l\'âge puis navigue vers energy', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E02Profile />, ctx)
    await userEvent.click(screen.getByRole('checkbox', { name: 'TDAH' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'TSA' }))
    await userEvent.type(screen.getByLabelText('Votre âge'), '27')
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(ctx.createUser).toHaveBeenCalledWith({ neuro_categories: ['tsa', 'tdah'], age: 27 })
    expect(ctx.goTo).toHaveBeenCalledWith('energy')
  })
})
