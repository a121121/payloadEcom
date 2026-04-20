import type { ArrayField, Block } from 'payload'

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials Block
//
// Schema.org alignment: schema.org/Review
//
// Required by schema.org/Review:
//   author          → reviewer.name                   ✅
//   reviewRating    → rating (1–5, worstRating=1,
//                             bestRating=5)            ✅
//   reviewBody      → description                     ✅
//   itemReviewed    → product (relation) or
//                     itemReviewedName (fallback)      ✅
//
// Recommended by schema.org/Review:
//   datePublished   → reviewDate                      ✅
//   name            → title (headline of the review)  ✅
//   image           → reviewer.personalImage          ✅
//
// NOTE: Google will NOT show rich stars for reviews of your own
// business/store — point itemReviewed at a Product or Service entity.
// ─────────────────────────────────────────────────────────────────────────────

export const Testimonials: Block = {
    slug: 'testimonials',
    // dbName shortens the Postgres table/enum prefix from
    // "pages_blocks_testimonials" → "pages_blocks_testi"
    // keeping all generated enum names under the 63-char limit.
    dbName: 'testi',
    interfaceName: 'TestimonialsBlock',
    labels: {
        singular: 'Testimonials',
        plural: 'Testimonials Blocks',
    },
    fields: [
        // ── Block-level settings ────────────────────────────────────────────────

        {
            name: 'blockHeading',
            type: 'text',
            label: 'Section Heading',
            admin: {
                description: 'Displayed above the testimonial grid/carousel, e.g. "What our customers say".',
            },
        },

        {
            name: 'blockSubheading',
            type: 'textarea',
            label: 'Section Subheading',
            admin: {
                description: 'Optional supporting copy beneath the heading.',
            },
        },

        // ── Display settings ────────────────────────────────────────────────────

        {
            name: 'displayStyle',
            type: 'select',
            label: 'Display Style',
            defaultValue: 'grid',
            dbName: 'display_style',
            options: [
                { label: 'Grid', value: 'grid' },
                { label: 'Carousel / Slider', value: 'carousel' },
                { label: 'Masonry', value: 'masonry' },
                { label: 'Single Featured', value: 'featured' },
            ],
            admin: {
                description: 'Controls how the frontend renders this block.',
            },
        },

        // ── Fallback stock images (used when reviewer has no personal photo) ─────

        {
            name: 'fallbackImages',
            type: 'group',
            label: 'Fallback Reviewer Images',
            admin: {
                description:
                    'Stock images used as avatars when a reviewer has no personal photo uploaded. Upload one for each gender option.',
            },
            fields: [
                {
                    name: 'male',
                    type: 'upload',
                    relationTo: 'media',
                    label: 'Male Fallback Avatar',
                },
                {
                    name: 'female',
                    type: 'upload',
                    relationTo: 'media',
                    label: 'Female Fallback Avatar',
                },
                {
                    name: 'neutral',
                    type: 'upload',
                    relationTo: 'media',
                    label: 'Neutral / Other Fallback Avatar',
                },
            ],
        },

        // ── Individual testimonial entries ──────────────────────────────────────

        ({
            name: 'testimonials',
            type: 'array',
            label: 'Testimonials',
            minRows: 1,
            maxRows: 20,
            admin: {
                description: 'Add individual testimonials. Each maps to a schema.org Review object.',
                rowLabel: 'Testimonial',
            },
            fields: [
                // ── schema.org: name (headline of the review) ──────────────────────
                {
                    name: 'title',
                    type: 'text',
                    label: 'Review Title / Headline',
                    required: true,
                    admin: {
                        description:
                            'Short headline for the review, e.g. "Best purchase I\'ve made all year". Maps to schema.org Review → name.',
                    },
                },

                // ── schema.org: reviewBody ─────────────────────────────────────────
                {
                    name: 'description',
                    type: 'textarea',
                    label: 'Review Body',
                    required: true,
                    admin: {
                        description:
                            'The full review text shown to visitors. Maps to schema.org Review → reviewBody. Google requires this field to be present.',
                    },
                },

                // ── schema.org: reviewRating → ratingValue ─────────────────────────
                {
                    name: 'rating',
                    type: 'number',
                    label: 'Star Rating',
                    required: true,
                    min: 1,
                    max: 5,
                    admin: {
                        description:
                            'Rating from 1 to 5. Maps to schema.org Rating → ratingValue (worstRating=1, bestRating=5).',
                        step: 1,
                    },
                },

                // ── schema.org: datePublished ──────────────────────────────────────
                {
                    name: 'reviewDate',
                    type: 'date',
                    label: 'Review Date',
                    admin: {
                        date: { pickerAppearance: 'dayOnly' },
                        description:
                            'When the review was written. Maps to schema.org Review → datePublished. Recommended for rich results.',
                    },
                },

                // ── Reviewer details group ─────────────────────────────────────────
                // Maps to schema.org Review → author (type: Person)
                {
                    name: 'reviewer',
                    type: 'group',
                    label: 'Reviewer',
                    fields: [
                        // schema.org: author → name
                        {
                            name: 'name',
                            type: 'text',
                            label: 'Full Name',
                            required: true,
                            admin: {
                                description: 'Reviewer\'s display name. Maps to schema.org Person → name.',
                            },
                        },

                        // Useful for personalisation & fallback avatar selection
                        {
                            name: 'gender',
                            type: 'select',
                            label: 'Gender',
                            dbName: 'gender',
                            options: [
                                { label: 'Male', value: 'male' },
                                { label: 'Female', value: 'female' },
                                { label: 'Other / Prefer not to say', value: 'neutral' },
                            ],
                            admin: {
                                description:
                                    'Used to select the correct fallback avatar if no personal image is uploaded. Not exposed publicly.',
                            },
                        },

                        // schema.org: author → jobTitle (adds credibility, e.g. "Verified Buyer")
                        {
                            name: 'jobTitle',
                            type: 'text',
                            label: 'Title / Role',
                            admin: {
                                description:
                                    'Optional display title, e.g. "Verified Buyer", "CEO at Acme", "Professional Chef". Maps to schema.org Person → jobTitle.',
                            },
                        },

                        // schema.org: author → address → addressLocality / addressCountry
                        {
                            name: 'location',
                            type: 'group',
                            label: 'Location',
                            admin: {
                                description: 'Displayed as social proof, e.g. "London, UK".',
                            },
                            fields: [
                                {
                                    name: 'city',
                                    type: 'text',
                                    label: 'City',
                                },
                                {
                                    name: 'country',
                                    type: 'text',
                                    label: 'Country',
                                },
                            ],
                        },

                        // schema.org: author → image
                        {
                            name: 'personalImage',
                            type: 'upload',
                            relationTo: 'media',
                            label: 'Personal Photo',
                            admin: {
                                description:
                                    'Reviewer\'s headshot or avatar. If left blank, the matching fallback image from the block settings will be used based on gender. Maps to schema.org Person → image.',
                            },
                        },
                    ],
                },

                // ── Review media ───────────────────────────────────────────────────
                // schema.org: Review → image (product/experience photo from the reviewer)
                {
                    name: 'reviewMedia',
                    type: 'group',
                    label: 'Review Media',
                    admin: {
                        description:
                            'Optional photo or video submitted alongside the review. Maps to schema.org Review → image.',
                    },
                    fields: [
                        {
                            name: 'mediaType',
                            type: 'select',
                            label: 'Media Type',
                            dbName: 'media_type',
                            options: [
                                { label: 'None', value: 'none' },
                                { label: 'Image', value: 'image' },
                                { label: 'Video', value: 'video' },
                            ],
                            defaultValue: 'none',
                        },
                        {
                            name: 'image',
                            type: 'upload',
                            relationTo: 'media',
                            label: 'Review Image',
                            admin: {
                                condition: (_, siblingData) => siblingData?.mediaType === 'image',
                                description: 'Photo uploaded with the review (e.g. product in use).',
                            },
                        },
                        {
                            name: 'video',
                            type: 'upload',
                            relationTo: 'media',
                            label: 'Review Video',
                            admin: {
                                condition: (_, siblingData) => siblingData?.mediaType === 'video',
                                description: 'Video testimonial uploaded with the review.',
                            },
                        },
                        {
                            name: 'videoUrl',
                            type: 'text',
                            label: 'Video URL (YouTube / Vimeo)',
                            admin: {
                                condition: (_, siblingData) => siblingData?.mediaType === 'video',
                                description: 'Alternative to uploading — paste a YouTube or Vimeo embed URL.',
                            },
                        },
                    ],
                },

                // ── schema.org: itemReviewed ───────────────────────────────────────
                // Linking a review to a product is the key to Product rich results
                {
                    name: 'itemReviewed',
                    type: 'group',
                    label: 'Item Reviewed',
                    admin: {
                        description:
                            'What this review is about. Required for Google Product rich results. Maps to schema.org Review → itemReviewed.',
                    },
                    fields: [
                        {
                            name: 'linkToProduct',
                            type: 'relationship',
                            relationTo: 'products', // ← change to your products collection slug
                            label: 'Link to Product',
                            admin: {
                                description:
                                    'Relate this review to a product in your catalogue. When set, the product name/URL are used in the JSON-LD output automatically.',
                            },
                        },
                        {
                            name: 'itemName',
                            type: 'text',
                            label: 'Item Name (manual fallback)',
                            admin: {
                                description:
                                    'Used only if no product relation is set above — e.g. "Spring/Summer Collection" or a service name. Maps to schema.org Thing → name.',
                            },
                        },
                    ],
                },

                // ── Relation to site user (optional) ──────────────────────────────
                {
                    name: 'linkedUser',
                    type: 'relationship',
                    relationTo: 'users', // ← your users collection slug
                    label: 'Linked User Account',
                    admin: {
                        description:
                            'Optionally link this testimonial to a registered user account. Not exposed publicly — useful for internal verification and de-duplication.',
                    },
                },

                // ── Verification & moderation ──────────────────────────────────────
                {
                    name: 'verificationStatus',
                    type: 'select',
                    label: 'Verification Status',
                    defaultValue: 'unverified',
                    dbName: 'verify_status',
                    options: [
                        { label: 'Unverified', value: 'unverified' },
                        { label: 'Verified Purchase', value: 'verified_purchase' },
                        { label: 'Verified Customer', value: 'verified_customer' },
                        { label: 'Editorial / Curated', value: 'editorial' },
                    ],
                    admin: {
                        description:
                            'Shown as a badge on the frontend ("Verified Buyer"). Also strengthens E-E-A-T signals for Google.',
                    },
                },

                // ── Source platform (where review originated) ─────────────────────
                {
                    name: 'sourcePlatform',
                    type: 'select',
                    label: 'Review Source',
                    defaultValue: 'direct',
                    dbName: 'src_platform',
                    options: [
                        { label: 'Direct / On-site', value: 'direct' },
                        { label: 'Google', value: 'google' },
                        { label: 'Trustpilot', value: 'trustpilot' },
                        { label: 'Amazon', value: 'amazon' },
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Other', value: 'other' },
                    ],
                    admin: {
                        description: 'Where the original review came from. Useful for frontend badges.',
                    },
                },

                // ── Feature / highlight flags ──────────────────────────────────────
                {
                    name: 'isFeatured',
                    type: 'checkbox',
                    label: 'Feature this testimonial',
                    defaultValue: false,
                    admin: {
                        description: 'Featured testimonials can be surfaced first or displayed more prominently.',
                    },
                },

                // ── Aspect ratings (optional sub-ratings) ─────────────────────────
                // schema.org: Rating → reviewAspect
                {
                    name: 'aspectRatings',
                    type: 'array',
                    label: 'Aspect Ratings',
                    maxRows: 6,
                    admin: {
                        description:
                            'Optional per-aspect scores (e.g. Quality: 5, Delivery: 4, Value: 3). Maps to schema.org Rating → reviewAspect.',
                    },
                    fields: [
                        {
                            name: 'aspect',
                            type: 'text',
                            label: 'Aspect',
                            required: true,
                            admin: { placeholder: 'e.g. Quality, Delivery, Value for Money' },
                        },
                        {
                            name: 'score',
                            type: 'number',
                            label: 'Score (1-5)',
                            required: true,
                            min: 1,
                            max: 5,
                            admin: { step: 1 },
                        },
                    ],
                },
            ],
        } as ArrayField),
    ],
}