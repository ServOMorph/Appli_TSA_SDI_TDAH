import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E111Profile } from './E111Profile'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

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

  it('affiche le label du profil AuDHD', () => {
    renderE111({
      currentUser: {
        id: '1',
        profile_type: 'audhd',
        created_at: '',
        updated_at: '',
      },
    })
    expect(screen.getByLabelText('type de profil')).toHaveTextContent('AuDHD (TSA + TDAH)')
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE111({ goTo })
    fireEvent.click(screen.getByText('Retour'))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
