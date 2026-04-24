/**
 * app/blog/[slug]/page.tsx
 *
 * Next.js 15 App Router page:
 *  - Fetches a post from Payload
 *  - Generates JSON-LD via generateJsonLd
 *  - Injects all schema types into <head>
 *  - Dynamic OG metadata
 */

import { RichText } from '@/components/RichText'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { generateJsonLd, type BreadcrumbItem, type PostForJsonLd } from '@/utilities/generateJsonLd'

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
    const ogImage =
        (post.seo?.image as any)?.url ||
        (post.heroImage as any)?.url

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

    // Shape the post data for generateJsonLd
    const postForJsonLd: PostForJsonLd = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
        postType: post.postType as PostForJsonLd['postType'],
        publishedAt: post.publishedAt ?? null,
        updatedAt: post.updatedAt,
        updatedAtOverride: (post.updatedAtOverride as string | null | undefined) ?? null,
        heroImage: post.heroImage
            ? {
                url: (post.heroImage as any).url,
                alt: (post.heroImage as any).alt,
                width: (post.heroImage as any).width,
                height: (post.heroImage as any).height,
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
            image: post.seo?.image ? { url: (post.seo.image as any).url } : null,
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

            {/*
                Your actual post UI goes here.
                Pass `post` to your RichText renderer, author bio, related posts, etc.
            */}
            <article>
                <h1>{post.title}</h1>
                {post.content && <RichText data={post.content} />}
            </article>
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