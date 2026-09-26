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

  it('désactive les valeurs qui dépasseraient maxMinutes', () => {
    render(<DurationRoller minutes={30} onChange={vi.fn()} maxMinutes={59} />)
    const hours = screen.getByLabelText('Heures') as HTMLSelectElement
    expect((hours.querySelector('option[value="0"]') as HTMLOptionElement).disabled).toBe(false)
    expect((hours.querySelector('option[value="1"]') as HTMLOptionElement).disabled).toBe(true)
    const days = screen.getByLabelText('Jours') as HTMLSelectElement
    expect((days.querySelector('option[value="1"]') as HTMLOptionElement).disabled).toBe(true)
  })

  it('plafonne le total transmis à maxMinutes', async () => {
    const onChange = vi.fn()
    render(<DurationRoller minutes={50} onChange={onChange} maxMinutes={100} />)
    await userEvent.selectOptions(screen.getByLabelText('Heures'), '1')
    expect(onChange).toHaveBeenCalledWith(100)
  })

  it('signale la limite atteinte', () => {
    render(<DurationRoller minutes={59} onChange={vi.fn()} maxMinutes={59} />)
    expect(screen.getByText('Durée limitée pour finir avant minuit.')).toBeTruthy()
  })
})
