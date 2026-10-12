import { ADMIN_CREDENTIAL_HASHES, deriveAdminKey, normalizeIdentity } from '@/domain/rules/adminCredentials'

export type AdminVerification = { ok: true; adminKey: string } | { ok: false; error: string }

export async function verifyAdminSecret(identity: string, secret: string): Promise<AdminVerification> {
  let adminKey: string
  try {
    adminKey = await deriveAdminKey(identity, secret)
  } catch {
    return { ok: false, error: 'Vérification impossible sur cet appareil (connexion non sécurisée).' }
  }
  if (adminKey !== ADMIN_CREDENTIAL_HASHES[normalizeIdentity(identity)]) {
    return { ok: false, error: 'Mot de passe incorrect.' }
  }
  return { ok: true, adminKey }
}
