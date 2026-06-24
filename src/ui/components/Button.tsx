import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-secondary)',
    border: '1px solid var(--color-border)',
  },
}

export function Button({ variant = 'primary', fullWidth = false, style, children, ...rest }: ButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        borderRadius: 'var(--radius-md)',
        fontSize: '1rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        width: fullWidth ? '100%' : undefined,
        transition: 'opacity 0.15s',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
