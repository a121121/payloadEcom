/**
 * generateJsonLd.ts
 *
 * Generates valid Schema.org JSON-LD structured data for blog posts.
 * Handles: Article, BlogPosting, TechArticle, HowTo, FAQPage, NewsArticle,
 *          CaseStudy (mapped to Article), BreadcrumbList, Person, Organization.
 *
 * Scope: top-level post schema only.
 * Blocks embedded in the rich-text content carry their own schema.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteConfig {
    /** Canonical site origin, e.g. "https://example.com" */
    siteUrl: string
    /** Organisation / publisher name */
    siteName: string
    /** URL to organisation logo (recommended 112×112 or larger) */
    logoUrl?: string
}

export interface MediaItem {
    url: string
    alt?: string
    width?: number
    height?: number
    mimeType?: string
}

export interface AuthorItem {
    name: string
    slug?: string
    role?: string
    bio?: unknown          // Lexical rich-text — not used in JSON-LD directly
    avatar?: MediaItem
    socialLinks?: Array<{ platform: string; url: string }>
    sameAs?: Array<{ url: string }>
}

export interface FaqItem {
    question: string
    answer: string
}

export interface HowToStep {
    name: string
    text: string
    image?: MediaItem
}

export interface BreadcrumbItem {
    name: string
    url: string
}

export type PostType =
    | 'article'
    | 'guide'
    | 'caseStudy'
    | 'changelog'
    | 'faq'
    | 'news'
    | 'techDeepDive'

export interface PostForJsonLd {
    title: string
    slug: string
    excerpt?: string
    postType: PostType
    publishedAt?: string | null
    updatedAt?: string
    updatedAtOverride?: string | null
    heroImage?: MediaItem | null
    authors?: AuthorItem[]
    categories?: Array<{ title: string; slug: string }>
    readingTime?: number | null
    seo?: {
        title?: string | null
        description?: string | null
        image?: MediaItem | null
        canonicalUrl?: string | null
        noIndex?: boolean
    }
    // Structured Data tab fields (top-level on the post document)
    faqItems?: FaqItem[]
    howToSteps?: HowToStep[]
    // Advanced tab fields
    sponsoredBy?: string | null
    // Type-specific group fields
    caseStudy?: {
        client?: string
        industry?: string
        challenge?: string
        solution?: string
        result?: string
    }
    changelog?: {
        version?: string
        changeType?: string[]
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveUrl(siteUrl: string, path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

function buildAuthorSchema(author: AuthorItem, siteUrl: string): Record<string, unknown> {
    const sameAs: string[] = [
        ...(author.socialLinks?.map((l) => l.url) ?? []),
        ...(author.sameAs?.map((s) => s.url) ?? []),
    ].filter(Boolean)

    const schema: Record<string, unknown> = {
        '@type': 'Person',
        name: author.name,
    }

    if (author.slug) {
        schema.url = resolveUrl(siteUrl, `/authors/${author.slug}`)
    }
    if (author.role) schema.jobTitle = author.role
    if (author.avatar?.url) {
        schema.image = {
            '@type': 'ImageObject',
            url: author.avatar.url,
            ...(author.avatar.width ? { width: author.avatar.width } : {}),
            ...(author.avatar.height ? { height: author.avatar.height } : {}),
        }
    }
    if (sameAs.length) schema.sameAs = sameAs

    return schema
}

function buildImageSchema(media: MediaItem): Record<string, unknown> {
    return {
        '@type': 'ImageObject',
        url: media.url,
        ...(media.alt ? { caption: media.alt } : {}),
        ...(media.width ? { width: media.width } : {}),
        ...(media.height ? { height: media.height } : {}),
    }
}

// Maps internal postType to Schema.org @type
function resolveSchemaType(
    postType: PostType,
): 'Article' | 'TechArticle' | 'HowTo' | 'FAQPage' | 'NewsArticle' {
    switch (postType) {
        case 'guide':
            return 'HowTo'
        case 'faq':
            return 'FAQPage'
        case 'news':
            return 'NewsArticle'
        case 'techDeepDive':
        case 'changelog':          // changelog maps to TechArticle (has softwareVersion)
            return 'TechArticle'
        case 'caseStudy':
        case 'article':
        default:
            return 'Article'
    }
}

// ─── Article-family schema ────────────────────────────────────────────────────

function buildArticleSchema(
    post: PostForJsonLd,
    siteConfig: SiteConfig,
): Record<string, unknown> {
    const { siteUrl, siteName, logoUrl } = siteConfig

    const canonicalUrl = post.seo?.canonicalUrl || resolveUrl(siteUrl, `/blog/${post.slug}`)
    const heroImage = post.seo?.image ?? post.heroImage

    const datePublished = post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined
    const dateModified = post.updatedAtOverride
        ? new Date(post.updatedAtOverride).toISOString()
        : post.updatedAt
            ? new Date(post.updatedAt).toISOString()
            : datePublished

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': resolveSchemaType(post.postType),
        headline: post.seo?.title || post.title,
        url: canonicalUrl,
    }

    if (post.excerpt || post.seo?.description) {
        schema.description = post.seo?.description || post.excerpt
    }
    if (datePublished) schema.datePublished = datePublished
    if (dateModified) schema.dateModified = dateModified
    if (heroImage?.url) schema.image = buildImageSchema(heroImage)

    // Authors
    if (post.authors?.length) {
        const authorSchemas = post.authors.map((a) => buildAuthorSchema(a, siteUrl))
        schema.author = authorSchemas.length === 1 ? authorSchemas[0] : authorSchemas
    }

    // Publisher
    const publisher: Record<string, unknown> = {
        '@type': 'Organization',
        name: siteName,
    }
    if (logoUrl) publisher.logo = { '@type': 'ImageObject', url: logoUrl }
    schema.publisher = publisher
    schema.mainEntityOfPage = { '@type': 'WebPage', '@id': canonicalUrl }

    // Reading time (ISO 8601 duration)
    if (post.readingTime) schema.timeRequired = `PT${post.readingTime}M`

    // Categories as keywords
    if (post.categories?.length) {
        schema.keywords = post.categories.map((c) => c.title).join(', ')
    }

    // Sponsored content
    if (post.sponsoredBy) {
        schema.sponsor = { '@type': 'Organization', name: post.sponsoredBy }
    }

    // Case Study extras
    if (post.postType === 'caseStudy' && post.caseStudy) {
        if (post.caseStudy.client) {
            schema.about = { '@type': 'Organization', name: post.caseStudy.client }
        }
        if (post.caseStudy.result) {
            schema.abstract = post.caseStudy.result
        }
    }

    // Changelog: softwareVersion on TechArticle
    if (post.postType === 'changelog' && post.changelog?.version) {
        schema.softwareVersion = post.changelog.version
    }

    return schema
}

// ─── HowTo schema ─────────────────────────────────────────────────────────────

function buildHowToSchema(
    post: PostForJsonLd,
    siteConfig: SiteConfig,
): Record<string, unknown> {
    // Build base then override — HowTo is not a subtype of Article
    const base = buildArticleSchema(post, siteConfig)
    // @type is already 'HowTo' from resolveSchemaType, but be explicit
    base['@type'] = 'HowTo'
    base.name = post.seo?.title || post.title

    if (post.howToSteps?.length) {
        base.step = post.howToSteps.map((step, idx) => {
            const stepSchema: Record<string, unknown> = {
                '@type': 'HowToStep',
                position: idx + 1,
                name: step.name,
                text: step.text,
            }
            if (step.image?.url) stepSchema.image = buildImageSchema(step.image)
            return stepSchema
        })
    }

    return base
}

// ─── FAQPage schema ───────────────────────────────────────────────────────────

function buildFaqSchema(
    post: PostForJsonLd,
    siteConfig: SiteConfig,
): Record<string, unknown> {
    const base = buildArticleSchema(post, siteConfig)
    base['@type'] = 'FAQPage'

    if (post.faqItems?.length) {
        base.mainEntity = post.faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        }))
    }

    return base
}

