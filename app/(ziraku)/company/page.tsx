import type { Metadata } from 'next'
import ZirakuCompanyContent from '@/components/ziraku/ZirakuCompanyContent'

export const metadata: Metadata = {
  title: '会社情報｜AIビジネスメディア（運営: 株式会社ZIRAKU）',
  description: '株式会社ZIRAKUはシステム開発・AIプロダクト開発・DX支援を行う会社です。AIビジネスメディアの運営会社情報。',
}

export default function ZirakuCompanyPage() {
  return <ZirakuCompanyContent />
}
