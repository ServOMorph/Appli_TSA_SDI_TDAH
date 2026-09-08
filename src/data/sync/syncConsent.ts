const CONSENT_KEY = 'sync_consent_granted'
// Doit rester identique a LAST_SUCCESS_KEY de syncClient.ts. Dupliquer la chaine plutot
// que d'importer syncClient : ce module est importe par syncClient, l'import inverse creerait
// un cycle.
const LAST_SUCCESS_KEY = 'sync_last_success_at'

export function isSyncConsentGranted(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true'
}

export function grantSyncConsent(): void {
  localStorage.setItem(CONSENT_KEY, 'true')
}

export function revokeSyncConsent(): void {
  localStorage.removeItem(CONSENT_KEY)
}

/**
 * Reprise sans regression (decision d'integration DI5). Un appareil qui a deja synchronise
 * au moins une fois porte sync_last_success_at : l'accord etait tacite avant l'introduction
 * du consentement explicite. On pose le flag d'office, sans ecran, pour ne pas couper sa
 * synchronisation au deploiement de cette phase. Idempotent.
 */
export function backfillSyncConsentFromHistory(): void {
  if (isSyncConsentGranted()) return
  if (localStorage.getItem(LAST_SUCCESS_KEY)) grantSyncConsent()
}
