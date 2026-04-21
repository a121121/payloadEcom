import React from 'react'
import type { Testimonial } from '../types'

type Props = {
    testimonial: Testimonial
}

/**
 * ReviewerMeta
 * ─────────────────────────────────────────────
 * Displays the reviewer's name and optional subtitle (job title · location).
 *
 * Appearance tweaks:
 *   - Name size/weight   → change `font-semibold text-sm` on the name span
 *   - Subtitle style     → change `text-muted-foreground text-xs` on the subtitle span
 *   - Separator          → change the `·` in `join(' · ')`
 *   - Layout             → change `flex-col` to `flex-row gap-2` for inline layout
 */
export const ReviewerMeta: React.FC<Props> = ({ testimonial }) => {
    const { reviewer } = testimonial
    const locationStr = [reviewer?.location?.city, reviewer?.location?.country]
        .filter(Boolean)
        .join(', ')
    const subtitle = [reviewer?.jobTitle, locationStr].filter(Boolean).join(' · ')

    return (
        <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm leading-tight">
                {reviewer?.name}
            </span>
            {subtitle && (
                <span className="text-muted-foreground text-xs mt-0.5 leading-snug">
                    {subtitle}
                </span>
            )}
        </div>
    )
}