import type { CollectionConfig } from 'payload'

import {
    AlignFeature,
    BlockquoteFeature,
    BlocksFeature,
    BoldFeature,
    ChecklistFeature,
    FixedToolbarFeature,
    HeadingFeature,
    HorizontalRuleFeature,
    IndentFeature,
    InlineCodeFeature,
    InlineToolbarFeature,
    ItalicFeature,
    lexicalEditor,
    LinkFeature,
    OrderedListFeature,
    ParagraphFeature,
    StrikethroughFeature,
    SubscriptFeature,
    SuperscriptFeature,
    UnderlineFeature,
    UnorderedListFeature,
    UploadFeature,
} from '@payloadcms/richtext-lexical'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { FAQBlock } from '@/blocks/FAQ/config'
import { FormBlock } from '@/blocks/Form/config'
import { ImageBlock } from '@/blocks/ImageBlock/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { TableBlock } from '@/blocks/Table/config'
import { Testimonials } from '@/blocks/Testimonials/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { VideoBlock } from '@/blocks/VideoBlock/config'
import { revalidatePost } from '@/hooks/revalidatePost'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

// ─── Shared SEO fields ────────────────────────────────────────────────────────
const seoFields = [
    {
        name: 'title',
        type: 'text' as const,
        label: 'SEO Title',
        admin: {
            description: 'Overrides the post title in search results. Keep under 60 chars.',
        },
    },
    {
        name: 'description',
        type: 'textarea' as const,
        label: 'Meta Description',
        admin: {
            description: 'Shown in search results. Keep under 160 chars.',
        },
    },
    {
        name: 'image',
        type: 'upload' as const,
        relationTo: 'media' as const,
        label: 'OG / Social Image',
        admin: {
            description: 'Used for Open Graph and Twitter card previews. Recommended: 1200×630px.',
        },
    },
    {
        name: 'noIndex',
        type: 'checkbox' as const,
        label: 'No Index',
        defaultValue: false,
        admin: {
            description: 'Prevent this post from appearing in search engines.',
        },
    },
    {
        name: 'canonicalUrl',
        type: 'text' as const,
        label: 'Canonical URL',
        admin: {
            description:
                'Leave blank to use the default URL. Set only if this content was originally published elsewhere.',
        },
    },
]

// ─── Shared structured data fields ───────────────────────────────────────────
const schemaFields = [
    {
        name: 'faqItems',
        type: 'array' as const,
        label: 'FAQ Items (for FAQ Schema)',
        admin: {
            description: 'Add Q&A pairs here to automatically generate FAQPage schema.',
            condition: (_: any, siblingData: any) =>
                siblingData?.postType === 'guide' || siblingData?.postType === 'faq',
        },
        fields: [
            { name: 'question', type: 'text' as const, required: true },
            { name: 'answer', type: 'textarea' as const, required: true },
        ],
    },
    {
        name: 'howToSteps',
        type: 'array' as const,
        label: 'HowTo Steps (for HowTo Schema)',
        admin: {
            description: 'Populate these for step-by-step guides to get HowTo rich results.',
            condition: (_: any, siblingData: any) => siblingData?.postType === 'guide',
        },
        fields: [
            { name: 'name', type: 'text' as const, required: true, label: 'Step Name' },
            { name: 'text', type: 'textarea' as const, required: true, label: 'Step Description' },
            {
                name: 'image',
                type: 'upload' as const,
                relationTo: 'media' as const,
                label: 'Step Image (optional)',
            },
        ],
    },
]

