'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const links = [
  {
    title: 'Nav.Overview',
    href: '/admin/overview',
  },
  {
    title: 'Nav.Products',
    href: '/admin/products',
  },
  {
    title: 'Nav.Categories',
    href: '/admin/categories',
  },
  {
    title: 'Nav.BrandsTags',
    href: '/admin/brands&tags',
  },
  {
    title: 'Nav.Orders',
    href: '/admin/orders',
  },
  {
    title: 'Nav.Users',
    href: '/admin/users',
  },
  {
    title: 'Nav.Carousel',
    href: '/admin/carousels',
  },
  {
    title: 'Nav.Pages',
    href: '/admin/web-pages',
  },
  {
    title: 'Nav.Settings',
    href: '/admin/settings',
  },
]

export function AdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const t = useTranslations('Admin')

  return (
    <nav
      className={cn(
        'flex items-center flex-wrap overflow-hidden gap-2 md:gap-4',
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            '',
            pathname.includes(item.href) ? '' : 'text-muted-foreground'
          )}
        >
          {t(item.title)}
        </Link>
      ))}
    </nav>
  )
}