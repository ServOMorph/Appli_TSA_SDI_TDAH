import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('affiche le contenu enfant', () => {
    render(<Card><p>Contenu de la carte</p></Card>)
    expect(screen.getByText('Contenu de la carte')).toBeDefined()
  })

  it('accepte un style supplémentaire', () => {
    const { container } = render(<Card style={{ margin: '8px' }}>Test</Card>)
    const div = container.firstChild as HTMLElement
    expect(div.style.margin).toBe('8px')
  })
})
