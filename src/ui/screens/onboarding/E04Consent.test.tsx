import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect } from 'vitest'
import { renderWithApp, makeAppContext } from '@/test/testUtils'
import {
  grantSyncConsent,
  isSyncConsentCurrent,
  isSyncConsentGranted,
  LEGACY_CONSENT_VERSION,
} from '@/data/sync/syncConsent'
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

  it('mentionne l’envoi des catégories (données de santé) et de l’âge', () => {
    renderWithApp(<E04Consent />)
    expect(screen.getByText('Données de santé et âge')).toBeInTheDocument()
    expect(screen.getByText(/données de santé/)).toHaveTextContent(/âge sont aussi envoyés/)
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

  it('J’accepte enregistre la version courante du consentement', async () => {
    grantSyncConsent(LEGACY_CONSENT_VERSION)
    renderWithApp(<E04Consent />)
    await userEvent.click(screen.getByRole('button', { name: 'J’accepte le partage' }))
    expect(isSyncConsentCurrent()).toBe(true)
  })

  it('Continuer sans partager retire un consentement ancien au lieu de le laisser actif', async () => {
    grantSyncConsent(LEGACY_CONSENT_VERSION)
    renderWithApp(<E04Consent />)
    await userEvent.click(screen.getByRole('button', { name: 'Continuer sans partager' }))
    expect(isSyncConsentGranted()).toBe(false)
  })

  it('enchaîne vers le rattrapage du profil quand la suite le prévoit', async () => {
    const ctx = makeAppContext({
      route: { name: 'consent', next: { name: 'profile', next: 'dashboard' } },
      screen: 'consent',
    })
    renderWithApp(<E04Consent />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'J’accepte le partage' }))
    expect(ctx.goTo).toHaveBeenCalledWith({ name: 'profile', next: 'dashboard' })
  })

  it('après un import, reprend vers l’écran prévu au lieu du profil', async () => {
    const ctx = makeAppContext({ route: { name: 'consent', next: 'dashboard' }, screen: 'consent' })
    renderWithApp(<E04Consent />, ctx)
    await userEvent.click(screen.getByRole('button', { name: 'J’accepte le partage' }))
    expect(isSyncConsentGranted()).toBe(true)
    expect(ctx.goTo).toHaveBeenCalledWith('dashboard')
  })
})
