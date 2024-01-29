'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Button from '../button'
import content from '../../../content/navbar.json'
import style from '../header/header.module.scss'
import blackLogo from '@icons/business/black-logo.svg'

interface HeaderProps {
  buttonName?: string
}

const Header: React.FC<HeaderProps> = ({ buttonName }) => {
  const router: any = usePathname()
  return (
    <nav className={style.navBar}>
      <div className={style.navContainer}>
        {/* Left section of the navigation bar */}
        <div className={style.navLeft}>
          {/* Brand logo */}
          <div className={style.navLogo}>
            <Link href="/">
              <Image priority loading="eager" src={blackLogo} alt="Genuin" />
            </Link>
          </div>

          {/* Navigation menu */}
          <div className={style.navMenu}>
            {content.map(({ url, title }, index) => {
              const activeClassName = router === url ? `${style.active}` : ''
              return (
                <Link key={index} href={url} className={activeClassName}>
                  {title}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right section of the navigation bar */}
        <div className={style.navRight}>
          {/* Get Started button */}
          <Button text={buttonName} variant={'solid'} />
        </div>
      </div>
    </nav>
  )
}

export default Header
