'use client'

/**
 * src/components/FontProvider/index.tsx
 *
 * Reads the font selections passed from the server (layout.tsx)
 * and injects them as CSS variables on <html> so they apply globally.
 *
 * --font-body    → used by body text, paragraphs, UI elements
 * --font-heading → used by h1–h6
 */

import { FONTS } from '@/fonts/fonts'
import { useEffect } from 'react'

interface Props {
    bodyFont: string
    headingFont: string
    fontScale: string
}

const SCALE_MAP: Record<string, string> = {
    sm: '14px',
    md: '16px',
    lg: '18px',
}

export function FontProvider({ bodyFont, headingFont, fontScale }: Props) {
    useEffect(() => {
        const root = document.documentElement

        const body = FONTS[bodyFont] ?? FONTS['inter']
        const heading = FONTS[headingFont] ?? FONTS['inter']
        const scale = SCALE_MAP[fontScale] ?? '16px'

        root.style.setProperty('--font-body', body.fontFamily)
        root.style.setProperty('--font-heading', heading.fontFamily)
        root.style.setProperty('--font-size-base', scale)
    }, [bodyFont, headingFont, fontScale])

    // This component renders nothing — it's side-effect only
    return null
}