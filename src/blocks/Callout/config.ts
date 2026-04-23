import {
    FixedToolbarFeature,
    InlineToolbarFeature,
    lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

export const CalloutBlock: Block = {
    slug: 'callout',
    interfaceName: 'CalloutBlock',
    fields: [
        { name: 'emoji', type: 'text', label: 'Icon / Emoji (optional)', maxLength: 4 },
        { name: 'heading', type: 'text', label: 'Callout Heading (optional)' },
        {
            name: 'content',
            type: 'richText',
            editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                ],
            }),
            label: false,
        },
        {
            name: 'variant',
            type: 'select',
            defaultValue: 'tip',
            options: [
                { label: '💡 Tip', value: 'tip' },
                { label: '📝 Note', value: 'note' },
                { label: '⚠️  Caution', value: 'caution' },
                { label: '🔑 Key Takeaway', value: 'keyTakeaway' },
                { label: '🔗 Related Reading', value: 'related' },
                { label: '🧪 Try It', value: 'tryIt' },
            ],
        },
        {
            name: 'collapsible',
            type: 'checkbox',
            defaultValue: false,
            label: 'Make this callout collapsible',
        },
    ],
    labels: { singular: 'Callout', plural: 'Callouts' },
}