type Props = {
  size?: number
  /** 暗背景用に白単色で描画 */
  mono?: boolean
}

/** ZIRAKU AIビジネスメディアのロゴマーク（分子ネットワーク） */
export default function ZirakuLogoMark({ size = 34, mono = false }: Props) {
  const dark = mono ? '#ffffff' : '#1d4ed8'
  const light = mono ? '#ffffff' : '#2563eb'
  const hubFill = mono ? 'transparent' : '#ffffff'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g stroke={dark} strokeWidth="3.2">
        <line x1="17.5" y1="20.5" x2="11" y2="14.5" />
        <line x1="25.5" y1="19.5" x2="31" y2="11" />
        <line x1="28.5" y1="26.5" x2="38" y2="25" />
        <line x1="26" y1="31.5" x2="33" y2="39" />
        <line x1="18.5" y1="31.5" x2="12.5" y2="38.5" />
      </g>
      <circle cx="22" cy="26" r="6.2" fill={hubFill} stroke={dark} strokeWidth="3.6" />
      <circle cx="9.5" cy="13" r="4.4" fill={dark} />
      <circle cx="33.5" cy="8.5" r="5.2" fill={light} />
      <circle cx="41" cy="24.5" r="4.2" fill={light} />
      <circle cx="35" cy="41" r="5" fill={dark} />
      <circle cx="11" cy="41" r="4.4" fill={light} />
    </svg>
  )
}
