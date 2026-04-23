import type { Block } from 'payload'

export const ImageBlock: Block = {
    slug: 'imageBlock',
    interfaceName: 'ImageBlock',
    fields: [
        {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
        },
        { name: 'caption', type: 'text', label: 'Caption (optional)' },
        { name: 'altOverride', type: 'text', label: 'Alt Text Override (optional)' },
        {
            name: 'size',
            type: 'select',
            defaultValue: 'inline',
            options: [
                { label: 'Inline (default content width)', value: 'inline' },
                { label: 'Wide (breakout)', value: 'wide' },
                { label: 'Full Bleed', value: 'full' },
            ],
        },
        {
            name: 'link',
            type: 'text',
            label: 'Link URL (optional)',
            admin: {
                description: 'If set, the image will be wrapped in an anchor tag.',
            },
        },
        {
            name: 'priority',
            type: 'checkbox',
            defaultValue: false,
            label: 'Priority load (above-the-fold hero images)',
            admin: {
                description: 'Sets Next.js Image priority={true} — use only for images visible on page load.',
            },
            required: true
        },
    ],
    labels: { singular: 'Image Block', plural: 'Image Blocks' },
}