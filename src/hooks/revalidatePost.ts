import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidatePost: CollectionAfterChangeHook = async ({
    doc,
    previousDoc,
    req: { payload },
}) => {
    if (doc._status === 'published') {
        const path = `/blog/${doc.slug}`
        payload.logger.info(`Revalidating post at path: ${path}`)
        revalidatePath(path)
        revalidatePath('/blog')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
        revalidatePath(`/blog/${doc.slug}`)
        revalidatePath('/blog')
    }

    return doc
}