'use client'

import type { Media, TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'
import React, { useEffect, useState } from 'react'
import { generateTestimonialsJsonLd } from './generateTestimonialsJsonLd'

// ─── Types ──────────────────────────────────────────────────────────────────

type Testimonial = NonNullable<TestimonialsBlockProps['testimonials']>[number]

type Props = TestimonialsBlockProps & {
    id?: string | number
    className?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getImageUrl(img: Media | null | undefined | number): string | null {
    if (!img || typeof img === 'number') return null
    return img.url ?? null
}

function resolveAvatar(
    testimonial: Testimonial,
    fallbackImages: TestimonialsBlockProps['fallbackImages'],
): string | null {
    const personal = getImageUrl(testimonial.reviewer?.personalImage as Media)
    if (personal) return personal

    const gender = testimonial.reviewer?.gender ?? 'neutral'
    if (gender === 'male') return getImageUrl(fallbackImages?.male as Media)
    if (gender === 'female') return getImageUrl(fallbackImages?.female as Media)
    return getImageUrl(fallbackImages?.neutral as Media)
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({
    rating,
    size = 'md',
}) => {
    const sz = size === 'sm' ? 14 : 18
    return (
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    width={sz}
                    height={sz}
                    viewBox="0 0 20 20"
                    fill={star <= rating ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className={star <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    )
}

const Avatar: React.FC<{ src: string | null; name: string; size?: 'sm' | 'md' | 'lg' }> = ({
    src,
    name,
    size = 'md',
}) => {
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <div
            className={`${sizeMap[size]} rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center font-semibold text-primary border border-border`}
        >
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    )
}

const ReviewerMeta: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
    const { reviewer } = testimonial
    const locationStr = [reviewer?.location?.city, reviewer?.location?.country]
        .filter(Boolean)
        .join(', ')
    const subtitle = [reviewer?.jobTitle, locationStr].filter(Boolean).join(' · ')

    return (
        <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm leading-tight">
                {reviewer?.name}
            </span>
            {subtitle && (
                <span className="text-muted-foreground text-xs mt-0.5 leading-snug">{subtitle}</span>
            )}
        </div>
    )
}

const TestimonialCard: React.FC<{
    testimonial: Testimonial
    avatarSrc: string | null
    variant?: 'default' | 'featured' | 'compact'
}> = ({ testimonial, avatarSrc, variant = 'default' }) => {
    const isFeatured = variant === 'featured'

    return (
        <article
            className={`
        group relative flex flex-col gap-4 rounded-xl border p-6 transition-all duration-300
        hover:shadow-lg hover:-translate-y-0.5
        ${isFeatured
                    ? 'bg-primary text-primary-foreground border-primary col-span-2 md:col-span-1'
                    : 'bg-card text-card-foreground border-border hover:border-primary/30'
                }
      `}
        >
            {/* Quote mark */}
            <svg
                aria-hidden="true"
                className={`absolute top-4 right-5 opacity-10 ${isFeatured ? 'text-primary-foreground' : 'text-primary'}`}
                width="48"
                height="36"
                viewBox="0 0 48 36"
                fill="currentColor"
            >
                <path d="M0 36V22.5C0 16.5 1.5 11.5 4.5 7.5S12 1.5 18 0l2.25 3C16.5 4 13.5 6 11.25 9S8.25 15 8.25 18H15V36H0zm27 0V22.5c0-6 1.5-11 4.5-15S39 1.5 45 0l2.25 3C43.5 4 40.5 6 38.25 9S35.25 15 35.25 18H42V36H27z" />
            </svg>

            <StarRating rating={testimonial.rating} size={isFeatured ? 'md' : 'sm'} />

            {testimonial.title && (
                <h3 className={`font-semibold text-base leading-snug ${isFeatured ? '' : 'text-foreground'}`}>
                    {testimonial.title}
                </h3>
            )}

            <p
                className={`text-sm leading-relaxed flex-1 ${isFeatured ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}
            >
                {testimonial.description}
            </p>

            <footer className="flex items-center gap-3 pt-2 border-t border-border/30">
                <Avatar
                    src={avatarSrc}
                    name={testimonial.reviewer?.name ?? '?'}
                    size={isFeatured ? 'lg' : 'md'}
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <ReviewerMeta testimonial={testimonial} />
                    {testimonial.reviewDate && (
                        <time
                            dateTime={testimonial.reviewDate}
                            className={`text-xs ${isFeatured ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}
                        >
                            {formatDate(testimonial.reviewDate)}
                        </time>
                    )}
                </div>
            </footer>
        </article>
    )
}

// ─── Grid Layout ──────────────────────────────────────────────────────────────

const GridLayout: React.FC<{
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}> = ({ testimonials, fallbackImages }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
            <TestimonialCard
                key={i}
                testimonial={t}
                avatarSrc={resolveAvatar(t, fallbackImages)}
            />
        ))}
    </div>
)

