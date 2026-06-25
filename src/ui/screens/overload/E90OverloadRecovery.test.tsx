import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { E90OverloadRecovery } from './E90OverloadRecovery'
import { makeAppContext } from '@/test/testUtils'
import { AppContext } from '@/app/AppContext'

function renderE90(overrides = {}) {
  const ctx = makeAppContext(overrides)
  return render(
    <AppContext.Provider value={ctx}>
      <E90OverloadRecovery />
    </AppContext.Provider>,
  )
}

describe('E90OverloadRecovery', () => {
  it('affiche le titre mode surcharge', () => {
    renderE90()
    expect(screen.getByText('Mode surcharge actif')).toBeInTheDocument()
  })

  it('affiche les conseils de récupération', () => {
    renderE90()
    expect(screen.getByText('Conseils')).toBeInTheDocument()
    expect(screen.getByText(/Fermez les yeux/)).toBeInTheDocument()
  })

  it('affiche le bouton désactiver', () => {
    renderE90()
    expect(screen.getByText('Désactiver le mode surcharge')).toBeInTheDocument()
  })

  it('appelle setOverloadMode(false) et navigue vers dashboard au clic désactiver', async () => {
    const setOverloadMode = vi.fn().mockResolvedValue(undefined)
    const goTo = vi.fn()
    renderE90({ setOverloadMode, goTo })
    fireEvent.click(screen.getByText('Désactiver le mode surcharge'))
    await vi.waitFor(() => {
      expect(setOverloadMode).toHaveBeenCalledWith(false)
      expect(goTo).toHaveBeenCalledWith('dashboard')
    })
  })

})
