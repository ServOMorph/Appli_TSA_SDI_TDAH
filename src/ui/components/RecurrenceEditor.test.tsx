import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RecurrenceEditor } from './RecurrenceEditor'
import type { RecurrenceRuleInput } from '@/app/contexts/usePlanningState'

const base: RecurrenceRuleInput = {
  frequency: 'daily',
  interval: 1,
  weekdays: null,
  end_type: 'never',
  end_date: null,
  end_count: null,
}

describe('RecurrenceEditor', () => {
  it('affiche les jours de la semaine seulement en fréquence hebdomadaire', () => {
    const { rerender } = render(<RecurrenceEditor value={base} onChange={vi.fn()} />)
    expect(screen.queryByRole('group', { name: 'Jours de la semaine' })).toBeNull()
    rerender(<RecurrenceEditor value={{ ...base, frequency: 'weekly' }} onChange={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Jours de la semaine' })).toBeDefined()
  })

  it('appelle onChange avec l\'intervalle modifié', () => {
    const onChange = vi.fn()
    render(<RecurrenceEditor value={base} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Tous les'), { target: { value: '3' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ interval: 3 }))
  })

  it('bascule un jour de semaine sélectionné', async () => {
    const onChange = vi.fn()
    render(<RecurrenceEditor value={{ ...base, frequency: 'weekly', weekdays: [] }} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'L' }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ weekdays: [1] }))
  })

  it('sélectionne fin par date et met à jour end_date', async () => {
    const onChange = vi.fn()
    render(<RecurrenceEditor value={base} onChange={onChange} />)
    const radios = screen.getAllByRole('radio')
    await userEvent.click(radios[1])
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ end_type: 'date' }))
  })
})
