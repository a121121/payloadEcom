import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { isAdmin } from '@/access/isAdmin'
import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
    slug: 'promotions',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'type', 'status', 'startDate', 'endDate'],
        group: 'Ecommerce',
    },
    access: {
        read: adminOrPublishedStatus,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
    },
    fields: [
        // ─── Identity ───────────────────────────────────────────────────
        {
            name: 'name',
            type: 'text',
            required: true,
            admin: { description: 'Internal name. Customers never see this.' },
        },
        {
            name: 'label',
            type: 'text',
            admin: { description: 'Public-facing label shown to customers, e.g. "Mothers Day Sale 🌸"' },
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Active', value: 'active' },
                { label: 'Paused', value: 'paused' },
                { label: 'Expired', value: 'expired' },
            ],
            admin: { position: 'sidebar' },
        },
        {
            name: 'priority',
            type: 'number',
            defaultValue: 0,
            admin: {
                position: 'sidebar',
                description: 'Higher number wins when multiple promotions are active on a product.',
            },
        },

        // ─── Promotion Type ─────────────────────────────────────────────
        {
            name: 'type',
            type: 'select',
            required: true,
            options: [
                { label: 'Percentage Discount', value: 'percentage' },
                { label: 'Fixed Amount Off', value: 'fixed_amount' },
                { label: 'Buy X Get Y Free', value: 'bxgy' },
                { label: 'Flash Sale (Time-Limited)', value: 'flash' },
                { label: 'Coupon Code', value: 'coupon' },
                { label: 'Free Shipping', value: 'free_shipping' },
                { label: 'Bundle Discount', value: 'bundle' },
            ],
        },

        // ─── Tabs ────────────────────────────────────────────────────────
        {
            type: 'tabs',
            tabs: [
                // ── Discount Rules ──────────────────────────────────────────
                {
                    label: 'Discount Rules',
                    fields: [
                        {
                            name: 'discountValue',
                            type: 'number',
                            admin: {
                                condition: (data) =>
                                    ['percentage', 'fixed_amount', 'flash', 'coupon'].includes(data?.type),
                                description: 'For percentage: enter 30 for 30% off. For fixed: enter dollar amount.',
                            },
                        },
                        {
                            name: 'maxDiscountAmount',
                            type: 'number',
                            admin: {
                                condition: (data) => data?.type === 'percentage',
                                description: 'Cap the discount at this dollar amount (optional).',
                            },
                        },

                        // Buy X Get Y
                        {
                            name: 'bxgy',
                            type: 'group',
                            admin: { condition: (data) => data?.type === 'bxgy' },
                            fields: [
                                {
                                    name: 'buyQuantity',
                                    label: 'Buy Quantity (X)',
                                    type: 'number',
                                    defaultValue: 1,
                                    required: true,
                                },
                                {
                                    name: 'getQuantity',
                                    label: 'Get Quantity (Y)',
                                    type: 'number',
                                    defaultValue: 1,
                                    required: true,
                                },
                                {
                                    name: 'getFreeProducts',
                                    label: 'Which products are free? (leave empty = same product)',
                                    type: 'relationship',
                                    relationTo: 'products',
                                    hasMany: true,
                                },
                            ],
                        },

                        // Bundle
                        {
                            name: 'bundle',
                            type: 'group',
                            admin: { condition: (data) => data?.type === 'bundle' },
                            fields: [
                                {
                                    name: 'requiredProducts',
                                    label: 'Products that must be in cart together',
                                    type: 'relationship',
                                    relationTo: 'products',
                                    hasMany: true,
                                    minRows: 2,
                                },
                                {
                                    name: 'bundleDiscountValue',
                                    label: 'Bundle Discount (%)',
                                    type: 'number',
                                },
                            ],
                        },

                        // Coupon
                        {
                            name: 'coupon',
                            type: 'group',
                            admin: { condition: (data) => data?.type === 'coupon' },
                            fields: [
                                {
                                    name: 'code',
                                    type: 'text',
                                    required: true,
                                    admin: { description: 'e.g. SAVE20, MOTHERSDAY' },
                                    hooks: {
                                        beforeValidate: [
                                            ({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value),
                                        ],
                                    },
                                },
                                {
                                    name: 'usageLimit',
                                    type: 'number',
                                    admin: { description: 'Max total redemptions. Leave empty for unlimited.' },
                                },
                                {
                                    name: 'usageLimitPerUser',
                                    type: 'number',
                                    defaultValue: 1,
                                    admin: { description: 'Max uses per customer.' },
                                },
                                {
                                    name: 'usageCount',
                                    type: 'number',
                                    defaultValue: 0,
                                    admin: { readOnly: true },
                                },
                            ],
                        },
                    ],
                },

                // ── Eligibility ─────────────────────────────────────────────
                {
                    label: 'Eligibility',
                    fields: [
                        {
                            name: 'appliesTo',
                            type: 'select',
                            defaultValue: 'all_products',
                            options: [
                                { label: 'All Products', value: 'all_products' },
                                { label: 'Specific Products', value: 'specific_products' },
                                { label: 'Specific Categories', value: 'specific_categories' },
                            ],
                        },
                        {
                            name: 'products',
                            type: 'relationship',
                            relationTo: 'products',
                            hasMany: true,
                            admin: {
                                condition: (data) => data?.appliesTo === 'specific_products',
                            },
                        },
                        {
                            name: 'categories',
                            type: 'relationship',
                            relationTo: 'categories',
                            hasMany: true,
                            admin: {
                                condition: (data) => data?.appliesTo === 'specific_categories',
                            },
                        },
                        {
                            name: 'minimumOrderAmount',
                            type: 'number',
                            admin: { description: 'Minimum cart total (in USD) to qualify for this promotion.' },
                        },
                        {
                            name: 'minimumQuantity',
                            type: 'number',
                            admin: { description: 'Minimum number of items in cart to qualify.' },
                        },
                        {
                            name: 'customerEligibility',
                            type: 'select',
                            defaultValue: 'all',
                            options: [
                                { label: 'All Customers', value: 'all' },
                                { label: 'First-Time Customers Only', value: 'first_time' },
                                { label: 'Logged-In Customers Only', value: 'logged_in' },
                            ],
                        },
                    ],
                },

                // ── Schedule ────────────────────────────────────────────────
                {
                    label: 'Schedule',
                    fields: [
                        {
                            name: 'startDate',
                            type: 'date',
                            admin: {
                                date: { pickerAppearance: 'dayAndTime' },
                                description: 'Promotion becomes active at this time.',
                            },
                        },
                        {
                            name: 'endDate',
                            type: 'date',
                            admin: {
                                date: { pickerAppearance: 'dayAndTime' },
                                description: 'Promotion automatically expires at this time.',
                            },
                        },

                        // Flash sale specific
                        {
                            name: 'flash',
                            type: 'group',
                            admin: { condition: (data) => data?.type === 'flash' },
                            fields: [
                                {
                                    name: 'durationMinutes',
                                    label: 'Duration (minutes)',
                                    type: 'number',
                                    admin: {
                                        description:
                                            'e.g. 10 = "Order within 10 minutes to get the discount". The timer resets per session.',
                                    },
                                },
                                {
                                    name: 'showCountdown',
                                    type: 'checkbox',
                                    defaultValue: true,
                                    label: 'Show countdown timer on frontend',
                                },
                            ],
                        },

                        {
                            name: 'stackable',
                            type: 'checkbox',
                            defaultValue: false,
                            label: 'Can this promotion stack with others?',
                            admin: { description: 'If unchecked, only the highest-priority promotion applies.' },
                        },
                    ],
                },

                // ── Blocks (UI Components) ───────────────────────────────────
                {
                    label: 'UI Blocks',
                    fields: [
                        {
                            name: 'blocks',
                            type: 'blocks',
                            blocks: [
                                // Popup block
                                {
                                    slug: 'promotionPopup',
                                    labels: { singular: 'Popup', plural: 'Popups' },
                                    fields: [
                                        { name: 'heading', type: 'text', required: true },
                                        { name: 'body', type: 'textarea' },
                                        {
                                            name: 'image',
                                            type: 'upload',
                                            relationTo: 'media',
                                        },
                                        {
                                            name: 'triggerOn',
                                            type: 'select',
                                            defaultValue: 'page_load',
                                            options: [
                                                { label: 'Page Load', value: 'page_load' },
                                                { label: 'Exit Intent', value: 'exit_intent' },
                                                { label: 'After X Seconds', value: 'after_seconds' },
                                                { label: 'On Add to Cart', value: 'on_add_to_cart' },
                                            ],
                                        },
                                        {
                                            name: 'triggerAfterSeconds',
                                            type: 'number',
                                            admin: { condition: (data) => data?.triggerOn === 'after_seconds' },
                                        },
                                        {
                                            name: 'ctaLabel',
                                            label: 'CTA Button Label',
                                            type: 'text',
                                            defaultValue: 'Shop Now',
                                        },
                                        { name: 'ctaUrl', label: 'CTA URL', type: 'text' },
                                        { name: 'showOnce', type: 'checkbox', defaultValue: true },
                                    ],
                                },

                                // Banner block
                                {
                                    slug: 'promotionBanner',
                                    labels: { singular: 'Banner', plural: 'Banners' },
                                    fields: [
                                        { name: 'text', type: 'text', required: true },
                                        {
                                            name: 'backgroundColor',
                                            type: 'text',
                                            defaultValue: '#000000',
                                            admin: { description: 'Hex color code' },
                                        },
                                        { name: 'textColor', type: 'text', defaultValue: '#ffffff' },
                                        {
                                            name: 'position',
                                            type: 'select',
                                            defaultValue: 'top',
                                            options: [
                                                { label: 'Top of Page', value: 'top' },
                                                { label: 'Bottom of Page', value: 'bottom' },
                                            ],
                                        },
                                        { name: 'dismissible', type: 'checkbox', defaultValue: true },
                                    ],
                                },

                                // Countdown timer block
                                {
                                    slug: 'promotionCountdown',
                                    labels: { singular: 'Countdown Timer', plural: 'Countdown Timers' },
                                    fields: [
                                        { name: 'heading', type: 'text' },
                                        {
                                            name: 'timerType',
                                            type: 'select',
                                            defaultValue: 'to_end_date',
                                            options: [
                                                { label: 'Count down to promotion end date', value: 'to_end_date' },
                                                { label: 'Fixed duration per session', value: 'session_duration' },
                                            ],
                                        },
                                        {
                                            name: 'sessionDurationMinutes',
                                            type: 'number',
                                            admin: { condition: (data) => data?.timerType === 'session_duration' },
                                        },
                                        { name: 'expiredMessage', type: 'text', defaultValue: 'Offer has ended.' },
                                    ],
                                },

                                // Badge / label block (shown on product cards)
                                {
                                    slug: 'promotionBadge',
                                    labels: { singular: 'Product Badge', plural: 'Product Badges' },
                                    fields: [
                                        { name: 'text', type: 'text', required: true, admin: { description: 'e.g. "🔥 Hot Deal", "20% OFF"' } },
                                        { name: 'backgroundColor', type: 'text', defaultValue: '#e53e3e' },
                                        { name: 'textColor', type: 'text', defaultValue: '#ffffff' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}