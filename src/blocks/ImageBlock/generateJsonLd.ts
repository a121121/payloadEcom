/**
 * schema.org/ImageObject
 * https://schema.org/ImageObject
 */

import type { ImageBlock, Media } from '@/payload-types'

export function generateJsonLd(
    block: ImageBlock,
    baseUrl: string = ''
): Record<string, unknown> | null {
    if (!block.image || typeof block.image === 'string') return null

    const media = block.image as Media
    if (!media.url) return null

    // Make URL absolute if it's relative
    const absoluteUrl = (url: string) =>
        url.startsWith('http') ? url : `${baseUrl}${url}`

    const imageUrl = absoluteUrl(media.url)

    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: imageUrl,
        contentUrl: imageUrl,
        ...(media.width ? { width: media.width } : {}),
        ...(media.height ? { height: media.height } : {}),
        ...(block.caption ? { caption: block.caption } : {}),
        ...(block.altOverride || media.alt
            ? { description: block.altOverride || media.alt }
            : {}),
    }
}