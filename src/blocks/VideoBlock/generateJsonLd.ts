/**
 * schema.org/VideoObject
 * https://schema.org/VideoObject
 */

import type { Media, VideoBlock } from '@/payload-types'

export function generateJsonLd(block: VideoBlock): Record<string, unknown> | null {
    if (!block.title) return null

    const poster =
        block.posterImage && typeof block.posterImage !== 'string'
            ? (block.posterImage as Media)
            : null

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: block.title,
        ...(block.description ? { description: block.description } : {}),
        ...(poster?.url ? { thumbnailUrl: poster.url } : {}),
    }

    // Embed / content URL
    if (block.source === 'youtube' && block.videoId) {
        schema.embedUrl = `https://www.youtube.com/embed/${block.videoId}`
        schema.url = `https://www.youtube.com/watch?v=${block.videoId}`
    } else if (block.source === 'vimeo' && block.videoId) {
        schema.embedUrl = `https://player.vimeo.com/video/${block.videoId}`
        schema.url = `https://vimeo.com/${block.videoId}`
    } else if (block.source === 'local') {
        const vid =
            block.localVideo && typeof block.localVideo !== 'string'
                ? (block.localVideo as Media)
                : null
        if (vid?.url) {
            schema.contentUrl = vid.url
        }
    }

    // Upload date – required for rich results; Payload gives a full ISO timestamp,
    // we can optionally strip it to YYYY-MM-DD.
    if (block.uploadDate) {
        schema.uploadDate = block.uploadDate   // e.g., "2026-04-23T00:00:00.000Z"
    }

    return schema
}