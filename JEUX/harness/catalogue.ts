import type { ComponentType } from 'react'
import { PlanningEnergie } from '../planning_energie/PlanningEnergie'
import { TriCalme } from '../tri_calme/TriCalme'

export interface JeuEntry {
  id: string
  label: string
  Component: ComponentType
}

export const CATALOGUE: JeuEntry[] = [
  { id: 'planning-energie', label: 'Planning d’énergie', Component: PlanningEnergie },
  { id: 'tri-calme', label: 'Tri calme', Component: TriCalme },
]
