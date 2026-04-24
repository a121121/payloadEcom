/**
 * globals/BlogSettings.ts
 *
 * A Global for site-wide blog configuration.
 * Controls listing page SEO, default OG image, JSON-LD org info, etc.
 */

import type { GlobalConfig } from 'payload'

export const BlogSettings: GlobalConfig = {
    slug: 'blog-settings',
    label: 'Blog Settings',
    admin: {
        group: 'Blog',
        description: 'Global configuration for the blog: defaults, SEO, JSON-LD organisation info.',
    },
    fields: [
        // ── General ──────────────────────────────────────────────────────────────
        {
            name: 'blogTitle',
            type: 'text',
            defaultValue: 'Blog',
            label: 'Blog Section Title',
        },
        {
            name: 'blogDescription',
            type: 'textarea',
            label: 'Blog Section Description (shown on /blog listing page)',
        },
        {
            name: 'defaultHeroImage',
            type: 'upload',
            relationTo: 'media',
            label: 'Default Hero / OG Image (fallback when a post has none)',
        },
        {
            name: 'postsPerPage',
            type: 'number',
            defaultValue: 12,
            label: 'Posts Per Page',
        },

        // ── JSON-LD Organisation ──────────────────────────────────────────────────
        {
            type: 'collapsible',
            label: '🏢 Organisation (for Schema.org Publisher)',
            admin: {
                initCollapsed: false,
                description: 'Used in the publisher field of all Article JSON-LD schemas.',
            },
            fields: [
                {
                    name: 'orgName',
                    type: 'text',
                    label: 'Organisation Name',
                    admin: { description: 'e.g. "Acme Corp"' },
                },
                {
                    name: 'orgLogo',
                    type: 'upload',
                    relationTo: 'media',
                    label: 'Organisation Logo (for Schema.org)',
                    admin: {
                        description: 'Recommended 112x112px or larger square image.',
                    },
                },
                {
                    name: 'orgUrl',
                    type: 'text',
                    label: 'Organisation URL',
                },
            ],
        },

        // ── Featured Posts ────────────────────────────────────────────────────────
        {
            name: 'featuredPosts',
            type: 'relationship',
            relationTo: 'posts' as any,
            hasMany: true,
            maxDepth: 1,
            label: 'Pinned / Featured Posts',
            admin: {
                description: 'These posts are always shown at the top of the blog listing.',
            },
        },

        // ── RSS ───────────────────────────────────────────────────────────────────
        {
            name: 'enableRss',
            type: 'checkbox',
            defaultValue: true,
            label: 'Enable RSS Feed',
        },
        {
            name: 'rssTitle',
            type: 'text',
            label: 'RSS Feed Title',
            admin: {
                condition: (_, s) => s?.enableRss,
            },
        },

        // ── Newsletter CTA ────────────────────────────────────────────────────────
        {
            type: 'collapsible',
            label: '📧 Newsletter CTA (shown in sidebar / at end of posts)',
            admin: { initCollapsed: true },
            fields: [
                { name: 'newsletterHeading', type: 'text', label: 'Heading' },
                { name: 'newsletterSubtext', type: 'text', label: 'Subtext' },
                {
                    name: 'newsletterForm',
                    type: 'relationship',
                    relationTo: 'forms',
                    label: 'Form',
                },
            ],
        },
    ],
}