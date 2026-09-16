import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { E05TesterCode } from './E05TesterCode'

describe('E05TesterCode', () => {
  it('affiche un champ facultatif et le bouton Continuer', () => {
    renderWithApp(<E05TesterCode />)
    expect(screen.getByLabelText('Code testeur')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument()
  })

  it('mémorise le code saisi et navigue vers profile', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E05TesterCode />, ctx)
    await userEvent.type(screen.getByLabelText('Code testeur'), 'RaphTest')
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('RaphTest')
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })

  it('permet de continuer sans code', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E05TesterCode />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('')
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })
})
