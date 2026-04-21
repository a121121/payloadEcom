import type { Media, TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'
import type { Testimonial } from './types'

export function getImageUrl(img: Media | null | undefined | number): string | null {
    if (!img || typeof img === 'number') return null
    return img.url ?? null
}

export function resolveAvatar(
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

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}