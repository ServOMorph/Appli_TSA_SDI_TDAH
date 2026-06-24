import { encrypt, decrypt, deriveKey } from './crypto'

describe('crypto wrapper', () => {
  const password = 'test-password-secure-42'
  const plaintext = 'données sensibles utilisateur'

  it('chiffre et déchiffre une chaîne', async () => {
    const encoded = await encrypt(plaintext, password)
    const decoded = await decrypt(encoded, password)
    expect(decoded).toBe(plaintext)
  })

  it('produit un ciphertext différent à chaque appel (IV/salt aléatoires)', async () => {
    const a = await encrypt(plaintext, password)
    const b = await encrypt(plaintext, password)
    expect(a).not.toBe(b)
  })

  it('échoue au déchiffrement avec un mauvais mot de passe', async () => {
    const encoded = await encrypt(plaintext, password)
    await expect(decrypt(encoded, 'wrong-password')).rejects.toThrow()
  })

  it('deriveKey produit une CryptoKey AES-GCM 256 bits', async () => {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const key = await deriveKey(password, salt)
    expect(key.type).toBe('secret')
    expect(key.algorithm.name).toBe('AES-GCM')
  })
})
