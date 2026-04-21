import React from 'react'

type Props = {
    src: string | null
    name: string
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Avatar
 * ─────────────────────────────────────────────
 * Circular avatar — shows an image or falls back to initials.
 *
 * Appearance tweaks:
 *   - Sizes          → edit `sizeMap` (Tailwind w/h + text size)
 *   - Shape          → change `rounded-full` to e.g. `rounded-xl`
 *   - Fallback bg    → change `bg-primary/10`
 *   - Fallback text  → change `text-primary`
 *   - Border         → change or remove `border border-border`
 */
export const Avatar: React.FC<Props> = ({ src, name, size = 'md' }) => {
    const sizeMap = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
    }

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <div
            className={`
                ${sizeMap[size]}
                rounded-full overflow-hidden shrink-0
                bg-primary/10 flex items-center justify-center
                font-semibold text-primary border border-border
            `}
        >
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    )
}