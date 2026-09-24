import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RoutineTimeKeypad } from './RoutineTimeKeypad'

describe('RoutineTimeKeypad', () => {
  it('affiche l\'heure au fur et à mesure de la saisie', async () => {
    const user = userEvent.setup()
    render(<RoutineTimeKeypad onComplete={vi.fn()} />)
    expect(screen.getByLabelText('Heure saisie')).toHaveTextContent('__:__')
    await user.click(screen.getByRole('button', { name: '0' }))
    expect(screen.getByLabelText('Heure saisie')).toHaveTextContent('0_:__')
    await user.click(screen.getByRole('button', { name: '8' }))
    expect(screen.getByLabelText('Heure saisie')).toHaveTextContent('08:__')
  })

  it('appelle onComplete avec HH:MM une fois les 4 chiffres saisis', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<RoutineTimeKeypad onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '8' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    expect(onComplete).toHaveBeenCalledWith('08:30')
  })

  it('désactive les chiffres qui dépasseraient 23 heures', async () => {
    const user = userEvent.setup()
    render(<RoutineTimeKeypad onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: '3' })).toHaveProperty('disabled', true)
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByRole('button', { name: '4' })).toHaveProperty('disabled', true)
    expect(screen.getByRole('button', { name: '3' })).toHaveProperty('disabled', false)
  })

  it('Effacer remet la saisie à zéro', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<RoutineTimeKeypad onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '8' }))
    await user.click(screen.getByRole('button', { name: 'Effacer' }))
    expect(screen.getByLabelText('Heure saisie')).toHaveTextContent('__:__')
    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    await user.click(screen.getByRole('button', { name: '0' }))
    expect(onComplete).toHaveBeenCalledWith('12:00')
  })
})
