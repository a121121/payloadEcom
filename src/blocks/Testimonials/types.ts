import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

export type Testimonial = NonNullable<TestimonialsBlockProps['testimonials']>[number]

export type Props = TestimonialsBlockProps & {
    id?: string | number
    className?: string
}