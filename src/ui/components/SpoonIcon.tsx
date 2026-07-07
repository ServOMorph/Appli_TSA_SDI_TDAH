interface SpoonIconProps {
  size?: number
}

export function SpoonIcon({ size = 14 }: SpoonIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="12" cy="6" rx="4" ry="5" />
      <line x1="12" y1="11" x2="12" y2="22" />
    </svg>
  )
}
