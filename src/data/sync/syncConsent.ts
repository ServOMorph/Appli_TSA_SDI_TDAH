const CONSENT_KEY = 'sync_consent_granted'
const CONSENT_VERSION_KEY = 'sync_consent_version'
const HEALTH_DECLINED_KEY = 'sync_health_declined'
// Doit rester identique a LAST_SUCCESS_KEY de syncClient.ts. Dupliquer la chaine plutot
// que d'importer syncClient : ce module est importe par syncClient, l'import inverse creerait
// un cycle.
const LAST_SUCCESS_KEY = 'sync_last_success_at'

/** Consentement donne avant l'envoi des categories de sante et de l'age (ou tacite, cf. backfill). */
export const LEGACY_CONSENT_VERSION = 1
/** Consentement donne sur le texte qui mentionne les categories de sante et l'age. */
export const CURRENT_CONSENT_VERSION = 2

export function isSyncConsentGranted(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'true'
}

export function getSyncConsentVersion(): number {
  const version = Number(localStorage.getItem(CONSENT_VERSION_KEY))
  return Number.isInteger(version) && version >= LEGACY_CONSENT_VERSION ? version : LEGACY_CONSENT_VERSION
}

/** Consentement accorde sur le texte actuel (celui qui mentionne les categories de sante et l'age). */
export function isSyncConsentCurrent(): boolean {
  return isSyncConsentGranted() && getSyncConsentVersion() >= CURRENT_CONSENT_VERSION
}

export function grantSyncConsent(version: number = CURRENT_CONSENT_VERSION): void {
  localStorage.setItem(CONSENT_KEY, 'true')
  localStorage.setItem(CONSENT_VERSION_KEY, String(version))
  localStorage.removeItem(HEALTH_DECLINED_KEY)
}

/**
 * Refus du renouvellement par une personne dont le consentement date d'avant l'envoi des
 * categories de sante et de l'age : le partage ancien continue, sans ces deux donnees
 * (isSyncConsentCurrent reste faux, syncClient les retire), et la question n'est plus reposee.
 */
export function declineHealthDataConsent(): void {
  localStorage.setItem(HEALTH_DECLINED_KEY, 'true')
}

export function hasDeclinedHealthData(): boolean {
  return localStorage.getItem(HEALTH_DECLINED_KEY) === 'true'
}

export function revokeSyncConsent(): void {
  localStorage.removeItem(CONSENT_KEY)
  localStorage.removeItem(CONSENT_VERSION_KEY)
  localStorage.removeItem(HEALTH_DECLINED_KEY)
  // Sans ce retrait, backfillSyncConsentFromHistory() re-accorderait le consentement au
  // prochain lancement (LAST_SUCCESS_KEY encore present), annulant ce retrait explicite.
  localStorage.removeItem(LAST_SUCCESS_KEY)
}

/**
 * Reprise sans regression (decision d'integration DI5). Un appareil qui a deja synchronise
 * au moins une fois porte sync_last_success_at : l'accord etait tacite avant l'introduction
 * du consentement explicite. On pose le flag d'office, sans ecran, pour ne pas couper sa
 * synchronisation au deploiement de cette phase. Idempotent. Version ancienne : le texte
 * actuel n'a pas ete presente.
 */
export function backfillSyncConsentFromHistory(): void {
  if (isSyncConsentGranted()) return
  if (localStorage.getItem(LAST_SUCCESS_KEY)) grantSyncConsent(LEGACY_CONSENT_VERSION)
}
