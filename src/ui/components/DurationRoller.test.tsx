import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DurationRoller } from './DurationRoller'

function unitValue(label: string): string {
  return screen.getByRole('button', { name: label }).textContent ?? ''
}

describe('DurationRoller', () => {
  it('décompose une durée en jours/heures/minutes', () => {
    render(<DurationRoller minutes={1530} onChange={vi.fn()} />)
    expect(unitValue('Jours')).toBe('1')
    expect(unitValue('Heures')).toBe('1')
    expect(unitValue('Minutes')).toBe('30')
  })

  it('affiche 0 partout quand minutes est null', () => {
    render(<DurationRoller minutes={null} onChange={vi.fn()} />)
    expect(unitValue('Jours')).toBe('0')
    expect(unitValue('Heures')).toBe('0')
    expect(unitValue('Minutes')).toBe('0')
  })

  it('ouvre le pavé de chiffres au clic sur une unité', async () => {
    render(<DurationRoller minutes={null} onChange={vi.fn()} />)
    expect(screen.queryByRole('group', { name: 'Chiffres pour heures' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Heures' }))
    expect(screen.getByRole('group', { name: 'Chiffres pour heures' })).toBeTruthy()
  })

  it('appelle onChange avec le total en minutes après saisie des heures', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={0} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Heures' }))
    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange).toHaveBeenCalledWith(120)
  })

  it('compose un nombre à deux chiffres puis repart du dernier chiffre au-delà du maximum', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<DurationRoller minutes={0} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Minutes' }))
    await userEvent.click(screen.getByRole('button', { name: '4' }))
    expect(onChange).toHaveBeenLastCalledWith(4)
    rerender(<DurationRoller minutes={4} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    expect(onChange).toHaveBeenLastCalledWith(45)
    rerender(<DurationRoller minutes={45} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '9' }))
    expect(onChange).toHaveBeenLastCalledWith(9)
  })

  it('appelle onChange(null) quand la durée totale retombe à 0', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={30} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Minutes' }))
    await userEvent.click(screen.getByRole('button', { name: 'Effacer' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('plafonne le total transmis à maxMinutes', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={50} onChange={onChange} maxMinutes={100} />)
    await userEvent.click(screen.getByRole('button', { name: 'Heures' }))
    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange).toHaveBeenCalledWith(100)
  })

  it('signale la limite atteinte', () => {
    render(<DurationRoller minutes={59} onChange={vi.fn()} maxMinutes={59} />)
    expect(screen.getByText('Durée limitée pour finir avant minuit.')).toBeTruthy()
  })
})
