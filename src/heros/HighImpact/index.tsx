'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return (
    <section
      className="relative -mt-[10.4rem] min-h-[80vh] flex items-center justify-center overflow-hidden text-white"
      data-theme="dark"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <Media
          fill
          priority
          resource={media}
          imgClassName="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}

      {/* Optional dark overlay */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Content */}
      <div className="container relative z-10 flex justify-center px-4">
        <div className="w-full max-w-4xl text-center">
          {richText && (
            <RichText
              className="mb-6"
              data={richText}
              enableGutter={false}
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}