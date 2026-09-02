import type { CSSProperties } from 'react'

export const DEFAULT_AMBIANCE_COLOR = '#4a7c99'

export function pastelBackground(color: string): string {
  return `color-mix(in srgb, ${color} 22%, var(--color-surface))`
}

export function mutedBackground(color: string): string {
  return `color-mix(in srgb, ${color} 55%, var(--color-surface))`
}

export function flashyBackground(color: string): string {
  return color
}

export function plannedTaskTintStyle(completed: boolean, color: string | null): CSSProperties {
  // Une tâche sans couleur choisie garde son texte lisible (`--color-text`) même cochée : le texte
  // blanc barré sur fond clair serait invisible (retour Marie #23).
  const hasColor = !!color && color !== 'var(--color-surface)'
  const effective = color ?? 'var(--color-surface)'
  return {
    backgroundColor: completed ? flashyBackground(effective) : pastelBackground(effective),
    color: completed && hasColor ? '#fff' : 'var(--color-text)',
    textDecoration: completed ? 'line-through' : 'none',
  }
}
