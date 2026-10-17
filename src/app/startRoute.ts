import type { PostConsentTarget, Route, StartDestination } from '@/app/navigation'
import { hasDeclinedHealthData, isSyncConsentCurrent, isSyncConsentGranted } from '@/data/sync/syncConsent'
import type { User } from '@/domain/entities/user'

export function needsProfileCatchUp(user: User): boolean {
  return !user.neuro_categories || user.neuro_categories.length === 0 || user.age === undefined
}

/**
 * Toute personne dont le consentement date d'avant l'envoi des catégories de santé et de l'âge
 * le renouvelle une fois : l'acceptation, ou le refus des seules donnees de sante (le partage
 * ancien continue sans elles), ferme la question.
 */
export function needsConsentRenewal(): boolean {
  return isSyncConsentGranted() && !isSyncConsentCurrent() && !hasDeclinedHealthData()
}

interface StartRouteInput {
  user: User
  destination: StartDestination
  /** Après un import : un appareil sans consentement passe aussi par l'écran de consentement. */
  askMissingConsent: boolean
}

/** Premier écran d'un utilisateur existant : consentement à renouveler, rattrapage du profil, puis destination. */
export function resolveStartRoute({ user, destination, askMissingConsent }: StartRouteInput): Route {
  const afterConsent: PostConsentTarget = needsProfileCatchUp(user)
    ? { name: 'profile', next: destination }
    : destination
  const consentNeeded = (askMissingConsent && !isSyncConsentGranted()) || needsConsentRenewal()
  if (consentNeeded) return { name: 'consent', next: afterConsent }
  return typeof afterConsent === 'string' ? { name: afterConsent } : afterConsent
}
