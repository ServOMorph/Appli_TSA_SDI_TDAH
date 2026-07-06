interface AppShellProps {
  overloadMode?: boolean
  children: React.ReactNode
}

export function AppShell({ overloadMode, children }: AppShellProps) {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100svh',
        backgroundColor: overloadMode ? 'var(--color-surface)' : undefined,
      }}
    >
      {children}
    </main>
  )
}
