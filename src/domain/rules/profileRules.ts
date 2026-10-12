import type { NeuroCategory } from '@/domain/entities/user'

export const NEURO_CATEGORY_OPTIONS: { value: NeuroCategory; label: string; definition: string }[] = [
  { value: 'tsa', label: 'TSA', definition: "Trouble du spectre de l'autisme : manière différente de communiquer, de percevoir les sensations et de s'organiser." },
  { value: 'tdah', label: 'TDAH', definition: "Trouble du déficit de l'attention avec ou sans hyperactivité : difficultés d'attention, d'impulsivité et parfois d'agitation." },
  { value: 'sdi', label: 'SDI', definition: "Sans déficience intellectuelle : se dit d'une personne autiste ou TDAH dont le développement intellectuel est dans la norme." },
  { value: 'avec_di', label: 'Avec DI', definition: "Avec déficience intellectuelle : capacités intellectuelles et d'adaptation plus limitées que la moyenne." },
  { value: 'hpi', label: 'HPI', definition: "Haut potentiel intellectuel : fonctionnement intellectuel nettement supérieur à la moyenne, souvent avec une grande sensibilité." },
  { value: 'neurotypique', label: 'Neurotypique', definition: "Fonctionnement neurologique considéré comme typique, sans trouble du neurodéveloppement." },
  { value: 'ne_sais_pas', label: 'Je ne sais pas', definition: "Aucun diagnostic connu, ou en cours de questionnement." },
]

export const MIN_AGE = 1
export const MAX_AGE = 120

const CATEGORY_ORDER = NEURO_CATEGORY_OPTIONS.map((option) => option.value)

function sortCategories(categories: NeuroCategory[]): NeuroCategory[] {
  return [...categories].sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
}

/** Par ordre de priorité : une catégorie exclusive exclut toutes les autres, et inversement. */
const EXCLUSIVE_CATEGORIES: NeuroCategory[] = ['ne_sais_pas', 'neurotypique']

export function toggleNeuroCategory(current: NeuroCategory[], category: NeuroCategory): NeuroCategory[] {
  if (current.includes(category)) return current.filter((c) => c !== category)
  if (EXCLUSIVE_CATEGORIES.includes(category)) return [category]
  return sortCategories([...current.filter((c) => !EXCLUSIVE_CATEGORIES.includes(c)), category])
}

export function getNeuroCategoryLabels(categories: NeuroCategory[] | undefined): string[] {
  if (!categories) return []
  return NEURO_CATEGORY_OPTIONS.filter((option) => categories.includes(option.value)).map((option) => option.label)
}

export function parseAge(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d{1,3}$/.test(trimmed)) return null
  const value = Number(trimmed)
  return value >= MIN_AGE && value <= MAX_AGE ? value : null
}

/** Reprend d'un fichier importé uniquement les catégories connues, sans doublon. */
export function sanitizeNeuroCategories(value: unknown): NeuroCategory[] | undefined {
  if (!Array.isArray(value)) return undefined
  const known = CATEGORY_ORDER.filter((category) => value.includes(category))
  const exclusive = EXCLUSIVE_CATEGORIES.find((category) => known.includes(category))
  return exclusive ? [exclusive] : known
}

export function sanitizeAge(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined
  return value >= MIN_AGE && value <= MAX_AGE ? value : undefined
}
