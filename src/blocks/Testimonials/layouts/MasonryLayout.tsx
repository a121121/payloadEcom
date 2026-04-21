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
 * MasonryLayout
 * ─────────────────────────────────────────────
 * Cards distributed across 3 columns (by index) so heights vary naturally.
 *
 * Appearance tweaks:
 *   - Number of columns  → change the `% 3` modulo AND the `grid-cols-*` class
 *   - Column gap         → change `gap-6` on both divs
 */
export const MasonryLayout: React.FC<Props> = ({ testimonials, fallbackImages }) => {
    const cols = [
        testimonials.filter((_, i) => i % 3 === 0),
        testimonials.filter((_, i) => i % 3 === 1),
        testimonials.filter((_, i) => i % 3 === 2),
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {cols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-6">
                    {col.map((t, i) => (
                        <TestimonialCard
                            key={i}
                            testimonial={t}
                            avatarSrc={resolveAvatar(t, fallbackImages)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}