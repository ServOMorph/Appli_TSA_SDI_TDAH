import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScreenCodeBadge } from '@/ui/components/ScreenCodeBadge'
import { makeAppContext, renderWithApp } from '@/test/testUtils'

describe('ScreenCodeBadge', () => {
  it.each([
    ['dashboard', 'E10', 'Accueil'],
    ['manual-tests', 'E121', 'Tests à faire'],
    ['budget-settings', 'E74', 'Paramètres du budget'],
  ] as const)('affiche le code de la route %s', (screenName, code, label) => {
    renderWithApp(
      <ScreenCodeBadge />,
      makeAppContext({ screen: screenName, route: { name: screenName } }),
    )

    expect(screen.getByLabelText(`Écran ${code} : ${label}`)).toHaveTextContent(code)
  })
})
