import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import { isSyncConsentGranted } from '@/data/sync/syncConsent'
import { E04Consent } from './E04Consent'

afterEach(() => {
  localStorage.clear()
})

describe('E04Consent', () => {
  it('décrit ce qui est envoyé, l’usage et la conservation', () => {
    renderWithApp(<E04Consent />)
    expect(screen.getByText('Ce qui est envoyé')).toBeInTheDocument()
    expect(screen.getByText('Usage et hébergement')).toBeInTheDocument()
    expect(screen.getByText('Conservation et effacement')).toBeInTheDocument()
  })

  it('accorde le consentement et passe au profil au clic sur J’accepte', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04Consent />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'J’accepte le partage' }))
    expect(isSyncConsentGranted()).toBe(true)
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })

  it('passe au profil sans accorder le consentement au clic sur Continuer sans partager', async () => {
    const ctx = makeAppContext()
    renderWithApp(<E04Consent />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'Continuer sans partager' }))
    expect(isSyncConsentGranted()).toBe(false)
    expect(ctx.goTo).toHaveBeenCalledWith('profile')
  })
})
