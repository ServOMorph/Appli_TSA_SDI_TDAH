interface RoutineIconProps {
  size?: number
}

export function RoutineIcon({ size = 18 }: RoutineIconProps) {
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
      <path d="M4 4v5h5" />
      <path d="M20 20v-5h-5" />
      <path d="M4.5 15a8 8 0 0014.5 3.5" />
      <path d="M19.5 9A8 8 0 005 5.5" />
    </svg>
  )
}
