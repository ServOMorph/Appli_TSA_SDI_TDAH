import { describe, expect, it } from 'vitest'
import { canUseFeedback, getTesterRole, hasFeedbackAccess } from '@/domain/rules/testerRoles'

describe('testerRoles', () => {
  it.each(['marie', 'dev', ' Marie ', 'DEV'])('classe %s en admin', (code) => {
    expect(getTesterRole(code)).toBe('admin')
  })

  it.each(['raphtest', 'satine', '', undefined])('classe %s en testeur', (code) => {
    expect(getTesterRole(code)).toBe('testeur')
  })

  it('réserve les retours aux admins', () => {
    expect(canUseFeedback('admin')).toBe(true)
    expect(canUseFeedback('testeur')).toBe(false)
  })

  it('refuse les retours sans réglages chargés', () => {
    expect(hasFeedbackAccess(null)).toBe(false)
  })
})
