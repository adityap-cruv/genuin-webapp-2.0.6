'use client'

import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const EmbedNav = () => {
  const pathname = usePathname()
  const parts = pathname.split('/')
  const lastPart = parts.pop()

  const NAV_OPTIONS = [
    { label: 'Home', path: 'home' },
    { label: 'Search', path: 'search' },
    { label: 'PDP', path: 'pdp' },
    { label: 'Post Sales', path: 'post_sales' },
    { label: 'Blogs', path: 'blogs' },
  ]

  return (
    <nav className="hidden justify-center gap-6 py-6 md:flex">
      {NAV_OPTIONS.map(({ label, path }: { label: string; path: string }) => {
        const isActive = lastPart === path
        const linkClasses = isActive
          ? 'border-b-2 border-b-primary text-title-2-bold text-monochrome-black'
          : 'text-title-2-demi text-tertiary hover:scale-105 hover:text-monochrome-black'

        return (
          <Link
            href={PATH_NAME.embed(path)}
            key={path}
            aria-current={isActive ? 'page' : undefined}
            className={`${linkClasses} cursor-pointer transition-all`}>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default EmbedNav
