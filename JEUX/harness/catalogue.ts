import type { ComponentType } from 'react'
export interface JeuEntry {
  id: string
  label: string
  Component: ComponentType
}

export const CATALOGUE: JeuEntry[] = []
