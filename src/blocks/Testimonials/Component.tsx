'use client'

import React from 'react'
import { SectionHeader } from './components/SectionHeader'
import { generateTestimonialsJsonLd } from './generateTestimonialsJsonLd'
import { CarouselLayout } from './layouts/CarouselLayout'
import { FeaturedLayout } from './layouts/FeaturedLayout'
import { GridLayout } from './layouts/GridLayout'
import { MasonryLayout } from './layouts/MasonryLayout'
import type { Props } from './types'

export const TestimonialsBlock: React.FC<Props> = ({
    id,
    className,
    blockHeading,
    blockSubheading,
    displayStyle = 'grid',
    fallbackImages,
    testimonials,
}) => {
    const items = testimonials ?? []
    if (items.length === 0) return null

    const jsonLd = generateTestimonialsJsonLd({
        testimonials,
        fallbackImages,
        blockHeading,
        blockSubheading,
        displayStyle,
        blockType: 'testimonials',
        id: id ? String(id) : undefined,
    })

    return (
        <section id={id ? String(id) : undefined} className={`container ${className ?? ''}`}>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd }}
                />
            )}

            <SectionHeader heading={blockHeading} subheading={blockSubheading} />

            {displayStyle === 'grid' && (
                <GridLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'masonry' && (
                <MasonryLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'carousel' && (
                <CarouselLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'featured' && (
                <FeaturedLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
        </section>
    )
}