// ─── The Posts Collection ─────────────────────────────────────────────────────
export const Posts: CollectionConfig = {
    slug: 'posts',
    labels: {
        singular: 'Post',
        plural: 'Posts',
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'postType', 'status', 'publishedAt', 'authors'],
        // NOTE: 'posts' will be a valid CollectionSlug once you run `pnpm generate:types`.
        // The `as any` casts below are temporary until then.
        preview: (doc, { req }) =>
            generatePreviewPath({
                slug: typeof doc?.slug === 'string' ? doc.slug : '',
                collection: 'posts' as any,
                req,
            }),
        livePreview: {
            url: ({ data, req }) =>
                generatePreviewPath({
                    slug: typeof data?.slug === 'string' ? data.slug : '',
                    collection: 'posts' as any,
                    req,
                }),
        },
        group: 'Blog',
    },
    hooks: {
        afterChange: [revalidatePost],
    },
    versions: {
        drafts: {
            autosave: {
                interval: 375,
            },
        },
        maxPerDoc: 50,
    },
    access: {
        read: ({ req }) => {
            if (req.user) return true
            return {
                or: [{ status: { equals: 'published' } }],
            }
        },
    },
    fields: [
        // ── Sidebar: slug (needs to live outside tabs to appear in sidebar) ───────
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
            index: true,
            admin: {
                position: 'sidebar',
                description: 'URL-friendly identifier. Auto-generated from title.',
            },
            hooks: {
                beforeValidate: [
                    ({ value, data }) => {
                        if (!value && data?.title) {
                            return data.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '')
                        }
                        return value
                    },
                ],
            },
        },

        // ── Sidebar: post type ───────────────────────────────────────────────────
        {
            name: 'postType',
            type: 'select',
            required: true,
            defaultValue: 'article',
            admin: {
                position: 'sidebar',
                description: 'Determines Schema.org @type and available structured-data fields.',
            },
            options: [
                { label: '📝 Article / Blog Post', value: 'article' },
                { label: '📖 Guide / Tutorial', value: 'guide' },
                { label: '📋 Case Study', value: 'caseStudy' },
                { label: '📣 Changelog / Release Note', value: 'changelog' },
                { label: '❓ FAQ Page', value: 'faq' },
                { label: '📰 News', value: 'news' },
                { label: '🔬 Technical Deep-Dive', value: 'techDeepDive' },
            ],
        },

        // ── Sidebar: status ──────────────────────────────────────────────────────
        {
            name: 'status',
            type: 'select',
            required: true,
            defaultValue: 'draft',
            admin: {
                position: 'sidebar',
            },
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
            ],
        },

        // ── Sidebar: dates ───────────────────────────────────────────────────────
        {
            name: 'publishedAt',
            type: 'date',
            admin: {
                position: 'sidebar',
                date: { pickerAppearance: 'dayAndTime' },
                description:
                    'Leave blank to publish immediately when status is set to Published.',
            },
        },
        {
            name: 'updatedAtOverride',
            type: 'date',
            label: 'Last Significantly Updated',
            admin: {
                position: 'sidebar',
                date: { pickerAppearance: 'dayAndTime' },
                description:
                    'Override the auto-managed "updated" date for Schema.org dateModified.',
            },
        },

        // ── Sidebar: taxonomy ────────────────────────────────────────────────────
        {
            name: 'categories',
            type: 'relationship',
            relationTo: 'categories',
            hasMany: true,
            admin: { position: 'sidebar' },
        },
        {
            name: 'tags',
            type: 'relationship',
            // NOTE: 'tags' will resolve correctly after `pnpm generate:types`
            relationTo: 'tags' as any,
            hasMany: true,
            admin: { position: 'sidebar' },
        },

        // ── Sidebar: authors ─────────────────────────────────────────────────────
        {
            name: 'authors',
            type: 'relationship',
            // NOTE: 'authors' will resolve correctly after `pnpm generate:types`
            relationTo: 'authors' as any,
            hasMany: true,
            admin: { position: 'sidebar' },
        },

        // ── Sidebar: reading meta ────────────────────────────────────────────────
        {
            name: 'readingTime',
            type: 'number',
            label: 'Reading Time (minutes)',
            admin: {
                position: 'sidebar',
                description: 'Auto-calculated on save, or override manually.',
            },
        },
        {
            name: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            admin: {
                position: 'sidebar',
                condition: (_, siblingData) =>
                    ['guide', 'techDeepDive'].includes(siblingData?.postType),
            },
            options: [
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
            ],
        },

        // ════════════════════════════════════════════════════════════════════════
        // TABS
        // ════════════════════════════════════════════════════════════════════════
        {
            type: 'tabs',
            tabs: [
                // ── Tab 1: Content ───────────────────────────────────────────────
                {
                    label: '✍️ Content',
                    description: 'Core post content — title, hero, excerpt, and rich-text body.',
                    fields: [
                        {
                            name: 'title',
                            type: 'text',
                            required: true,
                            admin: {
                                description:
                                    'The primary headline. Used in breadcrumbs, OG tags, and Schema.org headline.',
                            },
                        },
                        {
                            name: 'heroImage',
                            type: 'upload',
                            relationTo: 'media' as const,
                            admin: {
                                description:
                                    'Hero image shown at the top of the post. Also used as OG image if no SEO image is set.',
                            },
                        },
                        {
                            name: 'excerpt',
                            type: 'textarea',
                            admin: {
                                description:
                                    'Short summary shown in post cards and as fallback meta description.',
                            },
                        },
                        {
                            name: 'content',
                            type: 'richText',
                            label: 'Content',
                            editor: lexicalEditor({
                                features: [
                                    ParagraphFeature(),
                                    BoldFeature(),
                                    ItalicFeature(),
                                    UnderlineFeature(),
                                    StrikethroughFeature(),
                                    SubscriptFeature(),
                                    SuperscriptFeature(),
                                    InlineCodeFeature(),
                                    BlockquoteFeature(),
                                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5'] }),
                                    OrderedListFeature(),
                                    UnorderedListFeature(),
                                    ChecklistFeature(),
                                    IndentFeature(),
                                    AlignFeature(),
                                    HorizontalRuleFeature(),
                                    LinkFeature({
                                        enabledCollections: ['posts', 'pages'] as any,
                                        fields: ({ defaultFields }) => [...defaultFields],
                                    }),
                                    UploadFeature({
                                        collections: {
                                            media: {
                                                fields: [
                                                    {
                                                        name: 'caption',
                                                        type: 'richText',
                                                        editor: lexicalEditor(),
                                                    },
                                                    {
                                                        name: 'alignment',
                                                        type: 'select',
                                                        options: [
                                                            { label: 'Left', value: 'left' },
                                                            { label: 'Center', value: 'center' },
                                                            { label: 'Right', value: 'right' },
                                                            { label: 'Full Width', value: 'full' },
                                                        ],
                                                        defaultValue: 'full',
                                                    },
                                                ],
                                            },
                                        },
                                    }),
                                    BlocksFeature({
                                        blocks: [
                                            CallToAction,
                                            Content,
                                            MediaBlock,
                                            Archive,
                                            Carousel,
                                            ThreeItemGrid,
                                            Banner,
                                            FormBlock,
                                            Testimonials,
                                            FAQBlock,
                                            TableBlock,
                                            ImageBlock,
                                            VideoBlock,
                                        ],
                                    }),
                                    FixedToolbarFeature(),
                                    InlineToolbarFeature(),
                                ],
                            }),
                        },
                    ],
                },

                // ── Tab 2: Relations ─────────────────────────────────────────────
                {
                    label: '🔗 Relations',
                    description: 'Related posts for internal linking.',
                    fields: [
                        {
                            name: 'relatedPosts',
                            type: 'relationship',
                            // NOTE: 'posts' will resolve correctly after `pnpm generate:types`
                            relationTo: 'posts' as any,
                            hasMany: true,
                            maxDepth: 1,
                            admin: {
                                description:
                                    'Surface related articles to readers. Also improves internal linking for SEO.',
                            },
                        },
                    ],
                },

                // ── Tab 3: Type-specific Details ─────────────────────────────────
                {
                    label: '📋 Type Details',
                    description: 'Fields that apply to specific post types (Case Study, Changelog).',
                    fields: [
                        // Case Study
                        {
                            type: 'collapsible',
                            label: '📋 Case Study Details',
                            admin: {
                                initCollapsed: false,
                                condition: (_, siblingData) =>
                                    siblingData?.postType === 'caseStudy',
                            },
                            fields: [
                                {
                                    name: 'caseStudy',
                                    type: 'group',
                                    fields: [
                                        { name: 'client', type: 'text', label: 'Client / Subject' },
                                        { name: 'industry', type: 'text', label: 'Industry' },
                                        { name: 'challenge', type: 'textarea', label: 'Challenge' },
                                        { name: 'solution', type: 'textarea', label: 'Solution' },
                                        {
                                            name: 'result',
                                            type: 'textarea',
                                            label: 'Result / Outcome',
                                        },
                                        {
                                            name: 'metrics',
                                            type: 'array',
                                            label: 'Key Metrics',
                                            fields: [
                                                { name: 'label', type: 'text', required: true },
                                                { name: 'value', type: 'text', required: true },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },

                        // Changelog
                        {
                            type: 'collapsible',
                            label: '📣 Changelog Details',
                            admin: {
                                initCollapsed: false,
                                condition: (_, siblingData) =>
                                    siblingData?.postType === 'changelog',
                            },
                            fields: [
                                {
                                    name: 'changelog',
                                    type: 'group',
                                    fields: [
                                        {
                                            name: 'version',
                                            type: 'text',
                                            label: 'Version (e.g. v1.4.2)',
                                        },
                                        {
                                            name: 'changeType',
                                            type: 'select',
                                            hasMany: true,
                                            options: [
                                                { label: '✨ Feature', value: 'feature' },
                                                { label: '🐛 Bug Fix', value: 'bugfix' },
                                                { label: '🔐 Security', value: 'security' },
                                                { label: '⚡ Performance', value: 'performance' },
                                                { label: '💥 Breaking Change', value: 'breaking' },
                                                {
                                                    label: '🗑️ Deprecation',
                                                    value: 'deprecation',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },

                // ── Tab 4: SEO & Social ──────────────────────────────────────────
                {
                    label: '🔎 SEO & Social',
                    description: 'Meta tags, Open Graph image, and search-engine directives.',
                    fields: [
                        {
                            name: 'seo',
                            type: 'group',
                            interfaceName: 'PostSeo',
                            fields: seoFields,
                        },
                    ],
                },

                // ── Tab 5: Structured Data ───────────────────────────────────────
                {
                    label: '🔍 Structured Data',
                    description:
                        'JSON-LD is generated automatically from this data. Do not edit manually.',
                    fields: schemaFields,
                },

                // ── Tab 6: Advanced ──────────────────────────────────────────────
                {
                    label: '⚙️ Advanced',
                    description: 'Feature flags, sponsorship info, and breadcrumb overrides.',
                    fields: [
                        {
                            name: 'isFeatured',
                            type: 'checkbox',
                            label: 'Featured Post',
                            defaultValue: false,
                            admin: {
                                description: 'Promoted in featured slots on the blog listing page.',
                            },
                        },
                        {
                            name: 'enableComments',
                            type: 'checkbox',
                            label: 'Enable Comments',
                            defaultValue: false,
                        },
                        {
                            name: 'sponsoredBy',
                            type: 'text',
                            label: 'Sponsored By (leave blank if organic)',
                            admin: {
                                description:
                                    'Adds a sponsored disclaimer and marks Schema.org sponsor.',
                            },
                        },
                        {
                            name: 'breadcrumbTitle',
                            type: 'text',
                            label: 'Short Breadcrumb Title',
                            admin: {
                                description:
                                    'Optional shorter title for breadcrumbs. Falls back to main title.',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}