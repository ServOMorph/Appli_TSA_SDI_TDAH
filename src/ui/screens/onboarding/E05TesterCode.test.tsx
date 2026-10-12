import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { ADMIN_CREDENTIAL_HASHES, deriveAdminKey } from '@/domain/rules/adminCredentials'
import { E05TesterCode } from './E05TesterCode'

vi.mock('@/domain/rules/adminCredentials', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/rules/adminCredentials')>()
  return {
    ...actual,
    deriveAdminKey: vi.fn(async (identity: string) => actual.ADMIN_CREDENTIAL_HASHES[actual.normalizeIdentity(identity)]),
  }
})

const deriveMock = vi.mocked(deriveAdminKey)

describe('E05TesterCode', () => {
  it('affiche un champ facultatif et le bouton Continuer', () => {
    renderWithApp(<E05TesterCode />)
    expect(screen.getByLabelText('Code testeur')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument()
  })

  it('mémorise le code saisi et navigue vers le consentement', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E05TesterCode />, ctx)
    await userEvent.type(screen.getByLabelText('Code testeur'), 'RaphTest')
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('RaphTest')
    expect(ctx.setPendingAdminKey).toHaveBeenCalledWith('')
    expect(ctx.goTo).toHaveBeenCalledWith('consent')
  })

  it('permet de continuer sans code', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E05TesterCode />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('')
    expect(ctx.goTo).toHaveBeenCalledWith('consent')
  })

  describe('identité administrateur', () => {
    it('affiche le champ mot de passe uniquement pour une identité admin', async () => {
      renderWithApp(<E05TesterCode />)
      expect(screen.queryByLabelText('Mot de passe administrateur')).toBeNull()
      await userEvent.type(screen.getByLabelText('Code testeur'), 'dev')
      expect(screen.getByLabelText('Mot de passe administrateur')).toHaveAttribute('type', 'password')
    })

    it('mémorise la clé dérivée, jamais le mot de passe, quand il est correct', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E05TesterCode />, ctx)
      await userEvent.type(screen.getByLabelText('Code testeur'), 'marie')
      await userEvent.type(screen.getByLabelText('Mot de passe administrateur'), 'secret-long')
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(ctx.setPendingAdminKey).toHaveBeenCalledWith(ADMIN_CREDENTIAL_HASHES.marie)
      expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('marie')
      expect(ctx.goTo).toHaveBeenCalledWith('consent')
      expect(JSON.stringify(vi.mocked(ctx.setPendingAdminKey).mock.calls)).not.toContain('secret-long')
    })

    it('refuse un mot de passe incorrect sans avancer', async () => {
      deriveMock.mockResolvedValueOnce('0'.repeat(64))
      const ctx = makeAppContext()
      renderWithApp(<E05TesterCode />, ctx)
      await userEvent.type(screen.getByLabelText('Code testeur'), 'marie')
      await userEvent.type(screen.getByLabelText('Mot de passe administrateur'), 'faux')
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Mot de passe incorrect.')
      expect(ctx.goTo).not.toHaveBeenCalled()
      expect(ctx.setPendingTesterCode).not.toHaveBeenCalled()
    })

    it('signale une dérivation impossible sans avancer', async () => {
      deriveMock.mockRejectedValueOnce(new Error('crypto.subtle indisponible'))
      const ctx = makeAppContext()
      renderWithApp(<E05TesterCode />, ctx)
      await userEvent.type(screen.getByLabelText('Code testeur'), 'dev')
      await userEvent.type(screen.getByLabelText('Mot de passe administrateur'), 'x')
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Vérification impossible')
      expect(ctx.goTo).not.toHaveBeenCalled()
    })

    it('continue comme testeur ordinaire si le mot de passe est laissé vide', async () => {
      const ctx = makeAppContext()
      renderWithApp(<E05TesterCode />, ctx)
      await userEvent.type(screen.getByLabelText('Code testeur'), 'marie')
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
      expect(ctx.setPendingTesterCode).toHaveBeenCalledWith('marie')
      expect(ctx.setPendingAdminKey).toHaveBeenCalledWith('')
      expect(ctx.goTo).toHaveBeenCalledWith('consent')
    })
  })
})
