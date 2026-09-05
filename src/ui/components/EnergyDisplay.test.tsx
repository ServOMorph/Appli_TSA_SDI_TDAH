import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EnergyDisplay } from './EnergyDisplay'

describe('EnergyDisplay', () => {
  it('encadre la pastille en contour coloré, sans fond (#34)', () => {
    render(
      <EnergyDisplay
        status="filled"
        value={3}
        plannedCost={2}
        onClick={() => {}}
        ambianceColor="#ff00aa"
      />,
    )
    const chip = screen.getByRole('button')
    expect(chip.style.border).toBe('2px solid rgb(255, 0, 170)')
    expect(chip.style.backgroundColor).toBe('var(--color-surface)')
  })

  it('appelle onClick au clic', async () => {
    const onClick = vi.fn()
    render(
      <EnergyDisplay
        status={null}
        value={null}
        plannedCost={0}
        onClick={onClick}
        ambianceColor="#4a7c99"
      />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
