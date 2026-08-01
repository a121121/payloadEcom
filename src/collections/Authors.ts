import {
    FixedToolbarFeature,
    HeadingFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Authors: CollectionConfig = {
    slug: 'authors',
    labels: {
        singular: 'Author',
        plural: 'Authors',
    },
    admin: {
        group: 'Blog',
        useAsTitle: 'name',
        defaultColumns: ['name', 'role', 'email'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            unique: true,
            index: true,
            hooks: {
                beforeValidate: [
                    ({ value, data }) => {
                        if (!value && data?.name) {
                            return data.name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '')
                        }
                        return value
                    },
                ],
            },
        },
        {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'role',
            type: 'text',
            label: 'Job Title / Role',
        },
        {
            name: 'email',
            type: 'email',
            label: 'Email (for Gravatar fallback)',
        },
        {
            name: 'bio',
            type: 'richText',
            editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                ],
            }),
        },
        {
            name: 'socialLinks',
            type: 'array',
            label: 'Social / Web Links',
            fields: [
                {
                    name: 'platform',
                    type: 'select',
                    options: [
                        { label: 'Twitter / X', value: 'twitter' },
                        { label: 'LinkedIn', value: 'linkedin' },
                        { label: 'GitHub', value: 'github' },
                        { label: 'Personal Website', value: 'website' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Bluesky', value: 'bluesky' },
                    ],
                },
                { name: 'url', type: 'text', required: true },
            ],
        },
        {
            name: 'sameAs',
            type: 'array',
            label: 'Schema.org sameAs URLs',
            admin: {
                description: 'Extra identity URLs for Schema.org Person entity (Wikipedia, Wikidata, etc).',
            },
            fields: [{ name: 'url', type: 'text' }],
        },
        // Link back to a User account (optional)
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            hasMany: false,
            admin: {
                description: 'Link to a Payload user account so the author can log in and see their posts.',
            },
        },
    ],
}