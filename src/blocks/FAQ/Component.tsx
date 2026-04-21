'use client'

import { RichText } from '@/components/RichText'
import type { FAQBlock as FAQBlockProps } from '@/payload-types'
import { cn } from '@/utilities/cn'
import type { DefaultDocumentIDType } from 'payload'
import React, { useId, useState } from 'react'
import type { FAQBlockData } from './generateFAQJsonLd'
import { generateFAQSchema } from './generateFAQJsonLd'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = FAQBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
    /** Canonical URL of the current page — passed through to generateFAQSchema */
    pageUrl?: string
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className={cn(
            'shrink-0 text-current transition-transform duration-300 ease-in-out',
            open && 'rotate-180',
        )}
    >
        <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// ─── Single accordion item ────────────────────────────────────────────────────

const AccordionItem: React.FC<{
    item: NonNullable<FAQBlockProps['items']>[number]
    index: number
    defaultOpen: boolean
    answerId: string
    questionId: string
}> = ({ item, index, defaultOpen, answerId, questionId }) => {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div
            className={cn(
                'border-b border-border last:border-b-0',
                'transition-colors duration-200',
            )}
        >
            <button
                id={questionId}
                aria-expanded={open}
                aria-controls={answerId}
                onClick={() => setOpen((prev) => !prev)}
                className={cn(
                    'group flex w-full items-start gap-4 py-5 text-left',
                    'text-base font-medium text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
                    'hover:text-foreground/80 transition-colors duration-150',
                )}
            >
                {/* Index number */}
                <span
                    aria-hidden="true"
                    className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center',
                        'rounded-full text-xs font-semibold tabular-nums',
                        'bg-muted text-muted-foreground transition-colors duration-200',
                        open && 'bg-foreground text-background',
                    )}
                >
                    {String(index + 1).padStart(2, '0')}
                </span>

                <span className="flex-1 leading-snug">{item.question}</span>

                <ChevronIcon open={open} />
            </button>

            {/* Answer panel — CSS-driven height animation */}
            <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className={cn(
                    'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
            >
                <div className="min-h-0">
                    <div className="pb-6 pl-10 pr-8 text-muted-foreground">
                        {item.answer && (
                            <RichText
                                data={item.answer}
                                enableGutter={false}
                                className="prose prose-sm max-w-none text-muted-foreground"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Always-expanded list item ────────────────────────────────────────────────

const ListItem: React.FC<{
    item: NonNullable<FAQBlockProps['items']>[number]
    index: number
}> = ({ item, index }) => (
    <div className="py-6 border-b border-border last:border-b-0">
        <p className="mb-3 flex items-start gap-3 text-base font-semibold text-foreground">
            <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground"
            >
                {String(index + 1).padStart(2, '0')}
            </span>
            {item.question}
        </p>
        <div className="pl-9 text-muted-foreground">
            {item.answer && (
                <RichText
                    data={item.answer}
                    enableGutter={false}
                    className="prose prose-sm max-w-none text-muted-foreground"
                />
            )}
        </div>
    </div>
)

// ─── Grid item ────────────────────────────────────────────────────────────────

const GridItem: React.FC<{
    item: NonNullable<FAQBlockProps['items']>[number]
}> = ({ item }) => (
    <div
        className={cn(
            'rounded-xl border border-border bg-card p-6',
            'flex flex-col gap-3',
        )}
    >
        <p className="text-sm font-semibold text-foreground leading-snug">{item.question}</p>
        {item.answer && (
            <RichText
                data={item.answer}
                enableGutter={false}
                className="prose prose-sm max-w-none text-muted-foreground"
            />
        )}
    </div>
)

// ─── Category tabs ────────────────────────────────────────────────────────────

const CategoryTabs: React.FC<{
    categories: string[]
    active: string
    onChange: (cat: string) => void
}> = ({ categories, active, onChange }) => (
    <div
        role="tablist"
        aria-label="Filter questions by category"
        className="mb-8 flex flex-wrap gap-2"
    >
        {['All', ...categories].map((cat) => (
            <button
                key={cat}
                role="tab"
                aria-selected={active === cat}
                onClick={() => onChange(cat)}
                className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    active === cat
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70',
                )}
            >
                {cat}
            </button>
        ))}
    </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

export const FAQBlock: React.FC<Props> = (props) => {
    const { title, description, displayStyle = 'accordion', items, schemaId, className, pageUrl } =
        props

    const uid = useId()

    // Collect unique non-empty categories for the optional filter tabs
    const categories = Array.from(
        new Set(items?.map((i) => i.category).filter(Boolean) as string[]),
    )
    const hasCategoryTabs = categories.length > 1

    const [activeCategory, setActiveCategory] = useState<string>('All')

    const visibleItems =
        hasCategoryTabs && activeCategory !== 'All'
            ? (items ?? []).filter((i) => i.category === activeCategory)
            : (items ?? [])

    // ── JSON-LD ────────────────────────────────────────────────────────────────
    const schema = generateFAQSchema(
        {
            blockType: 'faq',
            title,
            description,
            displayStyle,
            schemaId,
            items: items ?? [],
        } as FAQBlockData,
        pageUrl,
    )

    return (
        <section
            aria-label={title ?? 'Frequently asked questions'}
            className={cn('container my-16', className)}
        >
            {/* Inline JSON-LD */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            {/* Section header */}
            {(title || description) && (
                <header className="mb-10 max-w-2xl">
                    {title && (
                        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
                    )}
                </header>
            )}

            {/* Category filter tabs — only when ≥2 distinct categories */}
            {hasCategoryTabs && (
                <CategoryTabs
                    categories={categories}
                    active={activeCategory}
                    onChange={setActiveCategory}
                />
            )}

            {/* ── Accordion ── */}
            {displayStyle === 'accordion' && (
                <div
                    role="list"
                    className="divide-y divide-border rounded-xl border border-border bg-card px-6"
                >
                    {visibleItems.map((item, index) => {
                        const answerId = `${uid}-answer-${index}`
                        const questionId = `${uid}-question-${index}`
                        return (
                            <div role="listitem" key={item.id ?? index}>
                                <AccordionItem
                                    item={item}
                                    index={index}
                                    defaultOpen={item.openByDefault ?? false}
                                    answerId={answerId}
                                    questionId={questionId}
                                />
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── List (always expanded) ── */}
            {displayStyle === 'list' && (
                <div className="divide-y divide-border">
                    {visibleItems.map((item, index) => (
                        <ListItem key={item.id ?? index} item={item} index={index} />
                    ))}
                </div>
            )}

            {/* ── 2-column grid ── */}
            {displayStyle === 'grid' && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {visibleItems.map((item, index) => (
                        <GridItem key={item.id ?? index} item={item} />
                    ))}
                </div>
            )}
        </section>
    )
}