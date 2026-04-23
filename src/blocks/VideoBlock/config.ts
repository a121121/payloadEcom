import type { Block } from 'payload'

export const VideoBlock: Block = {
    slug: 'videoBlock',
    interfaceName: 'VideoBlock',
    fields: [
        {
            name: 'source',
            type: 'select',
            defaultValue: 'youtube',
            options: [
                { label: 'YouTube', value: 'youtube' },
                { label: 'Vimeo', value: 'vimeo' },
                { label: 'Self-hosted (Media Library)', value: 'local' },
            ],
        },
        {
            name: 'videoId',
            type: 'text',
            label: 'Video ID (YouTube / Vimeo)',
            admin: {
                condition: (_, siblingData) =>
                    siblingData?.source === 'youtube' || siblingData?.source === 'vimeo',
            },
        },
        {
            name: 'localVideo',
            type: 'upload',
            relationTo: 'media',
            label: 'Video File',
            admin: {
                condition: (_, siblingData) => siblingData?.source === 'local',
            },
        },
        {
            name: 'posterImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Poster / Thumbnail Image',
        },
        { name: 'caption', type: 'text', label: 'Caption (optional)' },
        { name: 'title', type: 'text', label: 'Video Title (for accessibility & SEO)' },
        {
            name: 'description',
            type: 'textarea',
            label: 'Video Description (for SEO)',
        },
        {
            name: 'uploadDate',
            type: 'date',
            label: 'Upload Date',
            admin: {
                description: 'Date the video was first published (required for Google rich results).',
            },
        },
        {
            name: 'autoplay',
            type: 'checkbox',
            defaultValue: false,
            label: 'Autoplay (muted)',
        },
        {
            name: 'startTime',
            type: 'number',
            label: 'Start Time (seconds)',
            admin: {
                description: 'Jump to this timestamp when video loads.',
                condition: (_, siblingData) =>
                    siblingData?.source === 'youtube' || siblingData?.source === 'vimeo',
            },
        },
    ],
    labels: { singular: 'Video Block', plural: 'Video Blocks' },
}