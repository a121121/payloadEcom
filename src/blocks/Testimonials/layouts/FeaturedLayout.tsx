import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'
import React from 'react'
import { TestimonialCard } from '../components/TestimonialCard'
import { resolveAvatar } from '../helpers'
import type { Testimonial } from '../types'

type Props = {
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}

/**
 * FeaturedLayout
 * ─────────────────────────────────────────────
 * One large featured card (3 cols) + a side stack of up to 4 cards (2 cols).
 *
 * Appearance tweaks:
 *   - Overall column split   → change `lg:col-span-3` / `lg:col-span-2`
 *   - Side stack columns     → change `sm:grid-cols-2 lg:grid-cols-1` on the side div
 *   - Gap                    → change `gap-6`
 *   - Max side cards         → change `.slice(0, 4)`
 */
export const FeaturedLayout: React.FC<Props> = ({ testimonials, fallbackImages }) => {
    const featured = testimonials.find((t) => t.isFeatured) ?? testimonials[0]!
    const rest = testimonials.filter((t) => t !== featured).slice(0, 4)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Featured — takes 3 columns */}
            <div className="lg:col-span-3">
                <TestimonialCard
                    testimonial={featured}
                    avatarSrc={resolveAvatar(featured, fallbackImages)}
                    variant="featured"
                />
            </div>

            {/* Side stack — 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {rest.map((t, i) => (
                    <TestimonialCard
                        key={i}
                        testimonial={t}
                        avatarSrc={resolveAvatar(t, fallbackImages)}
                        variant="compact"
                    />
                ))}
            </div>
        </div>
    )
}