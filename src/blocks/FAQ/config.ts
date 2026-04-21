import type { Block } from 'payload'

/**
 * FAQBlock — schema.org/FAQPage-compatible Payload block.
 *
 * Maps directly to:
 *   @type: FAQPage → mainEntity[] → @type: Question
 *                                  → name            (question)
 *                                  → acceptedAnswer  → @type: Answer
 *                                                    → text (answer)
 *
 * Additional fields feed optional schema.org properties and give editors
 * control over presentation without touching code.
 */
export const FAQBlock: Block = {
    slug: 'faq',
    interfaceName: 'FAQBlock',

    // ── Block-level fields ────────────────────────────────────────────────────
    fields: [
        // ── Section chrome ──────────────────────────────────────────────────────
        {
            name: 'title',
            type: 'text',
            label: 'Section title',
            admin: {
                description: 'Optional heading rendered above the FAQ list (e.g. "Frequently asked questions").',
            },
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Intro copy',
            admin: {
                description: 'Short paragraph shown between the section title and the first question.',
            },
        },

        // ── Presentation ─────────────────────────────────────────────────────────
        {
            name: 'displayStyle',
            type: 'select',
            label: 'Display style',
            defaultValue: 'accordion',
            options: [
                { label: 'Accordion (expand on click)', value: 'accordion' },
                { label: 'Always expanded list', value: 'list' },
                { label: '2-column grid', value: 'grid' },
            ],
            admin: {
                description: 'Controls how the Q&A pairs are rendered on the front end.',
            },
        },

        // ── Schema.org extras ───────────────────────────────────────────────────
        {
            name: 'schemaId',
            type: 'text',
            label: 'Schema identifier (URL)',
            admin: {
                position: 'sidebar',
                description:
                    'Optional @id for this FAQPage entity (e.g. https://example.com/faq#faqblock). '
                    + 'Useful when the same FAQ appears on multiple pages.',
            },
        },

        // ── Q&A items ────────────────────────────────────────────────────────────
        {
            name: 'items',
            type: 'array',
            label: 'Questions & answers',
            minRows: 1,
            maxRows: 50,
            labels: {
                singular: 'FAQ item',
                plural: 'FAQ items',
            },
            admin: {
                description: 'Each item becomes one schema.org Question entity inside FAQPage.mainEntity.',
                initCollapsed: true,
                components: {
                    // Uncomment if you add a custom RowLabel component later:
                    // RowLabel: '@/blocks/FAQ/RowLabel',
                },
            },
            fields: [
                // ── Required by schema.org ─────────────────────────────────────────
                {
                    name: 'question',
                    type: 'text',
                    label: 'Question',
                    required: true,
                    admin: {
                        description:
                            'Maps to schema.org Question.name. Write as a full question (e.g. "How do I reset my password?").',
                    },
                },
                {
                    name: 'answer',
                    type: 'richText',
                    label: 'Answer',
                    required: true,
                    admin: {
                        description:
                            'Maps to schema.org Answer.text. '
                            + 'HTML is stripped to plain text for the JSON-LD output; '
                            + 'the rich version is used for rendering.',
                    },
                },

                // ── Optional schema.org properties ────────────────────────────────
                {
                    name: 'answerUrl',
                    type: 'text',
                    label: 'Answer URL / anchor',
                    admin: {
                        description:
                            'Canonical URL (or #anchor) where this answer can be found. '
                            + 'Maps to Answer.url. Helps Google link directly to the answer.',
                    },
                },
                {
                    name: 'upvoteCount',
                    type: 'number',
                    label: 'Upvote count',
                    min: 0,
                    admin: {
                        description:
                            'Maps to Answer.upvoteCount. Optional social-proof signal for Google. '
                            + 'Set to 0 or leave blank if not applicable.',
                    },
                },
                {
                    name: 'datePublished',
                    type: 'date',
                    label: 'Date published',
                    admin: {
                        date: { pickerAppearance: 'dayOnly' },
                        description:
                            'Maps to Answer.dateCreated / datePublished. '
                            + 'Useful for freshness signals on support/evergreen FAQ content.',
                    },
                },

                // ── Editorial / UX ─────────────────────────────────────────────────
                {
                    name: 'category',
                    type: 'text',
                    label: 'Category tag',
                    admin: {
                        description:
                            'Optional label to group questions (e.g. "Billing", "Shipping"). '
                            + 'Not part of schema.org — used for filtered tabs in the renderer.',
                    },
                },
                {
                    name: 'openByDefault',
                    type: 'checkbox',
                    label: 'Open by default',
                    defaultValue: false,
                    admin: {
                        description:
                            'When using the accordion display style, this item starts expanded. '
                            + 'Useful for the most important or most common question.',
                    },
                },
            ],
        },
    ],
}