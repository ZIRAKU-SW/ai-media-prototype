/** ziraku テーマ共通のラインアイコン（絵文字の代替・stroke: currentColor） */

type P = { size?: number; className?: string }

function base(size: number) {
  return {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const,
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
}

export const IconClipboard = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="5" y="4" width="14" height="17" rx="2.5" />
    <path d="M9 4.5V3.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 3.5v1" />
    <path d="M8.5 10.5l2.2 2.2 4.6-4.6M8.5 16.5h7" />
  </svg>
)

export const IconDocument = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 2.8h8l4 4V21.2H6z" />
    <path d="M14 2.8v4h4M9 12h6M9 15.5h6M9 8.5h2" />
  </svg>
)

export const IconLock = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
  </svg>
)

export const IconCalendar = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 9.5h17M8 2.8v4M16 2.8v4M8 13.5h3M13 17h3" />
  </svg>
)

export const IconBuilding = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 21V5.5L12 3v18M12 8l8 2.5V21M4 21h16" />
    <path d="M7 8.5h2M7 12h2M7 15.5h2M15 13h2M15 16.5h2" />
  </svg>
)

export const IconCode = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />
  </svg>
)

export const IconChip = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M10 2.8v3M14 2.8v3M10 18.2v3M14 18.2v3M2.8 10h3M2.8 14h3M18.2 10h3M18.2 14h3" />
  </svg>
)

export const IconSearchDoc = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="7.5" />
    <path d="M21 21l-4.5-4.5M8 11h6M11 8v6" />
  </svg>
)

export const IconLayers = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5" />
  </svg>
)

export const IconChat = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5.5h16v11H9l-5 4v-15z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </svg>
)

export const IconRocket = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 17c-1.5-.8-3.5-3-3.5-6C8.5 6.5 10.5 3.5 12 2.5c1.5 1 3.5 4 3.5 8.5 0 3-2 5.2-3.5 6z" />
    <circle cx="12" cy="9" r="1.6" />
    <path d="M8.5 13.5L5.5 16l3-.3M15.5 13.5l3 2.5-3-.3M12 17v4" />
  </svg>
)

export const IconUser = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c.8-4 4-6 7.5-6s6.7 2 7.5 6" />
  </svg>
)

export const IconSettings = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" />
  </svg>
)

export const IconCheck = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12.5l5 5L19.5 7" />
  </svg>
)

export const IconArrowRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </svg>
)
