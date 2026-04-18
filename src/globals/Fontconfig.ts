import { adminOnly } from '@/access/adminOnly'
import { revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

const revalidateFonts: GlobalAfterChangeHook = ({ doc, req: { payload } }) => {
    payload.logger.info('Revalidating font config cache...')
    revalidateTag('global_font-config', 'default')
    return doc
}

// This list must stay in sync with src/fonts/fonts.ts
// Only fonts pre-imported there can be used at runtime.
const FONT_OPTIONS = [
    { label: 'Inter', value: 'inter' },
    { label: 'Geist', value: 'geist' },
    { label: 'Roboto', value: 'roboto' },
    { label: 'Open Sans', value: 'open-sans' },
    { label: 'Lato', value: 'lato' },
    { label: 'Poppins', value: 'poppins' },
    { label: 'Nunito', value: 'nunito' },
    { label: 'DM Sans', value: 'dm-sans' },
    { label: 'Playfair Display', value: 'playfair-display' },
    { label: 'Merriweather', value: 'merriweather' },
    { label: 'Lora', value: 'lora' },
    { label: 'Cormorant Garamond', value: 'cormorant-garamond' },
    { label: 'Space Grotesk', value: 'space-grotesk' },
    { label: 'Syne', value: 'syne' },
    { label: 'Bebas Neue', value: 'bebas-neue' },
    { label: 'Outfit', value: 'outfit' },
]

export const FontConfig: GlobalConfig = {
    slug: 'font-config',
    label: 'Fonts',
    access: {
        read: () => true,
        update: adminOnly,
    },
    hooks: {
        afterChange: [revalidateFonts],
    },
    fields: [
        {
            type: 'row',
            fields: [
                {
                    name: 'bodyFont',
                    type: 'select',
                    label: 'Body Font',
                    defaultValue: 'inter',
                    required: true,
                    admin: {
                        width: '50%',
                        description: 'Applied to all body text, paragraphs, labels, and UI elements.',
                    },
                    options: FONT_OPTIONS,
                },
                {
                    name: 'headingFont',
                    type: 'select',
                    label: 'Heading Font',
                    defaultValue: 'inter',
                    required: true,
                    admin: {
                        width: '50%',
                        description: 'Applied to all h1–h6 headings.',
                    },
                    options: FONT_OPTIONS,
                },
            ],
        },
        {
            name: 'fontScale',
            type: 'select',
            label: 'Base Font Size',
            defaultValue: 'md',
            admin: {
                description: 'Scales all text up or down relative to the default 16px base.',
                position: 'sidebar',
            },
            options: [
                { label: 'Small (14px)', value: 'sm' },
                { label: 'Default (16px)', value: 'md' },
                { label: 'Large (18px)', value: 'lg' },
            ],
        },
    ],
}