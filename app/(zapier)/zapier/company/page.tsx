import type { Metadata } from 'next'
import CompanyPage from '@/components/pages/CompanyPage'

export const metadata: Metadata = {
  title: '会社情報 | AIビジネスメディア',
  description: 'AIビジネスメディアの運営会社・株式会社ZIRAKUの会社情報',
}

export default function ZapierCompanyPage() {
  return <CompanyPage theme="zapier" />
}
