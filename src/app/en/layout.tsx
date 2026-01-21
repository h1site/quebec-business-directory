import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Quebec Business Registry - Directory of 46,000+ Businesses',
    template: '%s | Quebec Business Registry',
  },
  description:
    'Find over 46,000 Quebec businesses. Complete directory with contact info, Google reviews, and detailed information for Montreal, Quebec City, Laval, and all regions of Quebec.',
  keywords: [
    'quebec businesses',
    'quebec business directory',
    'quebec business registry',
    'find business quebec',
    'montreal businesses',
    'quebec city businesses',
    'laval businesses',
    'quebec companies',
    'quebec professional services',
    'quebec stores',
  ],
  alternates: {
    canonical: 'https://registreduquebec.com/en',
    languages: {
      'en-CA': 'https://registreduquebec.com/en',
      'fr-CA': 'https://registreduquebec.com',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    alternateLocale: 'fr_CA',
    siteName: 'Quebec Business Registry',
    title: 'Quebec Business Registry - 46,000+ Businesses',
    description: 'The most comprehensive directory of Quebec businesses. Find contact info, reviews, and detailed information for all regions.',
    images: [
      {
        url: '/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'Quebec Business Registry - Complete Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quebec Business Registry',
    description: 'Over 46,000 Quebec businesses to discover',
  },
}

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div lang="en">
      {children}
    </div>
  )
}
