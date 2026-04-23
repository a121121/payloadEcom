import type { Block } from 'payload'

export const TableBlock: Block = {
    slug: 'tableBlock',
    interfaceName: 'TableBlock',
    fields: [
        {
            name: 'caption',
            type: 'text',
            label: 'Table Caption (optional)',
        },
        {
            name: 'style',
            type: 'select',
            label: 'Visual Style',
            defaultValue: 'dark-sleek',
            options: [
                { label: '🌑 Dark Sleek', value: 'dark-sleek' },
                { label: '🎨 Colorful Accent', value: 'colorful' },
                { label: '📰 Magazine / Editorial', value: 'magazine' },
                { label: '⬜ Clean Minimal', value: 'minimal' },
                { label: '📊 Spreadsheet', value: 'spreadsheet' },
            ],
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'hasHeaderRow',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'First row is a header',
                    admin: { width: '25%' },
                },
                {
                    name: 'hasHeaderColumn',
                    type: 'checkbox',
                    defaultValue: false,
                    label: 'First column is a header',
                    admin: { width: '25%' },
                },
                {
                    name: 'striped',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'Striped rows',
                    admin: { width: '25%' },
                },
                {
                    name: 'compact',
                    type: 'checkbox',
                    defaultValue: false,
                    label: 'Compact (reduced padding)',
                    admin: { width: '25%' },
                },
            ],
        },

        // ✅ SINGLE SOURCE OF TRUTH (fixes your issue)
        {
            name: 'table',
            type: 'json',
            label: 'Table Data',
            admin: {
                components: {
                    Field: '@/blocks/Table/TableGridEditor#TableGridEditor',
                },
            },
        },
    ],
    labels: { singular: 'Table', plural: 'Tables' },
}
