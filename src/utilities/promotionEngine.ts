/**
 * promotionEngine.ts
 *
 * Pure calculation functions. No Payload imports — safe to use on both
 * the server (API routes) and client (cart calculations).
 *
 * Flow:
 *   1. Fetch active promotions from your API
 *   2. Call getEligiblePromotions() to filter to what applies to the cart
 *   3. Call applyBestPromotion() (or applyStackedPromotions() if stackable)
 *   4. Use the returned DiscountResult to render prices and update the order
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type PromotionType =
    | 'percentage'
    | 'fixed_amount'
    | 'bxgy'
    | 'flash'
    | 'coupon'
    | 'free_shipping'
    | 'bundle'

export interface CartItem {
    productId: string
    categoryIds: string[]
    quantity: number
    priceInUSD: number
    variantId?: string
}

export interface CartContext {
    items: CartItem[]
    subtotal: number
    customerId?: string
    isFirstTimeCustomer?: boolean
    isLoggedIn?: boolean
    sessionStartTime?: number   // unix ms — used for flash sale countdown
    couponCode?: string
}

export interface Promotion {
    id: string
    name: string
    label?: string
    type: PromotionType
    status: string
    priority: number
    stackable: boolean
    discountValue?: number
    maxDiscountAmount?: number
    startDate?: string
    endDate?: string
    minimumOrderAmount?: number
    minimumQuantity?: number
    appliesTo: 'all_products' | 'specific_products' | 'specific_categories'
    products?: Array<string | { id: string }>
    categories?: Array<string | { id: string }>
    customerEligibility: 'all' | 'first_time' | 'logged_in'
    bxgy?: {
        buyQuantity: number
        getQuantity: number
        getFreeProducts?: Array<string | { id: string }>
    }
    bundle?: {
        requiredProducts: Array<string | { id: string }>
        bundleDiscountValue: number
    }
    coupon?: {
        code: string
        usageLimit?: number
        usageLimitPerUser?: number
        usageCount?: number
    }
    flash?: {
        durationMinutes: number
        showCountdown: boolean
    }
}

export interface LineDiscount {
    productId: string
    originalPrice: number
    discountedPrice: number
    discountAmount: number
    isFree: boolean
}

export interface DiscountResult {
    promotionId: string
    promotionName: string
    promotionLabel?: string
    type: PromotionType
    discountAmount: number          // total $ off
    freeShipping: boolean
    lineDiscounts: LineDiscount[]   // per-product breakdown
    finalSubtotal: number
    couponApplied?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveId(ref: string | { id: string }): string {
    return typeof ref === 'string' ? ref : ref.id
}

function isPromotionActive(promo: Promotion): boolean {
    if (promo.status !== 'active') return false
    const now = Date.now()
    if (promo.startDate && new Date(promo.startDate).getTime() > now) return false
    if (promo.endDate && new Date(promo.endDate).getTime() < now) return false
    return true
}

function itemMatchesPromotion(item: CartItem, promo: Promotion): boolean {
    if (promo.appliesTo === 'all_products') return true
    if (promo.appliesTo === 'specific_products') {
        const ids = (promo.products ?? []).map(resolveId)
        return ids.includes(item.productId)
    }
    if (promo.appliesTo === 'specific_categories') {
        const ids = (promo.categories ?? []).map(resolveId)
        return item.categoryIds.some((c) => ids.includes(c))
    }
    return false
}

// ─── Eligibility filter ───────────────────────────────────────────────────────

export function getEligiblePromotions(
    promotions: Promotion[],
    cart: CartContext,
): Promotion[] {
    return promotions.filter((promo) => {
        if (!isPromotionActive(promo)) return false

        // Customer eligibility
        if (promo.customerEligibility === 'logged_in' && !cart.isLoggedIn) return false
        if (promo.customerEligibility === 'first_time' && !cart.isFirstTimeCustomer) return false

        // Minimum order
        if (promo.minimumOrderAmount && cart.subtotal < promo.minimumOrderAmount) return false

        // Minimum quantity
        const totalQty = cart.items.reduce((s, i) => s + i.quantity, 0)
        if (promo.minimumQuantity && totalQty < promo.minimumQuantity) return false

        // Coupon code must match
        if (promo.type === 'coupon') {
            if (!cart.couponCode) return false
            if (promo.coupon?.code !== cart.couponCode.toUpperCase().trim()) return false
            if (
                promo.coupon.usageLimit != null &&
                (promo.coupon.usageCount ?? 0) >= promo.coupon.usageLimit
            )
                return false
        }

        // Flash: check session timer
        if (promo.type === 'flash' && promo.flash) {
            if (!cart.sessionStartTime) return false
            const elapsed = (Date.now() - cart.sessionStartTime) / 1000 / 60 // minutes
            if (elapsed > promo.flash.durationMinutes) return false
        }

        // Bundle: all required products must be in cart
        if (promo.type === 'bundle' && promo.bundle) {
            const cartProductIds = new Set(cart.items.map((i) => i.productId))
            const required = promo.bundle.requiredProducts.map(resolveId)
            if (!required.every((id) => cartProductIds.has(id))) return false
        }

        return true
    })
}

// ─── Discount calculators ─────────────────────────────────────────────────────

function calcPercentage(cart: CartContext, promo: Promotion): DiscountResult {
    const pct = (promo.discountValue ?? 0) / 100
    const lineDiscounts: LineDiscount[] = []
    let totalDiscount = 0

    for (const item of cart.items) {
        if (!itemMatchesPromotion(item, promo)) continue
        const lineTotal = item.priceInUSD * item.quantity
        let disc = lineTotal * pct
        if (promo.maxDiscountAmount) disc = Math.min(disc, promo.maxDiscountAmount - totalDiscount)
        totalDiscount += disc
        lineDiscounts.push({
            productId: item.productId,
            originalPrice: item.priceInUSD,
            discountedPrice: item.priceInUSD - disc / item.quantity,
            discountAmount: disc,
            isFree: false,
        })
    }

    return {
        promotionId: promo.id,
        promotionName: promo.name,
        promotionLabel: promo.label,
        type: promo.type,
        discountAmount: totalDiscount,
        freeShipping: false,
        lineDiscounts,
        finalSubtotal: cart.subtotal - totalDiscount,
    }
}

function calcFixedAmount(cart: CartContext, promo: Promotion): DiscountResult {
    const discount = Math.min(promo.discountValue ?? 0, cart.subtotal)
    // Spread discount proportionally across eligible items
    const eligibleTotal = cart.items
        .filter((i) => itemMatchesPromotion(i, promo))
        .reduce((s, i) => s + i.priceInUSD * i.quantity, 0)

    const lineDiscounts: LineDiscount[] = cart.items
        .filter((i) => itemMatchesPromotion(i, promo))
        .map((item) => {
            const proportion = (item.priceInUSD * item.quantity) / eligibleTotal
            const lineDisc = discount * proportion
            return {
                productId: item.productId,
                originalPrice: item.priceInUSD,
                discountedPrice: item.priceInUSD - lineDisc / item.quantity,
                discountAmount: lineDisc,
                isFree: false,
            }
        })

    return {
        promotionId: promo.id,
        promotionName: promo.name,
        promotionLabel: promo.label,
        type: promo.type,
        discountAmount: discount,
        freeShipping: false,
        lineDiscounts,
        finalSubtotal: cart.subtotal - discount,
    }
}

function calcBxGy(cart: CartContext, promo: Promotion): DiscountResult {
    const { buyQuantity = 1, getQuantity = 1, getFreeProducts = [] } = promo.bxgy ?? {}
    const freeProductIds = getFreeProducts.map(resolveId)
    const lineDiscounts: LineDiscount[] = []
    let totalDiscount = 0

    // Determine which items are the "buy" items
    const buyItems = cart.items.filter((i) => itemMatchesPromotion(i, promo))
    const totalBuyQty = buyItems.reduce((s, i) => s + i.quantity, 0)
    const sets = Math.floor(totalBuyQty / buyQuantity)
    let freeRemaining = sets * getQuantity

    // If specific free products defined, give those; otherwise cheapest eligible item
    const candidates =
        freeProductIds.length > 0
            ? cart.items.filter((i) => freeProductIds.includes(i.productId))
            : [...buyItems].sort((a, b) => a.priceInUSD - b.priceInUSD)

    for (const item of candidates) {
        if (freeRemaining <= 0) break
        const freeQty = Math.min(item.quantity, freeRemaining)
        const lineDisc = item.priceInUSD * freeQty
        totalDiscount += lineDisc
        freeRemaining -= freeQty
        lineDiscounts.push({
            productId: item.productId,
            originalPrice: item.priceInUSD,
            discountedPrice: freeQty === item.quantity ? 0 : item.priceInUSD,
            discountAmount: lineDisc,
            isFree: true,
        })
    }

    return {
        promotionId: promo.id,
        promotionName: promo.name,
        promotionLabel: promo.label,
        type: promo.type,
        discountAmount: totalDiscount,
        freeShipping: false,
        lineDiscounts,
        finalSubtotal: cart.subtotal - totalDiscount,
    }
}

function calcBundle(cart: CartContext, promo: Promotion): DiscountResult {
    const pct = (promo.bundle?.bundleDiscountValue ?? 0) / 100
    const requiredIds = (promo.bundle?.requiredProducts ?? []).map(resolveId)
    const lineDiscounts: LineDiscount[] = []
    let totalDiscount = 0

    for (const item of cart.items) {
        if (!requiredIds.includes(item.productId)) continue
        const lineTotal = item.priceInUSD * item.quantity
        const disc = lineTotal * pct
        totalDiscount += disc
        lineDiscounts.push({
            productId: item.productId,
            originalPrice: item.priceInUSD,
            discountedPrice: item.priceInUSD * (1 - pct),
            discountAmount: disc,
            isFree: false,
        })
    }

    return {
        promotionId: promo.id,
        promotionName: promo.name,
        promotionLabel: promo.label,
        type: promo.type,
        discountAmount: totalDiscount,
        freeShipping: false,
        lineDiscounts,
        finalSubtotal: cart.subtotal - totalDiscount,
    }
}

function calcFreeShipping(_cart: CartContext, promo: Promotion): DiscountResult {
    return {
        promotionId: promo.id,
        promotionName: promo.name,
        promotionLabel: promo.label,
        type: 'free_shipping',
        discountAmount: 0,
        freeShipping: true,
        lineDiscounts: [],
        finalSubtotal: _cart.subtotal,
    }
}

// ─── Main API ─────────────────────────────────────────────────────────────────

export function calculateDiscount(cart: CartContext, promo: Promotion): DiscountResult {
    switch (promo.type) {
        case 'percentage':
        case 'flash':    // flash is just a time-gated percentage
        case 'coupon':   // coupon can be percentage or fixed — check discountValue
            // If discountValue looks like a fixed amount style, use fixed; else percentage
            return calcPercentage(cart, promo)
        case 'fixed_amount':
            return calcFixedAmount(cart, promo)
        case 'bxgy':
            return calcBxGy(cart, promo)
        case 'bundle':
            return calcBundle(cart, promo)
        case 'free_shipping':
            return calcFreeShipping(cart, promo)
        default:
            return {
                promotionId: promo.id,
                promotionName: promo.name,
                type: promo.type,
                discountAmount: 0,
                freeShipping: false,
                lineDiscounts: [],
                finalSubtotal: cart.subtotal,
            }
    }
}

/**
 * Apply the single best (highest discount) non-stackable promotion.
 * Stackable ones are combined on top.
 */
