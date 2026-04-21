import React from 'react'

type Props = {
    heading?: string | null
    subheading?: string | null
}

/**
 * SectionHeader
 * ─────────────────────────────────────────────
 * Centred heading + subheading above the testimonials grid.
 *
 * Appearance tweaks:
 *   - Heading size       → change `text-3xl md:text-4xl`
 *   - Heading weight     → change `font-bold`
 *   - Subheading size    → change `text-lg`
 *   - Bottom margin      → change `mb-12`
 *   - Max width          → change `max-w-2xl`
 *   - Alignment          → remove `text-center` for left-aligned
 */
export const SectionHeader: React.FC<Props> = ({ heading, subheading }) => {
    if (!heading && !subheading) return null

    return (
        <div className="text-center max-w-2xl mx-auto mb-12">
            {heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                    {heading}
                </h2>
            )}
            {subheading && (
                <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>
            )}
        </div>
    )
}