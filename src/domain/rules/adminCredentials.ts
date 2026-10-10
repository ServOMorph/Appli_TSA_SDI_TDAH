/**
 * Identités administrateur et empreintes de leur mot de passe. Les empreintes sont générées par
 * `scripts/hash_admin_code.py` et collées ici ; le mot de passe lui-même n'est stocké nulle part.
 * Les empreintes sont publiques (embarquées dans l'appli) : elles gênent la saisie fortuite d'une
 * identité admin, pas une personne qui modifie ses données locales avec les outils du navigateur.
 */
export const ADMIN_IDENTITIES: readonly string[] = ['marie', 'dev']

export const ADMIN_CREDENTIAL_HASHES: Record<string, string> = {}

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
