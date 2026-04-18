'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { LogoIcon } from '@/components/icons/logo'
import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/Auth'
import { cn } from '@/utilities/cn'
import { SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import type { Header } from 'src/payload-types'
import { MobileMenu } from '../MobileMenu'

interface Props {
    header: Header
}

/**
 * Style 1 — Centered Logo + Split Nav
 * Left half: nav links  |  Center: Logo  |  Right half: actions
 */
export function HeaderStyle1({ header }: Props) {
    const { user } = useAuth()
    const pathname = usePathname()
    const menu = header.navItems || []
    const features = header.features
    const logo = header.logo
    const logoText = header.logoText

    // Split nav in half for the centered-logo look
    const half = Math.ceil(menu.length / 2)
    const leftNav = menu.slice(0, half)
    const rightNav = menu.slice(half)

    const logoSrc =
        logo && typeof logo === 'object' && logo.url ? logo.url : null

    return (
        <div className="relative z-20 border-b bg-background">
            {/* ── Announcement Bar ── */}
            {header.announcement?.enabled && header.announcement.text && (
                <div className="bg-foreground text-background text-center text-xs py-2 px-4">
                    {header.announcement.link ? (
                        <a href={header.announcement.link} className="hover:underline">
                            {header.announcement.text}
                        </a>
                    ) : (
                        <span>{header.announcement.text}</span>
                    )}
                </div>
            )}

            <nav className="container flex items-center justify-between h-16 gap-4">
                {/* ── Mobile menu trigger ── */}
                <div className="block md:hidden flex-none">
                    <Suspense fallback={null}>
                        <MobileMenu menu={menu} logo={logoSrc} logoText={logoText} />
                    </Suspense>
                </div>

                {/* ── LEFT NAV (desktop) ── */}
                <ul className="hidden md:flex items-center gap-5 text-sm flex-1 justify-end">
                    {leftNav.map((item) => (
                        <li key={item.id}>
                            <CMSLink
                                {...item.link}
                                size="clear"
                                appearance="nav"
                                className={cn('navLink', {
                                    active:
                                        item.link.url && item.link.url !== '/'
                                            ? pathname.includes(item.link.url)
                                            : false,
                                })}
                            />
                        </li>
                    ))}
                </ul>

                {/* ── CENTER LOGO ── */}
                <Link
                    href="/"
                    className="flex items-center justify-center shrink-0 px-6"
                    aria-label="Home"
                >
                    {logoSrc ? (
                        <Image
                            src={logoSrc}
                            alt={logoText || 'Store logo'}
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    ) : logoText ? (
                        <span className="font-semibold text-lg tracking-tight">{logoText}</span>
                    ) : (
                        <LogoIcon className="w-6 h-auto" />
                    )}
                </Link>

                {/* ── RIGHT NAV + ACTIONS (desktop) ── */}
                <div className="hidden md:flex items-center gap-5 flex-1">
                    <ul className="flex items-center gap-5 text-sm">
                        {rightNav.map((item) => (
                            <li key={item.id}>
                                <CMSLink
                                    {...item.link}
                                    size="clear"
                                    appearance="nav"
                                    className={cn('navLink', {
                                        active:
                                            item.link.url && item.link.url !== '/'
                                                ? pathname.includes(item.link.url)
                                                : false,
                                    })}
                                />
                            </li>
                        ))}
                    </ul>

                    <div className="ml-auto flex items-center gap-3">
                        {features?.showSearch && (
                            <button aria-label="Search" className="hover:opacity-70 transition-opacity">
                                <SearchIcon className="h-5 w-5" />
                            </button>
                        )}
                        {features?.showLogin && (
                            user ? (
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/account">Account</Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/login">Log in</Link>
                                </Button>
                            )
                        )}
                        {features?.showCart && (
                            <Suspense fallback={<OpenCartButton />}>
                                <Cart />
                            </Suspense>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    )
}