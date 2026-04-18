'use client'

import { LogoIcon } from '@/components/icons/logo'
import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Header } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  menu: Header['navItems']
  /** Resolved logo URL from the media upload (optional) */
  logo?: string | null
  /** Text fallback if no logo image */
  logoText?: string | null
}

export function MobileMenu({ menu, logo, logoText }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4 flex flex-col">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle asChild>
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              {logo ? (
                <Image
                  src={logo}
                  alt={logoText || 'Store logo'}
                  width={100}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              ) : logoText ? (
                <span className="font-semibold text-lg">{logoText}</span>
              ) : (
                <LogoIcon className="w-5 h-auto" />
              )}
            </Link>
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>

        {/* Nav links */}
        <div className="py-4 flex-1">
          {menu?.length ? (
            <ul className="flex w-full flex-col">
              {menu.map((item) => (
                <li className="py-2 border-b border-muted last:border-0" key={item.id}>
                  <CMSLink {...item.link} appearance="link" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Account section */}
        {user ? (
          <div className="mt-auto pb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              My Account
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/orders" className="hover:underline">Orders</Link>
              </li>
              <li>
                <Link href="/account/addresses" className="hover:underline">Addresses</Link>
              </li>
              <li>
                <Link href="/account" className="hover:underline">Manage account</Link>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/logout">Log out</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-auto pb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              My Account
            </h2>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/create-account">Create an account</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}