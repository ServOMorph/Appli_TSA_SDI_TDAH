import { describe, expect, it } from 'vitest'
import { manualTestsCatalog } from './manualTestsCatalog'

describe('manualTestsCatalog', () => {
  it('contient au moins un test à faire', () => {
    expect(manualTestsCatalog.length).toBeGreaterThan(0)
  })

  it('donne un identifiant unique à chaque test', () => {
    expect(new Set(manualTestsCatalog.map((test) => test.id)).size).toBe(manualTestsCatalog.length)
  })
})
