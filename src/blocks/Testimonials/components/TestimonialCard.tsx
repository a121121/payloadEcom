import React from 'react'
import { formatDate } from '../helpers'
import type { Testimonial } from '../types'
import { Avatar } from './Avatar'
import { ReviewerMeta } from './ReviewerMeta'
import { StarRating } from './StarRating'

type Props = {
    testimonial: Testimonial
    avatarSrc: string | null
    variant?: 'default' | 'featured' | 'compact'
}

/**
 * TestimonialCard
 * ─────────────────────────────────────────────
 * The core card rendered in all layout variants.
 *
 * Appearance tweaks:
 *   - Card shape / rounding   → change `rounded-xl`
 *   - Card padding            → change `p-6`
 *   - Hover lift              → change `hover:-translate-y-0.5` or remove it
 *   - Hover shadow            → change `hover:shadow-lg`
 *   - Featured bg             → change `bg-primary` on the isFeatured branch
 *   - Default bg              → change `bg-card`
 *   - Border on hover         → change `hover:border-primary/30`
 *   - Quote mark opacity      → change `opacity-10` on the SVG
 *   - Quote mark size         → change `width="48" height="36"` on the SVG
 *   - Body text               → change `text-sm leading-relaxed` on the <p>
 *   - Footer divider          → change or remove `border-t border-border/30`
 */
export const TestimonialCard: React.FC<Props> = ({
    testimonial,
    avatarSrc,
    variant = 'default',
}) => {
    const isFeatured = variant === 'featured'

    return (
        <article
            className={`
                group relative flex flex-col gap-4 rounded-xl border p-6
                transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                ${isFeatured
                    ? 'bg-primary text-primary-foreground border-primary col-span-2 md:col-span-1'
                    : 'bg-card text-card-foreground border-border hover:border-primary/30'
                }
            `}
        >
            {/* Decorative quote mark */}
            <svg
                aria-hidden="true"
                className={`absolute top-4 right-5 opacity-10 ${isFeatured ? 'text-primary-foreground' : 'text-primary'
                    }`}
                width="48"
                height="36"
                viewBox="0 0 48 36"
                fill="currentColor"
            >
                <path d="M0 36V22.5C0 16.5 1.5 11.5 4.5 7.5S12 1.5 18 0l2.25 3C16.5 4 13.5 6 11.25 9S8.25 15 8.25 18H15V36H0zm27 0V22.5c0-6 1.5-11 4.5-15S39 1.5 45 0l2.25 3C43.5 4 40.5 6 38.25 9S35.25 15 35.25 18H42V36H27z" />
            </svg>

            <StarRating rating={testimonial.rating} size={isFeatured ? 'md' : 'sm'} />

            {testimonial.title && (
                <h3
                    className={`font-semibold text-base leading-snug ${isFeatured ? '' : 'text-foreground'
                        }`}
                >
                    {testimonial.title}
                </h3>
            )}

            <p
                className={`text-sm leading-relaxed flex-1 ${isFeatured ? 'text-primary-foreground/90' : 'text-muted-foreground'
                    }`}
            >
                {testimonial.description}
            </p>

            <footer className="flex items-center gap-3 pt-2 border-t border-border/30">
                <Avatar
                    src={avatarSrc}
                    name={testimonial.reviewer?.name ?? '?'}
                    size={isFeatured ? 'lg' : 'md'}
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <ReviewerMeta testimonial={testimonial} />
                    {testimonial.reviewDate && (
                        <time
                            dateTime={testimonial.reviewDate}
                            className={`text-xs ${isFeatured
                                    ? 'text-primary-foreground/60'
                                    : 'text-muted-foreground/60'
                                }`}
                        >
                            {formatDate(testimonial.reviewDate)}
                        </time>
                    )}
                </div>
            </footer>
        </article>
    )
}