import { describe, expect, it } from 'vitest'
import { manualTestsCatalog } from './manualTestsCatalog'

describe('manualTestsCatalog', () => {
  // Catalogue vidé le 2026-09-13 (décision utilisateur) : les 46 tests précédents sont
  // sauvegardés dans Archives/manualTestsCatalog_backup_2026-09-13.md.
  it('est vide (tests retirés de l’appli le 2026-09-13)', () => {
    expect(manualTestsCatalog.length).toBe(0)
  })

  it('donne un identifiant unique à chaque test', () => {
    expect(new Set(manualTestsCatalog.map((test) => test.id)).size).toBe(manualTestsCatalog.length)
  })
})
