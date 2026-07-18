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

export function plannedTaskTintStyle(completed: boolean, color: string): CSSProperties {
  return {
    backgroundColor: completed ? flashyBackground(color) : pastelBackground(color),
    color: completed ? '#fff' : 'var(--color-text)',
    textDecoration: completed ? 'line-through' : 'none',
  }
}
