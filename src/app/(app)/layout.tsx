import type { ReactNode } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { FontProvider } from '@/components/FontProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getAllFontClasses } from '@/fonts/fonts'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const fontConfig = await getCachedGlobal('font-config', 0)()

  const bodyFont = fontConfig?.bodyFont ?? 'geist'
  const headingFont = fontConfig?.headingFont ?? 'geist'
  const fontScale = fontConfig?.fontScale ?? 'md'

  return (
    <html
      className={[GeistSans.variable, GeistMono.variable, getAllFontClasses()].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <FontProvider bodyFont={bodyFont} headingFont={headingFont} fontScale={fontScale} />
        <Providers>
          <AdminBar />
          <LivePreviewListener />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}