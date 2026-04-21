import React from 'react'

type Props = {
    rating: number
    size?: 'sm' | 'md'
}

/**
 * StarRating
 * ─────────────────────────────────────────────
 * Renders 1–5 filled/empty stars.
 *
 * Appearance tweaks:
 *   - Filled colour  → change `text-amber-400` on the filled branch
 *   - Empty colour   → change `text-muted-foreground/30` on the empty branch
 *   - Icon size      → adjust the `sz` values below (sm / md)
 *   - Gap between stars → change `gap-0.5` on the wrapper div
 */
export const StarRating: React.FC<Props> = ({ rating, size = 'md' }) => {
    const sz = size === 'sm' ? 14 : 18

    return (
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    width={sz}
                    height={sz}
                    viewBox="0 0 20 20"
                    fill={star <= rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={star <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    )
}