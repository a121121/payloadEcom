import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Carousel } from '@/blocks/Carousel/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { Testimonials } from '@/blocks/Testimonials/config'
import { ThreeItemGrid } from '@/blocks/ThreeItemGrid/config'
import { hero } from '@/fields/hero'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly,
  },
  admin: {
    group: 'Content',
    // ✅ Added 'updatedAt' and '_status' so editors can spot stale/unpublished pages instantly
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },

    // ─── Sidebar: Publishing & Discoverability ───────────────────────────────
    {
      name: 'publishedOn',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            // Only auto-stamp on first publish (no existing value)
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },

    // ✅ NEW: Canonical URL — prevents duplicate-content penalties (e.g. /shop vs /shop?ref=email)
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'Canonical URL',
      admin: {
        position: 'sidebar',
        description:
          'Override the canonical URL for this page. Leave blank to use the default page URL.',
      },
    },

    // ✅ NEW: noIndex toggle — lets editors exclude pages from search engines without deleting them
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Hide from search engines (noindex)',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Check this to add a noindex meta tag and exclude this page from sitemaps.',
      },
    },

    // ─── Page Builder Tabs ────────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        // ── Tab 1: Hero ──────────────────────────────────────────────────────
        {
          fields: [hero],
          label: 'Hero',
        },

        // ── Tab 2: Content (Page Builder) ────────────────────────────────────
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              // ✅ NEW: Cap block count to prevent performance-killing pages
              maxRows: 20,
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
              ],
              required: true,
              admin: {
                description:
                  'Build your page by adding and reordering blocks. Maximum 20 blocks per page.',
              },
            },
          ],
          label: 'Content',
        },

        // ── Tab 3: SEO ───────────────────────────────────────────────────────
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),

            // ✅ NEW: JSON-LD Structured Data — enables rich results (FAQ, Product, Breadcrumb schemas)
            {
              name: 'structuredData',
              type: 'code',
              label: 'Structured Data (JSON-LD)',
              admin: {
                language: 'json',
                description:
                  'Paste valid JSON-LD structured data (e.g. FAQPage, BreadcrumbList, Product schema). This will be injected into the <head> as a <script type="application/ld+json"> tag.',
              },
            },

            // ✅ NEW: Open Graph image override (distinct from meta image for social sharing precision)
            {
              name: 'ogImage',
              type: 'upload',
              label: 'Social Share Image (Open Graph)',
              relationTo: 'media',
              admin: {
                description:
                  'Override the image shown when this page is shared on social media. Recommended size: 1200×630px. Falls back to the SEO meta image if not set.',
              },
            },
          ],
        },

        // ── Tab 4: Advanced ──────────────────────────────────────────────────
        // ✅ NEW: Dedicated tab for page-level settings that don't belong in SEO or Content
        {
          label: 'Advanced',
          fields: [
            // Redirect support — useful for retired pages that should 301 elsewhere
            {
              name: 'redirectTo',
              type: 'text',
              label: 'Redirect to URL',
              admin: {
                description:
                  'If set, this page will issue a 301 redirect to the specified URL. Useful when retiring a page that has inbound links.',
              },
            },

            // Page-level CSS class for theming (e.g. dark hero pages, sale pages)
            {
              name: 'pageTheme',
              type: 'select',
              label: 'Page Theme',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'Sale / Promo', value: 'sale' },
              ],
              admin: {
                description:
                  'Apply a page-level theme class to the <body> for custom styling of specific page types.',
              },
            },

            // ✅ NEW: Featured flag — useful for surfacing pages in navigation or featured sections
            {
              name: 'isFeatured',
              type: 'checkbox',
              label: 'Mark as Featured',
              defaultValue: false,
              admin: {
                description:
                  'Featured pages can be queried to appear in navigation spotlights, homepages, or featured sections.',
              },
            },
          ],
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      // ✅ Autosave debounced to 2s to avoid flooding the DB on slow connections
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 50,
  },
}