import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from '@/ui/components/AppShell'

describe('AppShell', () => {
  // Sans largeur explicite, margin auto dans le parent flex colonne rend la largeur dépendante du
  // contenu : WebKit l'élargissait jusqu'à 480px avec un titre de tâche long (débordement à droite).
  it('contraint la largeur du conteneur à celle de l’écran', () => {
    render(<AppShell><p>contenu</p></AppShell>)
    const main = screen.getByRole('main')
    expect(main.style.width).toBe('100%')
    expect(parseFloat(main.style.minWidth)).toBe(0)
    expect(main.style.maxWidth).toBe('480px')
  })
})