// ─── Masonry Layout ───────────────────────────────────────────────────────────

const MasonryLayout: React.FC<{
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}> = ({ testimonials, fallbackImages }) => {
    const cols = [
        testimonials.filter((_, i) => i % 3 === 0),
        testimonials.filter((_, i) => i % 3 === 1),
        testimonials.filter((_, i) => i % 3 === 2),
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {cols.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-6">
                    {col.map((t, i) => (
                        <TestimonialCard
                            key={i}
                            testimonial={t}
                            avatarSrc={resolveAvatar(t, fallbackImages)}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

// ─── Carousel Layout ──────────────────────────────────────────────────────────

const CarouselLayout: React.FC<{
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}> = ({ testimonials, fallbackImages }) => {
    const [active, setActive] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const total = testimonials.length

    const go = (next: number) => {
        if (isAnimating) return
        setIsAnimating(true)
        setActive((next + total) % total)
        setTimeout(() => setIsAnimating(false), 350)
    }

    useEffect(() => {
        const timer = setInterval(() => go(active + 1), 6000)
        return () => clearInterval(timer)
    }, [active])

    const t = testimonials[active]!

    return (
        <div className="relative max-w-3xl mx-auto">
            {/* Main card */}
            <div
                className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
                <article className="bg-card border border-border rounded-2xl p-8 md:p-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <StarRating rating={t.rating} />
                        {t.reviewDate && (
                            <time dateTime={t.reviewDate} className="text-xs text-muted-foreground">
                                {formatDate(t.reviewDate)}
                            </time>
                        )}
                    </div>

                    {t.title && (
                        <h3 className="text-xl font-semibold text-foreground">{t.title}</h3>
                    )}

                    <blockquote className="text-muted-foreground text-base leading-relaxed">
                        &ldquo;{t.description}&rdquo;
                    </blockquote>

                    <footer className="flex items-center gap-4 pt-4 border-t border-border">
                        <Avatar
                            src={resolveAvatar(t, fallbackImages)}
                            name={t.reviewer?.name ?? '?'}
                            size="lg"
                        />
                        <ReviewerMeta testimonial={t} />
                    </footer>
                </article>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
                <button
                    onClick={() => go(active - 1)}
                    aria-label="Previous testimonial"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="flex gap-1.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            aria-label={`Go to testimonial ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${i === active
                                ? 'w-6 h-2 bg-primary'
                                : 'w-2 h-2 bg-border hover:bg-muted-foreground'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => go(active + 1)}
                    aria-label="Next testimonial"
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

// ─── Featured Layout ──────────────────────────────────────────────────────────

const FeaturedLayout: React.FC<{
    testimonials: Testimonial[]
    fallbackImages: TestimonialsBlockProps['fallbackImages']
}> = ({ testimonials, fallbackImages }) => {
    const featured = testimonials.find((t) => t.isFeatured) ?? testimonials[0]!
    const rest = testimonials.filter((t) => t !== featured).slice(0, 4)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Featured — takes 3 columns */}
            <div className="lg:col-span-3">
                <TestimonialCard
                    testimonial={featured}
                    avatarSrc={resolveAvatar(featured, fallbackImages)}
                    variant="featured"
                />
            </div>

            {/* Side stack — 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {rest.map((t, i) => (
                    <TestimonialCard
                        key={i}
                        testimonial={t}
                        avatarSrc={resolveAvatar(t, fallbackImages)}
                        variant="compact"
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
    heading?: string | null
    subheading?: string | null
}> = ({ heading, subheading }) => {
    if (!heading && !subheading) return null
    return (
        <div className="text-center max-w-2xl mx-auto mb-12">
            {heading && (
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                    {heading}
                </h2>
            )}
            {subheading && (
                <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>
            )}
        </div>
    )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export const TestimonialsBlock: React.FC<Props> = ({
    id,
    className,
    blockHeading,
    blockSubheading,
    displayStyle = 'grid',
    fallbackImages,
    testimonials,
}) => {
    const items = testimonials ?? []
    if (items.length === 0) return null

    const jsonLd = generateTestimonialsJsonLd({ testimonials, fallbackImages, blockHeading, blockSubheading, displayStyle, blockType: 'testimonials', id: id ? String(id) : undefined } as TestimonialsBlockProps)

    return (
        <section
            id={id ? String(id) : undefined}
            className={`container ${className ?? ''}`}
        >
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd }}
                />
            )}
            <SectionHeader heading={blockHeading} subheading={blockSubheading} />

            {displayStyle === 'grid' && (
                <GridLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'masonry' && (
                <MasonryLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'carousel' && (
                <CarouselLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
            {displayStyle === 'featured' && (
                <FeaturedLayout testimonials={items} fallbackImages={fallbackImages} />
            )}
        </section>
    )
}