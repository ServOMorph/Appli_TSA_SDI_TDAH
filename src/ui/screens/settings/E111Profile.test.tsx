import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('affiche le code testeur enregistré', () => {
    renderE111({ settings: { ...baseSettings, tester_code: 'alpha-01' } })
    expect(screen.getByLabelText('Code testeur')).toHaveValue('alpha-01')
  })

  it('affiche un champ vide quand aucun code n’est défini', () => {
    renderE111({ settings: baseSettings })
    expect(screen.getByLabelText('Code testeur')).toHaveValue('')
  })

  it('désactive Enregistrer tant que le code n’a pas changé', () => {
    renderE111({ settings: { ...baseSettings, tester_code: 'alpha-01' } })
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  })

  it('désactive Enregistrer même si le code stocké contient des espaces superflus', () => {
    renderE111({ settings: { ...baseSettings, tester_code: ' alpha-01 ' } })
    expect(screen.getByLabelText('Code testeur')).toHaveValue('alpha-01')
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  })

  it('enregistre le nouveau code testeur saisi', () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE111({ settings: baseSettings, updateSettings })
    fireEvent.change(screen.getByLabelText('Code testeur'), { target: { value: 'marie' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(updateSettings).toHaveBeenCalledWith({ tester_code: 'marie' })
  })

  it('affiche le champ mot de passe uniquement pour une identité admin', () => {
    renderE111({ settings: baseSettings })
    expect(screen.queryByLabelText('Mot de passe administrateur')).toBeNull()
    fireEvent.change(screen.getByLabelText('Code testeur'), { target: { value: 'dev' } })
    expect(screen.getByLabelText('Mot de passe administrateur')).toHaveAttribute('type', 'password')
  })

  it('enregistre la clé dérivée du mot de passe, jamais le mot de passe', async () => {
    const updateSettings = vi.fn().mockResolvedValue(undefined)
    renderE111({ settings: baseSettings, updateSettings })
    fireEvent.change(screen.getByLabelText('Code testeur'), { target: { value: 'marie' } })
    fireEvent.change(screen.getByLabelText('Mot de passe administrateur'), { target: { value: 'secret-long' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => expect(updateSettings).toHaveBeenCalled())
    const patch = updateSettings.mock.calls[0][0]
    expect(patch.tester_code).toBe('marie')
    expect(patch.admin_key).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(patch)).not.toContain('secret-long')
  })
})
