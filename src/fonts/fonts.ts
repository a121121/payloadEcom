/**
 * src/fonts/fonts.ts
 *
 * ALL fonts must be statically imported here at module load time.
 * Next.js font optimization does not support dynamic imports.
 *
 * To add a new font:
 *   1. Import it here from 'next/font/google'
 *   2. Add it to the FONTS map below
 *   3. Add the same value/label to FONT_OPTIONS in FontConfig.ts
 */

import {
    Bebas_Neue,
    Cormorant_Garamond,
    DM_Sans,
    Geist,
    Inter,
    Lato,
    Lora,
    Merriweather,
    Nunito,
    Open_Sans,
    Outfit,
    Playfair_Display,
    Poppins,
    Roboto,
    Space_Grotesk,
    Syne,
} from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const geist = Geist({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-loaded', display: 'swap' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-loaded', display: 'swap' })
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-loaded', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-loaded', display: 'swap' })
const lora = Lora({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const cormorantGaramond = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-loaded', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const syne = Syne({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-loaded', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-loaded', display: 'swap' })

/**
 * Map of Payload font value → { className, fontFamily }
 * className  — the Next.js font class (e.g. "__Inter_abc123") which makes
 *              the font available under --font-loaded CSS variable.
 * fontFamily — the actual CSS font-family string to inject as a CSS variable.
 */
export const FONTS: Record<string, { className: string; fontFamily: string }> = {
    'inter': { className: inter.className, fontFamily: 'Inter, sans-serif' },
    'geist': { className: geist.className, fontFamily: 'Geist, sans-serif' },
    'roboto': { className: roboto.className, fontFamily: 'Roboto, sans-serif' },
    'open-sans': { className: openSans.className, fontFamily: '"Open Sans", sans-serif' },
    'lato': { className: lato.className, fontFamily: 'Lato, sans-serif' },
    'poppins': { className: poppins.className, fontFamily: 'Poppins, sans-serif' },
    'nunito': { className: nunito.className, fontFamily: 'Nunito, sans-serif' },
    'dm-sans': { className: dmSans.className, fontFamily: '"DM Sans", sans-serif' },
    'playfair-display': { className: playfairDisplay.className, fontFamily: '"Playfair Display", serif' },
    'merriweather': { className: merriweather.className, fontFamily: 'Merriweather, serif' },
    'lora': { className: lora.className, fontFamily: 'Lora, serif' },
    'cormorant-garamond': { className: cormorantGaramond.className, fontFamily: '"Cormorant Garamond", serif' },
    'space-grotesk': { className: spaceGrotesk.className, fontFamily: '"Space Grotesk", sans-serif' },
    'syne': { className: syne.className, fontFamily: 'Syne, sans-serif' },
    'bebas-neue': { className: bebasNeue.className, fontFamily: '"Bebas Neue", sans-serif' },
    'outfit': { className: outfit.className, fontFamily: 'Outfit, sans-serif' },
}

/**
 * Returns every font's className joined — add to <body> so all fonts
 * are loaded by Next.js and available in the browser.
 */
export function getAllFontClasses(): string {
    return Object.values(FONTS)
        .map((f) => f.className)
        .join(' ')
}