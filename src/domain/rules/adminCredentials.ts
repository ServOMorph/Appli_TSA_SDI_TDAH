/**
 * Identités administrateur et empreintes de leur mot de passe. Les empreintes sont générées par
 * `scripts/hash_admin_code.py` et collées ici ; le mot de passe lui-même n'est stocké nulle part.
 * Les empreintes sont publiques (embarquées dans l'appli) : elles gênent la saisie fortuite d'une
 * identité admin, pas une personne qui modifie ses données locales avec les outils du navigateur.
 */
export const ADMIN_IDENTITIES: readonly string[] = ['marie', 'dev']

export const ADMIN_CREDENTIAL_HASHES: Record<string, string> = {
  marie: 'fd8d0aa7c63793c297f9f38a55115d0a7243a6bb9c7acc0e61019e347df61a94',
  dev: '9569a1c7516cbbdf003a1ee2421f7917724f9c432bcf8e4c079a4a32671635a7',
}

const PBKDF2_ITERATIONS = 210_000

export function normalizeIdentity(code: string | undefined): string {
  return code?.trim().toLowerCase() ?? ''
}

export function isAdminIdentity(code: string | undefined): boolean {
  return ADMIN_IDENTITIES.includes(normalizeIdentity(code))
}

export async function deriveAdminKey(identity: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(`appli-audhd:${normalizeIdentity(identity)}`),
      iterations: PBKDF2_ITERATIONS,
    },
    material,
    256,
  )
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('')
}
