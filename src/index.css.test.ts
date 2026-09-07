import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const normalized = css.replace(/\s+/g, '')

describe('index.css — contrôles de formulaire', () => {
  it('force font-size >= 16px sur input/select/textarea (pas de zoom iOS au focus)', () => {
    expect(normalized).toContain('input,select,textarea{font-size:max(16px,1rem);}')
  })
})
