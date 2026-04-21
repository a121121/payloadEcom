/**
 * generateFAQSchema
 *
 * Converts a resolved FAQBlock (as returned by Payload's REST/Local API) into
 * a schema.org FAQPage JSON-LD object ready to be injected via
 * <script type="application/ld+json">.
 *
 * Schema reference:
 *   https://schema.org/FAQPage
 *   https://developers.google.com/search/docs/appearance/structured-data/faqpage
 *
 * Usage (Next.js App Router example):
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { generateFAQSchema } from '@/blocks/FAQ/schema'
 *
 *   export default async function Page({ params }) {
 *     const page = await getPageBySlug(params.slug)
 *     const faqBlocks = page.layout.filter(b => b.blockType === 'faq')
 *
 *     return (
 *       <>
 *         {faqBlocks.map((block, i) => (
 *           <script
 *             key={i}
 *             type="application/ld+json"
 *             dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(block)) }}
 *           />
 *         ))}
 *         <PageContent page={page} />
 *       </>
 *     )
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of a single FAQ item as resolved from Payload */
export interface FAQItem {
    question: string
    /** Rich text from Payload — can be a Lexical serialised object or raw HTML string */
    answer: LexicalRichText | string
    answerUrl?: string
    upvoteCount?: number
    datePublished?: string // ISO date string
    category?: string
    openByDefault?: boolean
}

/** Minimal Lexical rich-text shape (Payload default editor output) */
export interface LexicalRichText {
    root: {
        children: LexicalNode[]
        [key: string]: unknown
    }
}

export interface LexicalNode {
    type?: string
    text?: string
    children?: LexicalNode[]
    [key: string]: unknown
}

/** Full FAQBlock shape as resolved from Payload */
export interface FAQBlockData {
    blockType: 'faq'
    title?: string
    description?: string
    displayStyle?: 'accordion' | 'list' | 'grid'
    schemaId?: string
    items: FAQItem[]
}

// ── Plain-text extraction ─────────────────────────────────────────────────────

/**
 * Recursively extract plain text from a Lexical rich-text tree.
 * Google requires plain text (not HTML) in Answer.text.
 */
function extractTextFromLexical(node: LexicalNode): string {
    if (node.text) return node.text

    if (node.children && node.children.length > 0) {
        const childText = node.children.map(extractTextFromLexical).join('')

        // Insert a paragraph break after block-level nodes so the text reads
        // naturally when concatenated (schema.org allows \n in Answer.text).
        const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote', 'code'])
        if (node.type && BLOCK_TYPES.has(node.type)) {
            return childText + '\n\n'
        }

        return childText
    }

    return ''
}

/**
 * Strips HTML tags from a string and collapses excess whitespace.
 * Used when the answer field contains raw HTML rather than a Lexical object.
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]+>/g, ' ') // remove tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ')   // collapse whitespace
        .trim()
}

/**
 * Normalise the answer field to a plain-text string regardless of whether
 * Payload has returned a Lexical object or a pre-rendered HTML string.
 */
export function resolveAnswerText(answer: LexicalRichText | string): string {
    if (typeof answer === 'string') {
        // HTML string (e.g. from a custom serialiser or older Payload version)
        return stripHtml(answer)
    }

    // Lexical object
    if (answer?.root?.children) {
        return extractTextFromLexical(answer.root).trim()
    }

    return ''
}

// ── Schema builders ───────────────────────────────────────────────────────────

/**
 * Build a single schema.org Question entity from an FAQItem.
 */
export function buildQuestionSchema(item: FAQItem) {
    const answerText = resolveAnswerText(item.answer)

    const acceptedAnswer: Record<string, unknown> = {
        '@type': 'Answer',
        text: answerText,
    }

    if (item.answerUrl) {
        acceptedAnswer.url = item.answerUrl
    }

    if (typeof item.upvoteCount === 'number' && item.upvoteCount >= 0) {
        acceptedAnswer.upvoteCount = item.upvoteCount
    }

    if (item.datePublished) {
        acceptedAnswer.dateCreated = item.datePublished
    }

    return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer,
    }
}

/**
 * Generate a complete schema.org FAQPage JSON-LD object from a resolved
 * FAQBlock payload.
 *
 * @param block  - The resolved FAQBlock from Payload
 * @param pageUrl - Canonical URL of the page this block lives on (optional but
 *                  recommended — used to build Answer.url anchors when the item
 *                  does not already specify one)
 */
export function generateFAQSchema(
    block: FAQBlockData,
    pageUrl?: string,
): Record<string, unknown> {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
    }

    // Optional @id — useful when the same FAQ is embedded on multiple pages
    if (block.schemaId) {
        schema['@id'] = block.schemaId
    } else if (pageUrl) {
        schema['@id'] = `${pageUrl}#faqpage`
    }

    // Build mainEntity array — one Question per item
    schema.mainEntity = block.items
        .filter(item => item.question && item.answer)
        .map((item, index) => {
            const questionSchema = buildQuestionSchema(item)

            // Auto-generate an anchor URL if the page URL is known and no explicit
            // answerUrl is set, so Google can deep-link to individual answers.
            if (pageUrl && !item.answerUrl) {
                const slug = item.question
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .slice(0, 60)

                questionSchema.acceptedAnswer = {
                    ...questionSchema.acceptedAnswer as Record<string, unknown>,
                    url: `${pageUrl}#faq-${index + 1}-${slug}`,
                }
            }

            return questionSchema
        })

    return schema
}

// ── Multi-block helper ────────────────────────────────────────────────────────

/**
 * When a page has multiple FAQ blocks, Google recommends combining them into
 * a single FAQPage entity. This utility merges all items into one schema object.
 *
 * @param blocks  - Array of resolved FAQBlock data objects
 * @param pageUrl - Canonical URL of the page
 */
export function generateCombinedFAQSchema(
    blocks: FAQBlockData[],
    pageUrl?: string,
): Record<string, unknown> | null {
    const allItems = blocks.flatMap(b => b.items).filter(i => i.question && i.answer)

    if (allItems.length === 0) return null

    return generateFAQSchema(
        {
            blockType: 'faq',
            items: allItems,
            schemaId: pageUrl ? `${pageUrl}#faqpage` : undefined,
        },
        pageUrl,
    )
}