/**
 * app/blog/page.tsx
 *
 * Blog listing page — /blog
 * Shows published posts, paginated, with category filtering.
 *
 * Styled with Tailwind utilities against the existing design tokens in
 * globals.css (background/foreground/card/border/muted/accent, --radius)
 * plus shadcn primitives (Badge, Button, Separator). Newest post runs as
 * a feature; the rest are compact rows with a date column, so the list
 * reads like a dated record rather than a generic card grid.
 */

import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// ─── Config ───────────────────────────────────────────────────────────────────

const SITE_CONFIG = {
    siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://example.com',
    siteName: 'Your Site Name',
}

const POSTS_PER_PAGE = 12

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Articles, guides, and news.',
    alternates: {
        canonical: `${SITE_CONFIG.siteUrl}/blog`,
    },
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPosts({
    page = 1,
    categorySlug,
}: {
    page?: number
    categorySlug?: string
}) {
    const payload = await getPayload({ config: configPromise })

    const where: Record<string, unknown> = {
        status: { equals: 'published' },
    }

    if (categorySlug) {
        where['categories.slug'] = { equals: categorySlug }
    }

    return payload.find({
        collection: 'posts',
        where,
        sort: '-publishedAt',
        depth: 1, // populate heroImage and categories only
        limit: POSTS_PER_PAGE,
        page,
    })
}

async function getCategories() {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
        collection: 'categories',
        limit: 100,
        pagination: false,
    })
    return result.docs
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Relationship fields come back typed as `number | Media | null` — only the
// object shape is populated at runtime (thanks to `depth`), so narrow it here
// rather than reading `.url` straight off the union.
function getMedia(value: unknown): Media | null {
    if (value && typeof value === 'object' && 'url' in value) {
        return value as Media
    }
    return null
}

function formatLongDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function formatShortDate(dateString: string) {
    const date = new Date(dateString)
    return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.toLocaleDateString('en-US', { day: '2-digit' }),
        year: date.toLocaleDateString('en-US', { year: 'numeric' }),
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogIndexPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>
}) {
    const { page: pageParam, category } = await searchParams
    const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

    const [{ docs: posts, totalPages, totalDocs }, categories] = await Promise.all([
        getPosts({ page: currentPage, categorySlug: category }),
        getCategories(),
    ])

    const [featured, ...rest] = posts
    const categorySuffix = category ? `&category=${category}` : ''
    const featuredImage = featured ? getMedia(featured.heroImage) : null

    return (
        <main className="container py-12 md:py-16">
            {/* Masthead */}
            <header className="flex items-baseline justify-between gap-4 pb-6">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                    {SITE_CONFIG.siteName}
                </h1>
                <p className="shrink-0 text-sm text-muted-foreground">
                    {totalDocs} {totalDocs === 1 ? 'article' : 'articles'}
                </p>
            </header>
            <Separator />

            {/* Category filter */}
            {categories.length > 0 && (
                <nav className="flex flex-wrap gap-2 py-6" aria-label="Filter by category">
                    <Link href="/blog" aria-current={!category ? 'page' : undefined}>
                        <Badge variant={!category ? 'default' : 'outline'}>All</Badge>
                    </Link>
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}`}
                            aria-current={category === cat.slug ? 'page' : undefined}
                        >
                            <Badge variant={category === cat.slug ? 'default' : 'outline'}>
                                {cat.title}
                            </Badge>
                        </Link>
                    ))}
                </nav>
            )}
            {categories.length > 0 && <Separator />}

            {/* Post archive */}
            {posts.length === 0 ? (
                <p className="py-24 text-center text-sm text-muted-foreground">No posts found.</p>
            ) : (
                <div>
                    {/* Featured (most recent) post */}
                    <article className="grid gap-6 py-10 md:grid-cols-2 md:gap-10 md:py-12">
                        {featuredImage?.url && (
                            <Link
                                href={`/blog/${featured.slug}`}
                                className="group block aspect-4/3 overflow-hidden rounded-xl border border-border bg-card"
                                tabIndex={-1}
                                aria-hidden
                            >
                                <img
                                    src={featuredImage.url}
                                    alt={featuredImage.alt ?? featured.title}
                                    width={featuredImage.width ?? undefined}
                                    height={featuredImage.height ?? undefined}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </Link>
                        )}

                        <div className="flex flex-col justify-center">
                            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                Latest
                            </p>
                            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                <Link href={`/blog/${featured.slug}`} className="hover:underline">
                                    {featured.title}
                                </Link>
                            </h2>
                            {featured.excerpt && (
                                <p className="mt-3 max-w-prose text-muted-foreground">{featured.excerpt}</p>
                            )}
                            <div className="mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                                {featured.publishedAt && (
                                    <time dateTime={featured.publishedAt}>
                                        {formatLongDate(featured.publishedAt)}
                                    </time>
                                )}
                                {featured.readingTime && <span>{featured.readingTime} min read</span>}
                            </div>
                        </div>
                    </article>

                    <Separator />

                    {/* Remaining posts as list rows */}
                    <div className="divide-y divide-border">
                        {rest.map((post: any) => {
                            const rail = post.publishedAt ? formatShortDate(post.publishedAt) : null
                            const rowImage = getMedia(post.heroImage)
                            return (
                                <article
                                    key={post.id}
                                    className="-mx-3 flex items-center gap-4 rounded-lg px-3 py-5 transition-colors hover:bg-card sm:gap-6"
                                >
                                    <div className="hidden w-14 shrink-0 font-mono text-xs uppercase leading-tight text-muted-foreground sm:block">
                                        {rail && (
                                            <>
                                                <div>{rail.month}</div>
                                                <div className="text-lg font-semibold normal-case text-foreground">
                                                    {rail.day}
                                                </div>
                                                <div>{rail.year}</div>
                                            </>
                                        )}
                                    </div>

                                    {rowImage?.url && (
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="hidden aspect-4/3 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-card sm:block"
                                            tabIndex={-1}
                                            aria-hidden
                                        >
                                            <img
                                                src={rowImage.url}
                                                alt={rowImage.alt ?? post.title}
                                                width={rowImage.width ?? undefined}
                                                height={rowImage.height ?? undefined}
                                                className="h-full w-full object-cover"
                                            />
                                        </Link>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        {post.categories?.length > 0 && (
                                            <div className="mb-1 flex flex-wrap gap-2" aria-label="Categories">
                                                {post.categories.map((cat: any) => (
                                                    <Link
                                                        key={cat.id}
                                                        href={`/blog?category=${cat.slug}`}
                                                        className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                                                    >
                                                        {cat.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        <h2 className="truncate text-lg font-semibold tracking-tight">
                                            <Link href={`/blog/${post.slug}`} className="hover:underline">
                                                {post.title}
                                            </Link>
                                        </h2>
                                        {post.excerpt && (
                                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    {post.readingTime && (
                                        <span className="hidden shrink-0 font-mono text-xs text-muted-foreground md:block">
                                            {post.readingTime} min
                                        </span>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <>
                    <Separator />
                    <nav className="flex items-center justify-between pt-8" aria-label="Pagination">
                        {currentPage > 1 ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/blog?page=${currentPage - 1}${categorySuffix}`}>
                                    ← Previous
                                </Link>
                            </Button>
                        ) : (
                            <span />
                        )}
                        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        {currentPage < totalPages ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/blog?page=${currentPage + 1}${categorySuffix}`}>
                                    Next →
                                </Link>
                            </Button>
                        ) : (
                            <span />
                        )}
                    </nav>
                </>
            )}
        </main>
    )
}