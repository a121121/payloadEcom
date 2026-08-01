/**
 * app/blog/[slug]/page.tsx
 *
 * Next.js 15 App Router page:
 *  - Fetches a post from Payload
 *  - Generates JSON-LD via generateJsonLd
 *  - Injects all schema types into <head>
 *  - Dynamic OG metadata
 *
 * Styled with Tailwind utilities against the existing design tokens in
 * globals.css, shadcn primitives (Breadcrumb, Badge, Avatar, Separator),
 * and the @tailwindcss/typography plugin (already imported in
 * globals.css) for the article body via the `prose` class.
 */

import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'
import { generateJsonLd, type BreadcrumbItem, type PostForJsonLd } from '@/utilities/generateJsonLd'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Breadcrumb,
    BreadcrumbItem as BreadcrumbItemUI,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SITE_CONFIG = {
    siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://example.com',
    siteName: 'Your Site Name',
    logoUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/logo.png`,
}

async function getPost(slug: string) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
        collection: 'posts',
        where: {
            slug: { equals: slug },
            status: { equals: 'published' },
        },
        depth: 2, // populate media, authors, categories
        limit: 1,
    })
    return result.docs[0] ?? null
}

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

function getInitials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) return {}

    const title = post.seo?.title || post.title
    const description = post.seo?.description || post.excerpt || ''
    const ogImage = getMedia(post.seo?.image)?.url || getMedia(post.heroImage)?.url

    return {
        title,
        description,
        robots: post.seo?.noIndex ? 'noindex, nofollow' : 'index, follow',
        alternates: {
            canonical: post.seo?.canonicalUrl || `${SITE_CONFIG.siteUrl}/blog/${post.slug}`,
        },
        openGraph: {
            title,
            description,
            url: `${SITE_CONFIG.siteUrl}/blog/${post.slug}`,
            type: 'article',
            publishedTime: post.publishedAt ?? undefined,
            modifiedTime: (post.updatedAtOverride || post.updatedAt) ?? undefined,
            authors: (post.authors as any[])?.map((a) =>
                a.slug ? `${SITE_CONFIG.siteUrl}/authors/${a.slug}` : a.name,
            ),
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
    }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) notFound()

    // Build breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: SITE_CONFIG.siteUrl },
        { name: 'Blog', url: `${SITE_CONFIG.siteUrl}/blog` },
        {
            name: (post.breadcrumbTitle as string | undefined) || post.title,
            url: `${SITE_CONFIG.siteUrl}/blog/${post.slug}`,
        },
    ]

    const heroImage = getMedia(post.heroImage)
    const seoImage = getMedia(post.seo?.image)

    // Shape the post data for generateJsonLd
    const postForJsonLd: PostForJsonLd = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
        postType: post.postType as PostForJsonLd['postType'],
        publishedAt: post.publishedAt ?? null,
        updatedAt: post.updatedAt,
        updatedAtOverride: (post.updatedAtOverride as string | null | undefined) ?? null,
        heroImage: heroImage?.url
            ? {
                url: heroImage.url,
                alt: heroImage.alt,
                width: heroImage.width ?? undefined,
                height: heroImage.height ?? undefined,
            }
            : null,
        authors: (post.authors as any[])?.map((a) => ({
            name: a.name,
            slug: a.slug,
            role: a.role,
            avatar: a.avatar ? { url: a.avatar.url, alt: a.avatar.alt } : undefined,
            socialLinks: a.socialLinks,
            sameAs: a.sameAs,
        })),
        categories: (post.categories as any[])?.map((c) => ({
            title: c.title,
            slug: c.slug,
        })),
        readingTime: post.readingTime ?? null,
        seo: {
            title: post.seo?.title ?? null,
            description: post.seo?.description ?? null,
            image: seoImage?.url ? { url: seoImage.url } : null,
            canonicalUrl: post.seo?.canonicalUrl ?? null,
            noIndex: post.seo?.noIndex ?? false,
        },
        // Structured Data tab — top-level fields on the document
        faqItems: (post as any).faqItems,
        howToSteps: (post as any).howToSteps?.map((s: any) => ({
            name: s.name,
            text: s.text,
            image: s.image ? { url: s.image.url } : undefined,
        })),
        // Advanced tab
        sponsoredBy: (post as any).sponsoredBy ?? null,
        // Type-specific groups
        caseStudy: (post as any).caseStudy,
        changelog: (post as any).changelog,
    }

    // Generate all JSON-LD schemas
    const jsonLdSchemas = generateJsonLd({
        post: postForJsonLd,
        siteConfig: SITE_CONFIG,
        breadcrumbs,
    })

    const authors = (post.authors as any[]) ?? []
    const categories = (post.categories as any[]) ?? []

    return (
        <>
            {/* Inject JSON-LD — one <script> per schema object */}
            {jsonLdSchemas.map((schema, idx) => (
                <script
                    key={idx}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <main className="container py-10 md:py-14">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItemUI>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItemUI>
                        <BreadcrumbSeparator />
                        <BreadcrumbItemUI>
                            <BreadcrumbLink asChild>
                                <Link href="/blog">Blog</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItemUI>
                        {categories[0] && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItemUI>
                                    <BreadcrumbPage>{categories[0].title}</BreadcrumbPage>
                                </BreadcrumbItemUI>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <header className="mx-auto mt-6 max-w-3xl">
                    {categories.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <Link key={cat.id} href={`/blog?category=${cat.slug}`}>
                                    <Badge variant="secondary">{cat.title}</Badge>
                                </Link>
                            ))}
                        </div>
                    )}

                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{post.title}</h1>

                    {post.excerpt && (
                        <p className="mt-4 max-w-prose text-lg italic text-muted-foreground">
                            {post.excerpt}
                        </p>
                    )}

                    <Separator className="mt-6" />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm text-muted-foreground">
                        {authors[0] && (
                            <span className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage
                                        src={authors[0].avatar?.url}
                                        alt={authors[0].avatar?.alt ?? authors[0].name}
                                    />
                                    <AvatarFallback>{getInitials(authors[0].name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-foreground">{authors[0].name}</span>
                            </span>
                        )}
                        {post.publishedAt && (
                            <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
                        )}
                        {post.readingTime && <span>{post.readingTime} min read</span>}
                    </div>
                </header>

                {/* Hero image */}
                {heroImage?.url && (
                    <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-border bg-card">
                        <img
                            src={heroImage.url}
                            alt={heroImage.alt ?? post.title}
                            width={heroImage.width ?? undefined}
                            height={heroImage.height ?? undefined}
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                )}

                {/* Article body */}
                <article className="prose prose-neutral dark:prose-invert mx-auto mt-10 max-w-3xl">
                    {post.content && <RichText data={post.content} />}
                </article>

                {/* Tags */}
                {categories.length > 0 && (
                    <footer className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center gap-2 border-t border-border pt-6">
                        <span className="mr-1 text-sm text-muted-foreground">Filed under</span>
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/blog?category=${cat.slug}`}>
                                <Badge variant="outline">{cat.title}</Badge>
                            </Link>
                        ))}
                    </footer>
                )}
            </main>
        </>
    )
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        select: { slug: true },
        limit: 1000,
        pagination: false,
    })
    return posts.docs.map((p: any) => ({ slug: p.slug }))
}