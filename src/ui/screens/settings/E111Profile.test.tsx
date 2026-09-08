import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E111Profile } from './E111Profile'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'
import type { Settings } from '@/domain/entities/settings'

const baseSettings: Settings = {
  id: 'settings-1',
  user_id: 'user-1',
  dark_mode: false,
  font_size: 'medium',
  reduced_motion: false,
}

function renderE111(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E111Profile />
    </AppContext.Provider>,
  )
}

describe('E111Profile', () => {
  it('affiche le titre Profil', () => {
    renderE111()
    expect(screen.getByText('Profil')).toBeInTheDocument()
  })

  it('affiche Non défini quand pas d\'utilisateur', () => {
    renderE111({ currentUser: null })
    expect(screen.getByLabelText('type de profil')).toHaveTextContent('Non défini')
  })

  it('affiche le label du profil', () => {
    renderE111({
      currentUser: {
        id: '1',
        profile_type: 'teenager',
        onboarding_completed: true,
        created_at: '',
        updated_at: '',
      },
    })
    expect(screen.getByLabelText('type de profil')).toHaveTextContent('Adolescent')
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE111({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })

  it('enregistre le code testeur saisi via updateSettings', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE111({ settings: baseSettings, updateSettings })
    const input = screen.getByLabelText('Code testeur')
    fireEvent.change(input, { target: { value: '  alpha-01 ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le code' }))
    expect(updateSettings).toHaveBeenCalledWith({ tester_code: 'alpha-01' })
  })

  it('affiche une confirmation quand un code est déjà enregistré', () => {
    renderE111({ settings: { ...baseSettings, tester_code: 'alpha-01' } })
    expect(screen.getByRole('status')).toHaveTextContent('Code enregistré : alpha-01')
    expect(screen.getByRole('button', { name: 'Enregistrer le code' })).toBeDisabled()
  })

  it('désactive le bouton tant que la saisie est identique au code enregistré', () => {
    renderE111({ settings: baseSettings })
    expect(screen.getByRole('button', { name: 'Enregistrer le code' })).toBeDisabled()
    expect(screen.getByText('Aucun code enregistré.')).toBeInTheDocument()
  })

  it('retire le code quand le champ est vidé puis enregistré', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE111({ settings: { ...baseSettings, tester_code: 'alpha-01' }, updateSettings })
    fireEvent.change(screen.getByLabelText('Code testeur'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le code' }))
    expect(updateSettings).toHaveBeenCalledWith({ tester_code: undefined })
  })
})
