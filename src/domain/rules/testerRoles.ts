import type { Settings } from '@/domain/entities/settings'

/**
 * Catégorie d'un testeur, déduite de son code saisi en Paramètres > Profil. Ce n'est pas un
 * contrôle d'accès : le code est saisi librement, sans authentification.
 */
export type TesterRole = 'admin' | 'testeur'

export const ADMIN_TESTER_CODES: readonly string[] = ['marie', 'dev']

export function getTesterRole(testerCode: string | undefined): TesterRole {
  const normalized = testerCode?.trim().toLowerCase() ?? ''
  return ADMIN_TESTER_CODES.includes(normalized) ? 'admin' : 'testeur'
}

export function canUseFeedback(role: TesterRole): boolean {
  return role === 'admin'
}

export function hasFeedbackAccess(settings: Settings | null | undefined): boolean {
  return canUseFeedback(getTesterRole(settings?.tester_code))
}
