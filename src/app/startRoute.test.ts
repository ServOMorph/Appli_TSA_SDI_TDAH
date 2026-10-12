import { afterEach, describe, expect, it } from 'vitest'
import { grantSyncConsent, LEGACY_CONSENT_VERSION } from '@/data/sync/syncConsent'
import type { User } from '@/domain/entities/user'
import { needsConsentRenewal, needsProfileCatchUp, resolveStartRoute } from './startRoute'

const completeUser: User = {
  id: 'u1',
  neuro_categories: ['tsa'],
  age: 30,
  onboarding_completed: true,
  created_at: '',
  updated_at: '',
}

const legacyUser: User = { id: 'u1', profile_type: 'adult', onboarding_completed: true, created_at: '', updated_at: '' }


afterEach(() => {
  localStorage.clear()
})

describe('needsProfileCatchUp', () => {
  it('est faux quand les catégories et l’âge sont renseignés', () => {
    expect(needsProfileCatchUp(completeUser)).toBe(false)
  })

  it('est vrai pour un ancien profil sans catégories ni âge', () => {
    expect(needsProfileCatchUp(legacyUser)).toBe(true)
  })

  it('est vrai quand une liste de catégories est vide ou que l’âge manque', () => {
    expect(needsProfileCatchUp({ ...completeUser, neuro_categories: [] })).toBe(true)
    expect(needsProfileCatchUp({ ...completeUser, age: undefined })).toBe(true)
  })
})

describe('needsConsentRenewal', () => {
  it('concerne toute personne au consentement ancien', () => {
    grantSyncConsent(LEGACY_CONSENT_VERSION)
    expect(needsConsentRenewal()).toBe(true)
  })

  it('ne concerne pas un consentement déjà à jour', () => {
    grantSyncConsent()
    expect(needsConsentRenewal()).toBe(false)
  })

  it('ne concerne pas une personne sans consentement (partage refusé ou retiré)', () => {
    expect(needsConsentRenewal()).toBe(false)
  })
})

describe('resolveStartRoute', () => {
  it('mène directement à la destination quand rien n’est à renouveler', () => {
    grantSyncConsent()
    expect(
      resolveStartRoute({ user: completeUser, destination: 'dashboard', askMissingConsent: false }),
    ).toEqual({ name: 'dashboard' })
  })

  it('passe par le rattrapage du profil quand il manque', () => {
    expect(
      resolveStartRoute({ user: legacyUser, destination: 'energy-checkin', askMissingConsent: false }),
    ).toEqual({ name: 'profile', next: 'energy-checkin' })
  })

  it('renouvelle d’abord le consentement, puis rattrape le profil', () => {
    grantSyncConsent(LEGACY_CONSENT_VERSION)
    expect(
      resolveStartRoute({ user: legacyUser, destination: 'dashboard', askMissingConsent: false }),
    ).toEqual({ name: 'consent', next: { name: 'profile', next: 'dashboard' } })
  })

  it('renouvelle le consentement puis mène à la destination quand le profil est complet', () => {
    grantSyncConsent(LEGACY_CONSENT_VERSION)
    expect(
      resolveStartRoute({ user: completeUser, destination: 'dashboard', askMissingConsent: false }),
    ).toEqual({ name: 'consent', next: 'dashboard' })
  })

  it('ne redemande pas un consentement absent au démarrage ordinaire', () => {
    expect(
      resolveStartRoute({ user: completeUser, destination: 'dashboard', askMissingConsent: false }),
    ).toEqual({ name: 'dashboard' })
  })

  it('redemande un consentement absent après un import', () => {
    expect(
      resolveStartRoute({ user: completeUser, destination: 'dashboard', askMissingConsent: true }),
    ).toEqual({ name: 'consent', next: 'dashboard' })
  })
})
