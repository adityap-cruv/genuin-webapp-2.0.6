'use client'

import { AppLogo } from '@/components/ui/app-logo'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { FacebookIcon } from '@images/embed/social-icons/facebook-icon'
import { InstagramIcon } from '@images/embed/social-icons/instagram-icon'
import { LinkedInIcon } from '@images/embed/social-icons/linkedin-icon'
import { TwitterIcon } from '@images/embed/social-icons/twitter-icon'
import Link from 'next/link'
import React from 'react'

const FOOTER_OPTIONS = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms & Condition', path: '/terms-and-conditions' },
  { label: 'Cookie Notice', path: '/cookie-notice' },
  { label: 'Copyright Policy', path: '/copyright-policy' },
  { label: 'Data Policy', path: '/data-policy' },
]

const EmbedFooter = () => {
  return (
    <footer className="py-20">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Link draggable={false} href={PATH_NAME.home()}>
          <AppLogo.logo className="fill-new-off-black" imageHeight={44} />
        </Link>

        {/* Social Icons */}
        <div className="mt-4 flex gap-4">
          <TwitterIcon className="cursor-pointer fill-primary" />

          <FacebookIcon className="cursor-pointer fill-primary" />

          <InstagramIcon className="cursor-pointer fill-primary" />

          <LinkedInIcon className="cursor-pointer fill-primary" />
        </div>

        {/* Footer Options */}
        <nav className="flex flex-wrap justify-center gap-4 text-body-1-med">
          {FOOTER_OPTIONS.map(({ label, path }, index) => (
            <React.Fragment key={index}>
              <div className="transition-all hover:scale-105 hover:text-primary">{label}</div>
              {index < FOOTER_OPTIONS.length - 1 && <span>|</span>}
            </React.Fragment>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-body-1-med">© 2025 Genuin. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default EmbedFooter
