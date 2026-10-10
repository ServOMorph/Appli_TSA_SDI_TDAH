import { beforeEach, describe, expect, it } from 'vitest'
import { canUseFeedback, getTesterRole, hasFeedbackAccess } from '@/domain/rules/testerRoles'
import { ADMIN_CREDENTIAL_HASHES, deriveAdminKey, isAdminIdentity } from '@/domain/rules/adminCredentials'
import { makeSettings } from '@/test/factories'

describe('testerRoles', () => {
  beforeEach(() => {
    for (const key of Object.keys(ADMIN_CREDENTIAL_HASHES)) delete ADMIN_CREDENTIAL_HASHES[key]
  })

  it('classe en admin une identité avec la clé de son mot de passe, casse et espaces ignorés', async () => {
    ADMIN_CREDENTIAL_HASHES.marie = await deriveAdminKey('marie', 'mot-de-passe-long-1')
    const key = await deriveAdminKey('marie', 'mot-de-passe-long-1')
    expect(getTesterRole(' Marie ', key)).toBe('admin')
  })

  it('refuse une identité admin sans clé ou avec une mauvaise clé', async () => {
    ADMIN_CREDENTIAL_HASHES.marie = await deriveAdminKey('marie', 'mot-de-passe-long-1')
    expect(getTesterRole('marie')).toBe('testeur')
    expect(getTesterRole('marie', await deriveAdminKey('marie', 'autre'))).toBe('testeur')
  })

  it('refuse une clé valide présentée avec une autre identité', async () => {
    ADMIN_CREDENTIAL_HASHES.marie = await deriveAdminKey('marie', 'mot-de-passe-long-1')
    ADMIN_CREDENTIAL_HASHES.dev = await deriveAdminKey('dev', 'mot-de-passe-long-2')
    expect(getTesterRole('dev', await deriveAdminKey('marie', 'mot-de-passe-long-1'))).toBe('testeur')
  })

  it('classe en testeur tout code sans empreinte enregistrée', () => {
    for (const code of ['raphtest', 'satine', '', undefined, 'marie', 'dev']) {
      expect(getTesterRole(code, 'nimporte')).toBe('testeur')
    }
  })

  it('produit la même empreinte que scripts/hash_admin_code.py', async () => {
    expect(await deriveAdminKey(' Marie ', 'secret-test')).toBe(
      'eba69d2e84f277c3bf759ab5e1f5c4f18f49106710504e6d5fa7f3ffd5d3f300',
    )
  })

  it('reconnaît les identités admin', () => {
    expect(isAdminIdentity(' DEV ')).toBe(true)
    expect(isAdminIdentity('satine')).toBe(false)
  })

  it('réserve les retours aux admins', () => {
    expect(canUseFeedback('admin')).toBe(true)
    expect(canUseFeedback('testeur')).toBe(false)
  })

  it('refuse les retours sans réglages chargés', () => {
    expect(hasFeedbackAccess(null)).toBe(false)
    expect(hasFeedbackAccess(makeSettings({ tester_code: 'marie' }))).toBe(false)
  })
})
