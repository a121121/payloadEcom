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
            type: 'row',
            fields: [
                {
                    name: 'columns',
                    type: 'number',
                    label: 'Number of Columns',
                    required: true,
                    defaultValue: 3,
                    min: 1,
                    max: 20,
                    admin: {
                        description:
                            'Set this first. All cells are filled left-to-right, row by row.',
                        width: '33%',
                    },
                },
                {
                    name: 'hasHeaderRow',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'First row is a header',
                    admin: { width: '33%' },
                },
                {
                    name: 'hasHeaderColumn',
                    type: 'checkbox',
                    defaultValue: false,
                    label: 'First column is a header',
                    admin: { width: '33%' },
                },
            ],
        },
        {
            type: 'row',
            fields: [
                {
                    name: 'striped',
                    type: 'checkbox',
                    defaultValue: true,
                    label: 'Striped rows',
                    admin: { width: '50%' },
                },
                {
                    name: 'compact',
                    type: 'checkbox',
                    defaultValue: false,
                    label: 'Compact (reduced padding)',
                    admin: { width: '50%' },
                },
            ],
        },
        {
            name: 'cells',
            type: 'array',
            label: 'Cells (fill left-to-right, row by row)',
            required: true,
            minRows: 1,
            admin: {
                description:
                    'Add cells in reading order. The number of columns above determines where each row breaks.',
                components: {
                    // rowLabel shows the inferred position so editors aren't lost
                    // rowLabel: ... // customise if your Payload version supports it
                },
            },
            fields: [
                {
                    name: 'content',
                    type: 'text',
                    required: true,
                    label: 'Content',
                },
                {
                    name: 'align',
                    type: 'select',
                    defaultValue: 'left',
                    label: 'Align',
                    options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                    ],
                },
            ],
        },
    ],
    labels: { singular: 'Table', plural: 'Tables' },
}