'use client'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'
import React, { useEffect, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { ReviewerMeta } from '../components/ReviewerMeta'
import { StarRating } from '../components/StarRating'
import { formatDate, resolveAvatar } from '../helpers'
import type { Testimonial } from '../types'

type Props = {
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}

/**
 * CarouselLayout
 * ─────────────────────────────────────────────
 * Single-card carousel with prev/next buttons and dot indicators.
 *
 * Appearance tweaks:
 *   - Card max width         → change `max-w-3xl`
 *   - Card padding           → change `p-8 md:p-10`
 *   - Card rounding          → change `rounded-2xl`
 *   - Auto-advance interval  → change `6000` (ms) in setInterval
 *   - Transition speed       → change `duration-300` on the opacity wrapper
 *   - Active dot size/colour → change `w-6 h-2 bg-primary` on the active branch
 *   - Inactive dot colour    → change `bg-border hover:bg-muted-foreground`
 *   - Nav button size/shape  → change `w-9 h-9 rounded-full` on the button elements
 */
export const CarouselLayout: React.FC<Props> = ({ testimonials, fallbackImages }) => {
    const [active, setActive] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const total = testimonials.length

    const go = (next: number) => {
        if (isAnimating) return
        setIsAnimating(true)
        setActive((next + total) % total)
        setTimeout(() => setIsAnimating(false), 350)
    }

    useEffect(() => {
        const timer = setInterval(() => go(active + 1), 6000)
        return () => clearInterval(timer)
    }, [active])

    const t = testimonials[active]!

    return (
        <div className="relative max-w-3xl mx-auto">
            {/* Main card */}
            <div
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                <article className="bg-card border border-border rounded-2xl p-8 md:p-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <StarRating rating={t.rating} />
                        {t.reviewDate && (
                            <time dateTime={t.reviewDate} className="text-xs text-muted-foreground">
                                {formatDate(t.reviewDate)}
                            </time>
                        )}
                    </div>

                    {t.title && (
                        <h3 className="text-xl font-semibold text-foreground">{t.title}</h3>
                    )}

                    <blockquote className="text-muted-foreground text-base leading-relaxed">
                        &ldquo;{t.description}&rdquo;
                    </blockquote>

                    <footer className="flex items-center gap-4 pt-4 border-t border-border">
                        <Avatar
                            src={resolveAvatar(t, fallbackImages)}
                            name={t.reviewer?.name ?? '?'}
                            size="lg"
                        />
                        <ReviewerMeta testimonial={t} />
                    </footer>
                </article>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    onClick={() => go(active - 1)}
                    aria-label="Previous testimonial"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex gap-1.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            aria-label={`Go to testimonial ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${i === active
                                    ? 'w-6 h-2 bg-primary'
                                    : 'w-2 h-2 bg-border hover:bg-muted-foreground'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => go(active + 1)}
                    aria-label="Next testimonial"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}