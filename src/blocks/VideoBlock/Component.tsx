'use client'

import type { Media, VideoBlock as VideoBlockType } from '@/payload-types'
import Image from 'next/image'
import React, { useState } from 'react'
import { generateJsonLd } from './generateJsonLd'

type Props = {
    source?: 'youtube' | 'vimeo' | 'local'
    videoId?: string | null
    localVideo?: Media | string | null
    posterImage?: Media | string | null
    caption?: string | null
    title?: string | null
    description?: string | null
    uploadDate?: string | null          // new field
    autoplay?: boolean | null
    startTime?: number | null
    id?: string
    blockName?: string
    blockType?: string
    [key: string]: any                  // catch spread fields
}

function buildYouTubeUrl(videoId: string, autoplay: boolean, startTime?: number): string {
    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        ...(autoplay ? { autoplay: '1', mute: '1' } : {}),
        ...(startTime ? { start: String(startTime) } : {}),
    })
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`
}

function buildVimeoUrl(videoId: string, autoplay: boolean, startTime?: number): string {
    const params = new URLSearchParams({
        dnt: '1',
        ...(autoplay ? { autoplay: '1', muted: '1' } : {}),
        ...(startTime ? { t: `${startTime}s` } : {}),
    })
    return `https://player.vimeo.com/video/${videoId}?${params}`
}

const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-12 w-12 text-white drop-shadow-lg"
    >
        <path
            fillRule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clipRule="evenodd"
        />
    </svg>
)

export const VideoBlock: React.FC<Props> = (props) => {
    const {
        source = 'youtube',
        videoId,
        localVideo,
        posterImage,
        caption,
        title,
        autoplay = false,
        startTime,
    } = props

    const [activated, setActivated] = useState(autoplay)

    const poster = posterImage && typeof posterImage !== 'string'
        ? (posterImage as Media)
        : null

    // Reconstruct block object for JSON-LD generator
    const blockForJsonLd = {
        source,
        videoId: videoId ?? '',
        localVideo,
        posterImage,
        caption,
        title,
        description: props.description,
        uploadDate: props.uploadDate,          // pass through
        autoplay,
        startTime,
    } as VideoBlockType

    const jsonLd = generateJsonLd(blockForJsonLd)

    // ── Local / self-hosted ───────────────────────────────────────────────────
    if (source === 'local') {
        const vid = localVideo && typeof localVideo !== 'string'
            ? (localVideo as Media)
            : null
        if (!vid?.url) return null

        return (
            <>

                <figure className="my-8">
                    <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
                        <video
                            src={vid.url}
                            poster={poster?.url ?? undefined}
                            controls
                            autoPlay={autoplay === true ? true : undefined}
                            muted={autoplay === true ? true : undefined}
                            playsInline
                            className="h-auto w-full"
                            title={title || undefined}
                        />
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

    // ── YouTube / Vimeo ───────────────────────────────────────────────────────
    if (!videoId) return null

    const embedUrl =
        source === 'youtube'
            ? buildYouTubeUrl(videoId, autoplay ?? false, startTime ?? undefined)
            : buildVimeoUrl(videoId, autoplay ?? false, startTime ?? undefined)

    const ytThumbnail =
        source === 'youtube' && !poster
            ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
            : null

    return (
        <>
            <figure className="my-8">
                <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl">
                    <div className="aspect-video w-full">
                        {!activated ? (
                            <button
                                type="button"
                                className="group relative flex h-full w-full items-center justify-center"
                                onClick={() => setActivated(true)}
                                aria-label={`Play video${title ? `: ${title}` : ''}`}
                            >
                                {(poster || ytThumbnail) && (
                                    <Image
                                        src={poster?.url ?? ytThumbnail!}
                                        alt={title || 'Video thumbnail'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 800px"
                                    />
                                )}
                                <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
                                <span
                                    className="
                  relative z-10 flex h-20 w-20 items-center justify-center
                  rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/30
                  transition-all duration-200 group-hover:bg-white/20 group-hover:scale-110
                "
                                >
                                    <PlayIcon />
                                </span>
                                <span className="absolute bottom-3 right-3 z-10 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    {source === 'youtube' ? '▶ YouTube' : '○ Vimeo'}
                                </span>
                            </button>
                        ) : (
                            <iframe
                                src={embedUrl}
                                title={title || 'Embedded video'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                className="h-full w-full border-0"
                            />
                        )}
                    </div>
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

export default VideoBlock