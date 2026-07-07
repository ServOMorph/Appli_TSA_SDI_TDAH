interface BatteryIconProps {
  size?: number
}

export function BatteryIcon({ size = 14 }: BatteryIconProps) {
  return (
    <svg
      width={size}
      height={size * (14 / 22)}
      viewBox="0 0 22 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="1" y="1" width="17" height="12" rx="2" />
      <line x1="20" y1="5" x2="20" y2="9" />
    </svg>
  )
}
