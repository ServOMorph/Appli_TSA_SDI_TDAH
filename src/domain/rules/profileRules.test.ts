import { describe, expect, it } from 'vitest'
import {
  getNeuroCategoryLabels,
  NEURO_CATEGORY_OPTIONS,
  parseAge,
  sanitizeAge,
  sanitizeNeuroCategories,
  toggleNeuroCategory,
} from './profileRules'

describe('toggleNeuroCategory', () => {
  it('ajoute plusieurs catégories dans l’ordre de la liste', () => {
    expect(toggleNeuroCategory(toggleNeuroCategory([], 'tdah'), 'tsa')).toEqual(['tsa', 'tdah'])
  })

  it('retire une catégorie déjà cochée', () => {
    expect(toggleNeuroCategory(['tsa', 'tdah'], 'tsa')).toEqual(['tdah'])
  })

  it('« Je ne sais pas » remplace toutes les autres catégories', () => {
    expect(toggleNeuroCategory(['tsa', 'tdah'], 'ne_sais_pas')).toEqual(['ne_sais_pas'])
  })

  it('cocher une catégorie décoche « Je ne sais pas »', () => {
    expect(toggleNeuroCategory(['ne_sais_pas'], 'sdi')).toEqual(['sdi'])
  })

  it('cocher « Neurotypique » décoche les autres catégories', () => {
    expect(toggleNeuroCategory(['tsa', 'tdah'], 'neurotypique')).toEqual(['neurotypique'])
  })

  it('cocher une autre catégorie décoche « Neurotypique »', () => {
    expect(toggleNeuroCategory(['neurotypique'], 'tdah')).toEqual(['tdah'])
  })

  it('« Neurotypique » et « Je ne sais pas » se décochent mutuellement', () => {
    expect(toggleNeuroCategory(['neurotypique'], 'ne_sais_pas')).toEqual(['ne_sais_pas'])
    expect(toggleNeuroCategory(['ne_sais_pas'], 'neurotypique')).toEqual(['neurotypique'])
  })

  it('décocher « Je ne sais pas » laisse la liste vide', () => {
    expect(toggleNeuroCategory(['ne_sais_pas'], 'ne_sais_pas')).toEqual([])
  })
})

describe('getNeuroCategoryLabels', () => {
  it('renvoie les libellés dans l’ordre de la liste', () => {
    expect(getNeuroCategoryLabels(['neurotypique', 'avec_di', 'tsa'])).toEqual(['TSA', 'Avec DI', 'Neurotypique'])
  })

  it('renvoie une liste vide sans catégorie', () => {
    expect(getNeuroCategoryLabels(undefined)).toEqual([])
  })
})

describe('parseAge', () => {
  it('accepte un entier entre 1 et 120, espaces ignorés', () => {
    expect(parseAge(' 34 ')).toBe(34)
    expect(parseAge('1')).toBe(1)
    expect(parseAge('120')).toBe(120)
  })

  it.each(['', '0', '121', '-5', '3.5', '12 ans', 'abc', '1000'])('refuse « %s »', (input) => {
    expect(parseAge(input)).toBeNull()
  })
})

describe('sanitizeNeuroCategories', () => {
  it('ignore les valeurs inconnues et les doublons', () => {
    expect(sanitizeNeuroCategories(['tdah', 'x', 'tdah', 'tsa'])).toEqual(['tsa', 'tdah'])
  })

  it('« Je ne sais pas » prime sur les autres', () => {
    expect(sanitizeNeuroCategories(['tsa', 'ne_sais_pas'])).toEqual(['ne_sais_pas'])
  })

  it('« Neurotypique » prime sur les catégories non exclusives', () => {
    expect(sanitizeNeuroCategories(['tsa', 'neurotypique'])).toEqual(['neurotypique'])
  })

  it('« Je ne sais pas » prime sur « Neurotypique »', () => {
    expect(sanitizeNeuroCategories(['neurotypique', 'ne_sais_pas'])).toEqual(['ne_sais_pas'])
  })

  it('renvoie undefined si la valeur n’est pas une liste', () => {
    expect(sanitizeNeuroCategories('tsa')).toBeUndefined()
    expect(sanitizeNeuroCategories(undefined)).toBeUndefined()
  })
})

describe('sanitizeAge', () => {
  it('garde un entier dans les bornes', () => {
    expect(sanitizeAge(30)).toBe(30)
  })

  it('écarte les valeurs hors bornes, décimales ou non numériques', () => {
    expect(sanitizeAge(0)).toBeUndefined()
    expect(sanitizeAge(200)).toBeUndefined()
    expect(sanitizeAge(30.5)).toBeUndefined()
    expect(sanitizeAge('30')).toBeUndefined()
  })
})

describe('HPI et définitions', () => {
  it('HPI est une catégorie cumulable avec les autres', () => {
    expect(toggleNeuroCategory(['tsa'], 'hpi')).toEqual(['tsa', 'hpi'])
  })

  it('chaque catégorie a une définition', () => {
    for (const option of NEURO_CATEGORY_OPTIONS) expect(option.definition.length).toBeGreaterThan(10)
  })
})
