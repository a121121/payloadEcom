'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { LogoIcon } from '@/components/icons/logo'
import { CMSLink } from '@/components/Link'
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
 * Style 3 — Two-row header
 * Row 1 (top bar): announcement + utility links (login, search)
 * Row 2 (main bar): logo left, nav center, cart right
 */
export function HeaderStyle3({ header }: Props) {
    const { user } = useAuth()
    const pathname = usePathname()
    const menu = header.navItems || []
    const features = header.features
    const logo = header.logo
    const logoText = header.logoText

    const logoSrc =
        logo && typeof logo === 'object' && logo.url ? logo.url : null

    return (
        <div className="relative z-20 border-b bg-background">
            {/* ── Top utility bar ── */}
            <div className="border-b bg-muted/40">
                <div className="container flex items-center justify-between h-9 text-xs text-muted-foreground">
                    {/* Announcement or empty left */}
                    <div>
                        {header.announcement?.enabled && header.announcement.text ? (
                            header.announcement.link ? (
                                <a href={header.announcement.link} className="hover:underline hover:text-foreground transition-colors">
                                    {header.announcement.text}
                                </a>
                            ) : (
                                <span>{header.announcement.text}</span>
                            )
                        ) : null}
                    </div>

                    {/* Right utility */}
                    <div className="flex items-center gap-4">
                        {features?.showSearch && (
                            <button
                                aria-label="Search"
                                className="hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <SearchIcon className="h-3 w-3" />
                                Search
                            </button>
                        )}
                        {features?.showLogin && (
                            user ? (
                                <Link href="/account" className="hover:text-foreground transition-colors">
                                    My Account
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="hover:text-foreground transition-colors">
                                        Log in
                                    </Link>
                                    <span>·</span>
                                    <Link href="/create-account" className="hover:text-foreground transition-colors">
                                        Register
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main header bar ── */}
            <nav className="container flex items-center justify-between h-16 gap-6">
                {/* Mobile trigger */}
                <div className="block md:hidden">
                    <Suspense fallback={null}>
                        <MobileMenu menu={menu} logo={logoSrc} logoText={logoText} />
                    </Suspense>
                </div>

                {/* Logo */}
                <Link href="/" aria-label="Home" className="shrink-0">
                    {logoSrc ? (
                        <Image
                            src={logoSrc}
                            alt={logoText || 'Store logo'}
                            width={130}
                            height={44}
                            className="h-9 w-auto object-contain"
                        />
                    ) : logoText ? (
                        <span className="font-bold text-xl tracking-tight">{logoText}</span>
                    ) : (
                        <LogoIcon className="w-6 h-auto" />
                    )}
                </Link>

                {/* Center nav — desktop */}
                {menu.length > 0 && (
                    <ul className="hidden md:flex items-center gap-8 text-sm absolute left-1/2 -translate-x-1/2">
                        {menu.map((item) => (
                            <li key={item.id}>
                                <CMSLink
                                    {...item.link}
                                    size="clear"
                                    appearance="nav"
                                    className={cn(
                                        'navLink relative pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full',
                                        {
                                            'after:w-full font-medium':
                                                item.link.url && item.link.url !== '/'
                                                    ? pathname.includes(item.link.url)
                                                    : false,
                                        },
                                    )}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {/* Cart */}
                <div className="ml-auto flex items-center gap-2">
                    {features?.showCart && (
                        <Suspense fallback={<OpenCartButton />}>
                            <Cart />
                        </Suspense>
                    )}
                </div>
            </nav>
        </div>
    )
}