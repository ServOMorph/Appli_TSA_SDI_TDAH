import { useApp } from '@/app/AppContext'
import { getScreenCode } from '@/domain/data/screenCodes'

export function ScreenCodeBadge() {
  const { route } = useApp()
  const { code, label } = getScreenCode(route)

  return (
    <span
      aria-label={`Écran ${code} : ${label}`}
      style={{
        position: 'fixed',
        top: 'var(--spacing-sm)',
        right: 'var(--spacing-sm)',
        zIndex: 50,
        borderRadius: 'var(--radius-sm)',
        padding: '2px 6px',
        background: 'color-mix(in srgb, var(--color-background) 88%, transparent)',
        color: 'var(--color-text-muted)',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        lineHeight: 1.2,
      }}
    >
      {code}
    </span>
  )
}
