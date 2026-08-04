import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DurationRoller } from './DurationRoller'

describe('DurationRoller', () => {
  it('décompose une durée en jours/heures/minutes', () => {
    render(<DurationRoller minutes={1530} onChange={vi.fn()} />)
    expect((screen.getByLabelText('Jours') as HTMLSelectElement).value).toBe('1')
    expect((screen.getByLabelText('Heures') as HTMLSelectElement).value).toBe('1')
    expect((screen.getByLabelText('Minutes') as HTMLSelectElement).value).toBe('30')
  })

  it('affiche 0 partout quand minutes est null', () => {
    render(<DurationRoller minutes={null} onChange={vi.fn()} />)
    expect((screen.getByLabelText('Jours') as HTMLSelectElement).value).toBe('0')
    expect((screen.getByLabelText('Heures') as HTMLSelectElement).value).toBe('0')
    expect((screen.getByLabelText('Minutes') as HTMLSelectElement).value).toBe('0')
  })

  it('appelle onChange avec le total en minutes après changement', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={0} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Heures'), '2')
    expect(onChange).toHaveBeenCalledWith(120)
  })

  it('appelle onChange(null) quand la durée totale retombe à 0', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={30} onChange={onChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Minutes'), '0')
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
