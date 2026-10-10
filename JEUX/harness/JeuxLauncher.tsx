import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/ui/components/Card'
import { CATALOGUE, type JeuEntry } from './catalogue'

const HOST_ATTR = 'data-jeux-host'

const tileButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  color: 'var(--color-text)',
  fontSize: '1rem',
  fontFamily: 'ui-rounded, "SF Pro Rounded", "Segoe UI Rounded", var(--font-body)',
  padding: 0,
}

function GameOverlay({ game, onClose }: { game: JeuEntry; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.label}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        overflowY: 'auto',
        backgroundColor: 'var(--color-bg, var(--color-surface))',
        color: 'var(--color-text)',
      }}
    >
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          padding: 'var(--spacing-xl)',
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100svh',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            aria-label="Retour"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-text)', padding: 0 }}
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>{game.label}</h1>
        </header>
        <game.Component />
      </main>
    </div>,
    document.body,
  )
}

export function JeuxLauncher() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const autoOpened = useRef(false)

  useEffect(() => {
    function attach() {
      const section = document.querySelector('section[aria-label="Outils"]')
      if (!section) {
        autoOpened.current = false
        setHost(null)
        return
      }
      const toggle = section.querySelector<HTMLButtonElement>('button[aria-expanded]')
      if (toggle && toggle.getAttribute('aria-expanded') === 'false' && !autoOpened.current) {
        autoOpened.current = true
        toggle.click()
      }
      let node = section.querySelector<HTMLElement>(`[${HOST_ATTR}]`)
      if (!node) {
        node = document.createElement('div')
        node.setAttribute(HOST_ATTR, '')
        section.appendChild(node)
      }
      setHost(node)
    }
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    attach()
    return () => observer.disconnect()
  }, [])

  const openGame = CATALOGUE.find((g) => g.id === openId) ?? null

  return (
    <>
      {host &&
        createPortal(
          CATALOGUE.length > 0 ? (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Jeux</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-sm)',
                  marginTop: 'var(--spacing-md)',
                }}
              >
                {CATALOGUE.map((game) => (
                  <Card key={game.id}>
                    <button style={tileButtonStyle} onClick={() => setOpenId(game.id)}>
                      {game.label}
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ) : null,
          host,
        )}
      {openGame && <GameOverlay game={openGame} onClose={() => setOpenId(null)} />}
    </>
  )
}
