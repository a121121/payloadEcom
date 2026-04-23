import type { ImageBlock as ImageBlockType, Media } from '@/payload-types'
import Image from 'next/image'
import React from 'react'
import { generateJsonLd } from './generateJsonLd'

type Props = {
    image?: Media | string | null
    caption?: string | null
    altOverride?: string | null
    size?: 'inline' | 'wide' | 'full'
    link?: string | null
    priority?: boolean | null
    id?: string
    blockName?: string
    blockType?: string
    [key: string]: any
}

const SIZE_CLASSES = {
    inline: 'max-w-prose mx-auto',
    wide: 'max-w-4xl mx-auto',
    full: 'w-full',
} as const

export const ImageBlock: React.FC<Props> = (props) => {
    const {
        image,
        caption,
        altOverride,
        size = 'inline',
        link,
        priority = false,
    } = props

    if (!image || typeof image === 'string') return null
    const media = image as Media

    const alt = altOverride || media.alt || ''
    const src = media.url!
    const width = media.width ?? 1200
    const height = media.height ?? 675

    const sizeClass = SIZE_CLASSES[size as keyof typeof SIZE_CLASSES] ?? SIZE_CLASSES.inline

    // Reconstruct block object for JSON-LD generator
    const blockForJsonLd = {
        image,
        caption,
        altOverride,
        size,
        link,
        priority,
    } as ImageBlockType

    // Site base URL from environment (must be set in your .env)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

    const jsonLd = generateJsonLd(blockForJsonLd, baseUrl)

    const imgEl = (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority || undefined}
            className={`block h-auto w-full rounded-xl object-cover ${size === 'full' ? 'rounded-none' : ''
                }`}
            sizes={
                size === 'full'
                    ? '100vw'
                    : size === 'wide'
                        ? '(max-width: 1024px) 100vw, 896px'
                        : '(max-width: 768px) 100vw, 65ch'
            }
        />
    )

    return (
        <>
            <figure className={`my-8 ${sizeClass}`}>
                <div
                    className={`overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg ${size === 'full' ? '' : 'rounded-xl'
                        }`}
                >
                    {link ? (
                        <a
                            href={link}
                            target={link.startsWith('http') ? '_blank' : undefined}
                            rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                            aria-label={alt || 'Image link'}
                            className="block"
                        >
                            {imgEl}
                        </a>
                    ) : (
                        imgEl
                    )}
                </div>
                {caption && (
                    <figcaption className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {caption}
                    </figcaption>
                )}
            </figure>

            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </>
    )
}

export default ImageBlock