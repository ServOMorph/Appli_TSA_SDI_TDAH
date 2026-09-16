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

  it('affiche le code testeur enregistré', () => {
    renderE111({ settings: { ...baseSettings, tester_code: 'alpha-01' } })
    expect(screen.getByLabelText('code testeur')).toHaveTextContent('alpha-01')
  })

  it('affiche Aucun code enregistré quand aucun code n’est défini', () => {
    renderE111({ settings: baseSettings })
    expect(screen.getByLabelText('code testeur')).toHaveTextContent('Aucun code enregistré')
  })
})
