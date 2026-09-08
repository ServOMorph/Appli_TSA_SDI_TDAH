import { beforeEach, describe, expect, it } from 'vitest'
import {
  backfillSyncConsentFromHistory,
  grantSyncConsent,
  isSyncConsentGranted,
  revokeSyncConsent,
} from './syncConsent'

beforeEach(() => {
  localStorage.clear()
})

describe('syncConsent', () => {
  it('par défaut, le consentement n’est pas accordé', () => {
    expect(isSyncConsentGranted()).toBe(false)
  })

  it('grant puis revoke bascule l’état', () => {
    grantSyncConsent()
    expect(isSyncConsentGranted()).toBe(true)
    revokeSyncConsent()
    expect(isSyncConsentGranted()).toBe(false)
  })

  it('ne reconnaît que la valeur exacte "true"', () => {
    localStorage.setItem('sync_consent_granted', '1')
    expect(isSyncConsentGranted()).toBe(false)
  })

  describe('backfillSyncConsentFromHistory (DI5)', () => {
    it('pose le flag d’office si l’appareil a déjà synchronisé', () => {
      localStorage.setItem('sync_last_success_at', new Date().toISOString())
      backfillSyncConsentFromHistory()
      expect(isSyncConsentGranted()).toBe(true)
    })

    it('ne fait rien sur un appareil neuf', () => {
      backfillSyncConsentFromHistory()
      expect(isSyncConsentGranted()).toBe(false)
    })

    it('idempotent : n’écrase pas un consentement déjà retiré si aucun historique', () => {
      backfillSyncConsentFromHistory()
      backfillSyncConsentFromHistory()
      expect(isSyncConsentGranted()).toBe(false)
    })
  })
})
