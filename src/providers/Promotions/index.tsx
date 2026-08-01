/**
 * src/providers/PromotionsProvider.tsx
 *
 * Wraps your app. Fetches active UI promotions once on mount,
 * and exposes cart-level discount validation.
 *
 * Usage:
 *   // In your root layout
 *   <PromotionsProvider>
 *     {children}
 *   </PromotionsProvider>
 *
 *   // In any component
 *   const { discount, validateCart, applyingCoupon } = usePromotions()
 */

'use client'

import type { CartContext, DiscountResult } from '@/utilities/promotionEngine'
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PromotionBlock {
    blockType: 'promotionPopup' | 'promotionBanner' | 'promotionCountdown' | 'promotionBadge'
    [key: string]: any
}

interface ActivePromotion {
    id: string
    name: string
    label?: string
    type: string
    endDate?: string
    flash?: { durationMinutes: number; showCountdown: boolean }
    blocks?: PromotionBlock[]
}

interface PromotionsContextValue {
    // UI blocks
    banners: Array<PromotionBlock & { promotionId: string; endDate?: string }>
    popups: Array<PromotionBlock & { promotionId: string }>
    badges: Map<string, PromotionBlock>  // productId -> badge

    // Cart discounts
    discount: DiscountResult | null
    validateCart: (cart: CartContext) => Promise<void>
    clearDiscount: () => void

    // Coupon
    couponCode: string
    setCouponCode: (code: string) => void
    couponError: string | null
    validateCoupon: (code: string) => Promise<boolean>
    couponPromotion: { label: string; discountValue: number } | null

    // Flash sale session timer
    sessionStartTime: number

    isLoading: boolean
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PromotionsContext = createContext<PromotionsContextValue | null>(null)

export function usePromotions(): PromotionsContextValue {
    const ctx = useContext(PromotionsContext)
    if (!ctx) throw new Error('usePromotions must be used within <PromotionsProvider>')
    return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
    children: React.ReactNode
    apiUrl?: string  // defaults to empty string (same origin)
}

export function PromotionsProvider({ children, apiUrl = '' }: Props) {
    const [activePromotions, setActivePromotions] = useState<ActivePromotion[]>([])
    const [discount, setDiscount] = useState<DiscountResult | null>(null)
    const [couponCode, setCouponCode] = useState('')
    const [couponError, setCouponError] = useState<string | null>(null)
    const [couponPromotion, setCouponPromotion] = useState<{ label: string; discountValue: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const sessionStartTime = useRef(Date.now())

    // Fetch UI promotions once on mount
    useEffect(() => {
        fetch(`${apiUrl}/api/promotions/active-ui`)
            .then((r) => r.json())
            .then((data) => {
                if (data?.promotions) setActivePromotions(data.promotions)
            })
            .catch(console.error)
    }, [apiUrl])

    // Derive UI block lists from active promotions
    const banners = activePromotions.flatMap((p) =>
        (p.blocks ?? [])
            .filter((b) => b.blockType === 'promotionBanner')
            .map((b) => ({ ...b, promotionId: p.id, endDate: p.endDate })),
    )

    const popups = activePromotions.flatMap((p) =>
        (p.blocks ?? [])
            .filter((b) => b.blockType === 'promotionPopup')
            .map((b) => ({ ...b, promotionId: p.id })),
    )

    const badges = new Map<string, PromotionBlock>()
    activePromotions.forEach((p) => {
        const badge = p.blocks?.find((b) => b.blockType === 'promotionBadge')
        if (badge && p.type === 'specific_products') {
            // Populate badge for each product the promo applies to
            // (products resolved on server; frontend just consumes)
        }
    })

    // Cart validation
    const validateCart = useCallback(
        async (cart: CartContext) => {
            setIsLoading(true)
            try {
                const res = await fetch(`${apiUrl}/api/promotions/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cart: {
                            ...cart,
                            couponCode: couponCode || undefined,
                            sessionStartTime: sessionStartTime.current,
                        },
                    }),
                })
                const data = await res.json()
                setDiscount(data.discount ?? null)
            } catch (err) {
                console.error('[validateCart]', err)
            } finally {
                setIsLoading(false)
            }
        },
        [apiUrl, couponCode],
    )

    const clearDiscount = useCallback(() => {
        setDiscount(null)
        setCouponCode('')
        setCouponPromotion(null)
        setCouponError(null)
    }, [])

    const validateCoupon = useCallback(
        async (code: string): Promise<boolean> => {
            setCouponError(null)
            try {
                const res = await fetch(`${apiUrl}/api/promotions/apply-coupon`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                })
                const data = await res.json()
                if (data.valid) {
                    setCouponPromotion({ label: data.promotion.label, discountValue: data.promotion.discountValue })
                    setCouponCode(code)
                    return true
                } else {
                    setCouponError(data.error ?? 'Invalid coupon')
                    return false
                }
            } catch {
                setCouponError('Could not validate coupon')
                return false
            }
        },
        [apiUrl],
    )

    return (
        <PromotionsContext.Provider
            value={{
                banners,
                popups,
                badges,
                discount,
                validateCart,
                clearDiscount,
                couponCode,
                setCouponCode,
                couponError,
                validateCoupon,
                couponPromotion,
                sessionStartTime: sessionStartTime.current,
                isLoading,
            }}
        >
            {children}
        </PromotionsContext.Provider>
    )
}