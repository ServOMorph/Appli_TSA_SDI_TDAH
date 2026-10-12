import { beforeEach, describe, expect, it } from 'vitest'
import {
  backfillSyncConsentFromHistory,
  CURRENT_CONSENT_VERSION,
  getSyncConsentVersion,
  grantSyncConsent,
  isSyncConsentCurrent,
  isSyncConsentGranted,
  LEGACY_CONSENT_VERSION,
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

  describe('version du consentement', () => {
    it('un consentement accordé aujourd’hui porte la version courante', () => {
      grantSyncConsent()
      expect(getSyncConsentVersion()).toBe(CURRENT_CONSENT_VERSION)
      expect(isSyncConsentCurrent()).toBe(true)
    })

    it('un consentement sans version enregistrée est de la version ancienne', () => {
      localStorage.setItem('sync_consent_granted', 'true')
      expect(getSyncConsentVersion()).toBe(LEGACY_CONSENT_VERSION)
      expect(isSyncConsentCurrent()).toBe(false)
    })

    it('un consentement non accordé n’est jamais à jour', () => {
      expect(isSyncConsentCurrent()).toBe(false)
    })

    it('ignore une version illisible', () => {
      localStorage.setItem('sync_consent_version', 'abc')
      expect(getSyncConsentVersion()).toBe(LEGACY_CONSENT_VERSION)
    })

    it('revoke retire aussi la version', () => {
      grantSyncConsent()
      revokeSyncConsent()
      expect(localStorage.getItem('sync_consent_version')).toBeNull()
    })
  })

  describe('backfillSyncConsentFromHistory (DI5)', () => {
    it('pose le flag d’office si l’appareil a déjà synchronisé', () => {
      localStorage.setItem('sync_last_success_at', new Date().toISOString())
      backfillSyncConsentFromHistory()
      expect(isSyncConsentGranted()).toBe(true)
      expect(isSyncConsentCurrent()).toBe(false)
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

    it('revoke retire aussi l’historique de succès, empêchant un re-octroi ultérieur', () => {
      localStorage.setItem('sync_last_success_at', new Date().toISOString())
      grantSyncConsent()
      revokeSyncConsent()
      backfillSyncConsentFromHistory()
      expect(isSyncConsentGranted()).toBe(false)
    })
  })
})