export function applyBestPromotion(
    cart: CartContext,
    eligible: Promotion[],
): DiscountResult | null {
    if (eligible.length === 0) return null

    const sorted = [...eligible].sort((a, b) => b.priority - a.priority)
    const stackable = sorted.filter((p) => p.stackable)
    const nonStackable = sorted.filter((p) => !p.stackable)

    // Pick best non-stackable by discount value
    let best: DiscountResult | null = null
    for (const promo of nonStackable) {
        const result = calculateDiscount(cart, promo)
        if (!best || result.discountAmount > best.discountAmount) {
            best = result
        }
    }

    // Layer stackable promotions on top
    if (stackable.length > 0) {
        const stackResults = stackable.map((p) => calculateDiscount(cart, p))
        const totalStackDiscount = stackResults.reduce((s, r) => s + r.discountAmount, 0)
        const hasFreeShipping = stackResults.some((r) => r.freeShipping)

        if (!best) {
            // Only stackable promotions
            return {
                promotionId: stackResults[0].promotionId,
                promotionName: stackResults.map((r) => r.promotionName).join(' + '),
                promotionLabel: stackResults.map((r) => r.promotionLabel).filter(Boolean).join(' + '),
                type: stackResults[0].type,
                discountAmount: totalStackDiscount,
                freeShipping: hasFreeShipping,
                lineDiscounts: stackResults.flatMap((r) => r.lineDiscounts),
                finalSubtotal: cart.subtotal - totalStackDiscount,
            }
        }

        return {
            ...best,
            discountAmount: best.discountAmount + totalStackDiscount,
            freeShipping: best.freeShipping || hasFreeShipping,
            finalSubtotal: best.finalSubtotal - totalStackDiscount,
        }
    }

    return best
}

/**
 * Get the effective discounted price for a single product.
 * Useful for product listing pages.
 */
export function getEffectivePrice(
    productId: string,
    originalPrice: number,
    promotions: Promotion[],
    cart: CartContext,
): { price: number; discountPercent: number; promotionLabel?: string } {
    const eligible = getEligiblePromotions(promotions, cart)
    const applicable = eligible.filter((p) =>
        p.appliesTo === 'all_products' ||
        (p.appliesTo === 'specific_products' &&
            (p.products ?? []).map(resolveId).includes(productId)),
    )

    if (applicable.length === 0) return { price: originalPrice, discountPercent: 0 }

    const best = applicable.sort((a, b) => b.priority - a.priority)[0]
    const fakeCart: CartContext = {
        ...cart,
        items: [{ productId, categoryIds: [], quantity: 1, priceInUSD: originalPrice }],
        subtotal: originalPrice,
    }

    const result = calculateDiscount(fakeCart, best)
    const discounted = result.lineDiscounts[0]?.discountedPrice ?? originalPrice
    const discountPercent = ((originalPrice - discounted) / originalPrice) * 100

    return {
        price: discounted,
        discountPercent: Math.round(discountPercent),
        promotionLabel: best.label,
    }
}