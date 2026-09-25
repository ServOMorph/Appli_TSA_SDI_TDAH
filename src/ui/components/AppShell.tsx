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
        paddingBottom: 'var(--bottomnav-h)',
        gap: 'var(--spacing-lg)',
        width: '100%',
        minWidth: 0,
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
