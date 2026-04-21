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
 * GridLayout
 * ─────────────────────────────────────────────
 * Uniform grid — all cards the same size.
 *
 * Appearance tweaks:
 *   - Columns        → change `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
 *   - Gap            → change `gap-6`
 */
export const GridLayout: React.FC<Props> = ({ testimonials, fallbackImages }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
            <TestimonialCard
                key={i}
                testimonial={t}
                avatarSrc={resolveAvatar(t, fallbackImages)}
            />
        ))}
    </div>
)