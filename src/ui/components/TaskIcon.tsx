import { isValidTaskIcon } from '@/domain/rules/taskAppearance'

interface TaskIconProps {
  icon: string | null
  size?: number
}

function IconPaths({ icon }: { icon: string }) {
  switch (icon) {
    case 'home':
      return (
        <>
          <path d="M3 11l9-7 9 7" />
          <path d="M6 10.5V20h12v-9.5" />
        </>
      )
    case 'work':
      return (
        <>
          <rect x="3" y="7" width="18" height="12" rx="1.5" />
          <path d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7" />
        </>
      )
    case 'health':
      return (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="M12 8v8M8 12h8" />
        </>
      )
    case 'shopping':
      return (
        <>
          <path d="M6 8h12l-1.2 12H7.2L6 8z" />
          <path d="M9 8V6a3 3 0 016 0v2" />
        </>
      )
    case 'social':
      return (
        <>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2.5 19c.6-3 3-5 5.5-5s4.9 2 5.5 5" />
          <path d="M10.5 19c.6-3 3-5 5.5-5s4.9 2 5.5 5" />
        </>
      )
    case 'sport':
      return (
        <>
          <rect x="2" y="9" width="3" height="6" rx="1" />
          <rect x="19" y="9" width="3" height="6" rx="1" />
          <path d="M6 12h12" />
        </>
      )
    case 'meal':
      return (
        <>
          <path d="M7 3v7a2 2 0 002 2v9" />
          <path d="M7 3v5M9 3v5M5 3v5" />
          <path d="M17 3c-2 0-3 2-3 5s1 3 3 3v10" />
        </>
      )
    case 'sleep':
      return <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />
    case 'study':
      return (
        <>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5v13z" />
          <path d="M4 19.5V6.5" />
        </>
      )
    case 'money':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 012.5-1h0a2.5 2.5 0 010 5h0a2.5 2.5 0 010 5h0a2.5 2.5 0 01-2.5-1" />
          <path d="M12 6.5v11" />
        </>
      )
    case 'transport':
      return (
        <>
          <path d="M5 11l1.5-4.5h11L19 11" />
          <rect x="3" y="11" width="18" height="6" rx="2" />
          <circle cx="7.5" cy="19" r="1.5" />
          <circle cx="16.5" cy="19" r="1.5" />
        </>
      )
    case 'cleaning':
      return (
        <>
          <path d="M6 19l9-9" />
          <path d="M14 5l6 3-2 4-6-2z" />
        </>
      )
    case 'pet':
      return (
        <>
          <circle cx="12" cy="16" r="3.5" />
          <circle cx="7" cy="9" r="1.8" />
          <circle cx="12" cy="6.5" r="1.8" />
          <circle cx="17" cy="9" r="1.8" />
        </>
      )
    case 'hobby':
      return <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3-5.6-3.4-5.6 3.4 1.4-6.3-4.8-4.3 6.4-.6z" />
    default:
      return (
        <>
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </>
      )
  }
}

export function TaskIcon({ icon, size = 20 }: TaskIconProps) {
  if (!icon || !isValidTaskIcon(icon)) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <IconPaths icon={icon} />
    </svg>
  )
}
