import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LazyScreenBoundary } from './LazyScreenBoundary'

function Bomb(): React.ReactElement {
  throw new Error('chunk introuvable')
}

describe('LazyScreenBoundary', () => {
  let reloadSpy: ReturnType<typeof vi.fn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    reloadSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    consoleErrorSpy.mockRestore()
  })

  it('rattrape une erreur de rendu (chunk purgé) et déclenche un rechargement', () => {
    render(
      <LazyScreenBoundary>
        <Bomb />
      </LazyScreenBoundary>,
    )

    expect(reloadSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('Chargement...')
  })

  it("déclenche un rechargement sur l'événement vite:preloadError", () => {
    render(
      <LazyScreenBoundary>
        <div>écran chargé</div>
      </LazyScreenBoundary>,
    )

    expect(screen.getByText('écran chargé')).toBeDefined()
    window.dispatchEvent(new Event('vite:preloadError'))

    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  it("n'interfère pas avec un rendu sans erreur", () => {
    render(
      <LazyScreenBoundary>
        <div>écran chargé</div>
      </LazyScreenBoundary>,
    )

    expect(screen.getByText('écran chargé')).toBeDefined()
    expect(reloadSpy).not.toHaveBeenCalled()
  })
})
