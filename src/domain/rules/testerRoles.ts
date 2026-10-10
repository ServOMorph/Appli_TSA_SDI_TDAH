import type { Settings } from '@/domain/entities/settings'
import { ADMIN_CREDENTIAL_HASHES, normalizeIdentity } from '@/domain/rules/adminCredentials'

/**
 * Catégorie d'un testeur. `admin` exige une identité admin dans Paramètres > Profil ET la clé
 * dérivée de son mot de passe. Contrôle côté appareil uniquement : le serveur ne vérifie rien.
 */
export type TesterRole = 'admin' | 'testeur'

export function getTesterRole(testerCode: string | undefined, adminKey?: string): TesterRole {
  const expected = ADMIN_CREDENTIAL_HASHES[normalizeIdentity(testerCode)]
  return expected && adminKey === expected ? 'admin' : 'testeur'
}

export function canUseFeedback(role: TesterRole): boolean {
  return role === 'admin'
}

export function hasFeedbackAccess(settings: Settings | null | undefined): boolean {
  return canUseFeedback(getTesterRole(settings?.tester_code, settings?.admin_key))
}
