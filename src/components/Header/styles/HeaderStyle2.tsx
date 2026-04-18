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
 * Style 2 — Left Logo + Right Nav (clean, minimal)
 * Logo far left → nav links in the middle/right → action icons far right
 */
export function HeaderStyle2({ header }: Props) {
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

            <nav className="container flex items-center h-14 gap-8">
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
                            width={110}
                            height={36}
                            className="h-7 w-auto object-contain"
                        />
                    ) : logoText ? (
                        <span className="font-bold text-base tracking-tight">{logoText}</span>
                    ) : (
                        <LogoIcon className="w-5 h-auto" />
                    )}
                </Link>

                {/* Nav — desktop */}
                {menu.length > 0 && (
                    <ul className="hidden md:flex items-center gap-6 text-sm flex-1">
                        {menu.map((item) => (
                            <li key={item.id}>
                                <CMSLink
                                    {...item.link}
                                    size="clear"
                                    appearance="nav"
                                    className={cn('navLink text-muted-foreground hover:text-foreground transition-colors', {
                                        'text-foreground font-medium':
                                            item.link.url && item.link.url !== '/'
                                                ? pathname.includes(item.link.url)
                                                : false,
                                    })}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                    {features?.showSearch && (
                        <button
                            aria-label="Search"
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                        >
                            <SearchIcon className="h-4 w-4" />
                        </button>
                    )}
                    {features?.showLogin && (
                        user ? (
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/account">Account</Link>
                            </Button>
                        ) : (
                            <Button asChild variant="ghost" size="sm">
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
            </nav>
        </div>
    )
}