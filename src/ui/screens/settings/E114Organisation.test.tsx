import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E114Organisation } from './E114Organisation'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

function renderE114(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E114Organisation />
    </AppContext.Provider>,
  )
}

describe('E114Organisation', () => {
  it('affiche le titre Organisation', () => {
    renderE114()
    expect(screen.getByText('Organisation')).toBeInTheDocument()
  })

  it('affiche les sections ordre et affichage', () => {
    renderE114()
    expect(screen.getByText('Ordre des modules')).toBeInTheDocument()
    expect(screen.getByText('Affichage des modules')).toBeInTheDocument()
  })

  it('navigue vers settings via Retour', () => {
    const goTo = vi.fn()
    renderE114({ goTo })
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }))
    expect(goTo).toHaveBeenCalledWith('settings')
  })
})
