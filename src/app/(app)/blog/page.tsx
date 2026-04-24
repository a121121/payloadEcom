/**
 * app/blog/page.tsx
 *
 * Blog listing page — /blog
 * Shows published posts, paginated, with category filtering.
 */

import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

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

    return (
        <main>
            <header>
                <h1>Blog</h1>
                <p>{totalDocs} posts</p>
            </header>

            {/* Category filter */}
            {categories.length > 0 && (
                <nav aria-label="Filter by category">
                    <Link href="/blog">All</Link>
                    {categories.map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}`}
                            aria-current={category === cat.slug ? 'page' : undefined}
                        >
                            {cat.title}
                        </Link>
                    ))}
                </nav>
            )}

            {/* Post grid */}
            {posts.length === 0 ? (
                <p>No posts found.</p>
            ) : (
                <ul>
                    {posts.map((post: any) => (
                        <li key={post.id}>
                            <article>
                                {post.heroImage?.url && (
                                    <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
                                        {/* Replace with your <Image> component */}
                                        <img
                                            src={post.heroImage.url}
                                            alt={post.heroImage.alt ?? post.title}
                                            width={post.heroImage.width}
                                            height={post.heroImage.height}
                                        />
                                    </Link>
                                )}

                                <div>
                                    {/* Categories */}
                                    {post.categories?.length > 0 && (
                                        <ul aria-label="Categories">
                                            {post.categories.map((cat: any) => (
                                                <li key={cat.id}>
                                                    <Link href={`/blog?category=${cat.slug}`}>
                                                        {cat.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <h2>
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h2>

                                    {post.excerpt && <p>{post.excerpt}</p>}

                                    <footer>
                                        {post.publishedAt && (
                                            <time dateTime={post.publishedAt}>
                                                {new Date(post.publishedAt).toLocaleDateString(
                                                    'en-US',
                                                    { year: 'numeric', month: 'long', day: 'numeric' },
                                                )}
                                            </time>
                                        )}
                                        {post.readingTime && (
                                            <span>{post.readingTime} min read</span>
                                        )}
                                    </footer>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav aria-label="Pagination">
                    {currentPage > 1 && (
                        <Link
                            href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
                        >
                            Previous
                        </Link>
                    )}
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                        <Link
                            href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
                        >
                            Next
                        </Link>
                    )}
                </nav>
            )}
        </main>
    )
}