// ─── BreadcrumbList schema ────────────────────────────────────────────────────

function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface GenerateJsonLdOptions {
    post: PostForJsonLd
    siteConfig: SiteConfig
    /**
     * If provided, a BreadcrumbList schema is appended to the output array.
     * Typically: [Home, Blog, Post title]
     */
    breadcrumbs?: BreadcrumbItem[]
}

/**
 * Returns an array of JSON-LD objects — one per schema type.
 * Inject each as a separate <script type="application/ld+json"> tag.
 */
export function generateJsonLd({
    post,
    siteConfig,
    breadcrumbs,
}: GenerateJsonLdOptions): Record<string, unknown>[] {
    const schemas: Record<string, unknown>[] = []

    switch (post.postType) {
        case 'faq':
            schemas.push(buildFaqSchema(post, siteConfig))
            break
        case 'guide':
            schemas.push(buildHowToSchema(post, siteConfig))
            // Guides can also carry an FAQ block — emit a second FAQPage schema if present
            if (post.faqItems?.length) {
                schemas.push({
                    ...buildFaqSchema(post, siteConfig),
                    '@type': 'FAQPage',
                })
            }
            break
        default:
            schemas.push(buildArticleSchema(post, siteConfig))
            break
    }

    if (breadcrumbs?.length) {
        schemas.push(buildBreadcrumbSchema(breadcrumbs))
    }

    return schemas
}

/**
 * Convenience wrapper — returns a single @graph object (one <script> tag).
 */
export function generateJsonLdGraph(options: GenerateJsonLdOptions): Record<string, unknown> {
    const schemas = generateJsonLd(options)
    return {
        '@context': 'https://schema.org',
        '@graph': schemas.map(({ '@context': _ctx, ...rest }) => rest),
    }
}