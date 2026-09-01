export function ScreenLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100svh',
        color: 'var(--color-text-muted)',
      }}
      role="status"
      aria-live="polite"
    >
      Chargement...
    </div>
  )
}
