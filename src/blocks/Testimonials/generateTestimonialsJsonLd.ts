/**
 * generateTestimonialsJsonLd.ts
 *
 * Generates schema.org/Review JSON-LD structured data from a
 * TestimonialsBlock payload. Drop the output into a <script> tag
 * in your page <head> alongside your other structured data.
 *
 * Schema.org types used:
 *   - Review        https://schema.org/Review
 *   - Rating        https://schema.org/Rating
 *   - Person        https://schema.org/Person
 *   - Product       https://schema.org/Product  (for itemReviewed)
 *
 * Usage:
 *   import { generateTestimonialsJsonLd } from '@/blocks/Testimonials/generateTestimonialsJsonLd'
 *
 *   const jsonLd = generateTestimonialsJsonLd(block)
 *   // In your layout/page component:
 *   // <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
 */

import type { TestimonialsBlock } from '@/payload-types';

export function generateTestimonialsJsonLd(block: TestimonialsBlock): string {
    if (!block.testimonials?.length) return ''

    const reviews = block.testimonials.map((t) => {
        // ── itemReviewed ───────────────────────────────────────────────────────
        // Prefer the linked product relation; fall back to the manual name field.
        // We output a minimal Product object — your frontend can enrich this
        // if you fetch the full product document.
        const productName =
            typeof t.itemReviewed?.linkToProduct === 'object'
                ? (t.itemReviewed.linkToProduct as { title?: string; name?: string })?.title ??
                (t.itemReviewed.linkToProduct as { name?: string })?.name
                : t.itemReviewed?.itemName ?? undefined

        const itemReviewed = productName
            ? {
                '@type': 'Product',
                name: productName,
            }
            : undefined

        // ── author (Person) ────────────────────────────────────────────────────
        const authorImage =
            typeof t.reviewer?.personalImage === 'object' && t.reviewer.personalImage !== null
                ? (t.reviewer.personalImage as { url?: string }).url
                : undefined

        const author: Record<string, unknown> = {
            '@type': 'Person',
            name: t.reviewer?.name,
        }
        if (t.reviewer?.jobTitle) author.jobTitle = t.reviewer.jobTitle
        if (authorImage) author.image = authorImage
        if (t.reviewer?.location?.city || t.reviewer?.location?.country) {
            author.address = {
                '@type': 'PostalAddress',
                ...(t.reviewer.location.city ? { addressLocality: t.reviewer.location.city } : {}),
                ...(t.reviewer.location.country ? { addressCountry: t.reviewer.location.country } : {}),
            }
        }

        // ── reviewRating ───────────────────────────────────────────────────────
        const reviewRating: Record<string, unknown> = {
            '@type': 'Rating',
            ratingValue: t.rating,
            worstRating: 1,
            bestRating: 5,
        }

        // Add per-aspect ratings if present
        if (t.aspectRatings?.length) {
            // schema.org supports a single reviewAspect string on Rating.
            // For multiple aspects we output them as an array (valid in JSON-LD).
            reviewRating.reviewAspect = t.aspectRatings.map((a) => a.aspect).join(', ')
        }

        // ── Review image ───────────────────────────────────────────────────────
        const reviewImageUrl =
            t.reviewMedia?.mediaType === 'image' &&
                typeof t.reviewMedia.image === 'object' &&
                t.reviewMedia.image !== null
                ? (t.reviewMedia.image as { url?: string }).url
                : undefined

        // ── Assemble Review object ─────────────────────────────────────────────
        const review: Record<string, unknown> = {
            '@type': 'Review',
            name: t.title,                                   // schema.org: name (headline)
            reviewBody: t.description,                       // schema.org: reviewBody (required by Google)
            author,
            reviewRating,
        }

        if (t.reviewDate) review.datePublished = new Date(t.reviewDate).toISOString().split('T')[0]
        if (itemReviewed) review.itemReviewed = itemReviewed
        if (reviewImageUrl) review.image = reviewImageUrl

        return review
    })

    // If all testimonials share the same itemReviewed product, wrap in a
    // Product schema with an aggregateRating for maximum SEO impact.
    const uniqueProductNames = [
        ...new Set(
            reviews
                .map((r) => (r.itemReviewed as { name?: string } | undefined)?.name)
                .filter(Boolean),
        ),
    ]

    if (uniqueProductNames.length === 1 && reviews.length > 1) {
        const totalRating = block.testimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0)
        const avgRating = (totalRating / block.testimonials.length).toFixed(1)

        const output = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: uniqueProductNames[0],
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount: block.testimonials.length,
                worstRating: 1,
                bestRating: 5,
            },
            review: reviews,
        }

        return JSON.stringify(output, null, 2)
    }

    // Otherwise output an array of standalone Review objects
    const output = reviews.map((r) => ({ '@context': 'https://schema.org', ...r }))
    return JSON.stringify(output, null, 2)
}