import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '../button'
import content from '../../../content/footer.json'
import style from '../footer/footer.module.scss'
import HeadingComponent from '../heading'
import ParagraphComponent from '../paragraph'
import whiteLogo from '@icons/business/white-logo.svg'

export default function Footer() {
  return (
    // Outer container for the footer section
    <footer className={style.footer}>
      {/* Container for organizing content */}
      <div className={style.container}>
        {/* Heading component for the footer title */}
        <HeadingComponent headingLevel={2} title={content.download.title} colorVariant={'white'} />

        {/* Row container for the footer content */}
        <div className={style.footerRow}>
          {/* Paragraph component for footer text */}
          <ParagraphComponent text={content.download.caption} sizeVariant={'medium'} colorVariant={'white'} />

          {/* Button component for the "Contact Us" button */}
          <Button text={content.download.button} variant={'solid'} size={'medium'} />
        </div>

        {/* Inner container for additional footer content */}
        <div className={style.innerContainer}>
          {/* Logo container for the footer brand logo */}
          <div className={style.logoContainer}>
            {/* Image component for displaying the white logo */}
            <Image priority loading="eager" src={whiteLogo} alt="genuin" />
            <ParagraphComponent text={'© 2023 Genuin Inc.'} sizeVariant={'medium'} colorVariant={'white'} />
          </div>

          {/* Footer menu container */}
          <div className={style.footerMenu}>
            {/* Container for the "Solutions" section */}
            <div className={style.footerMenuList}>
              {/* Paragraph component for the section title */}
              <ParagraphComponent text={'Solutions'} sizeVariant={'medium'} colorVariant={'white'} />
              {/* Map through the "solutions" array and create links */}
              {content?.solutions?.map(({ url, title }, index) => (
                <Link key={index} href={url}>
                  {title}
                </Link>
              ))}
            </div>

            {/* Container for the "Resources" section */}
            <div className={style.footerMenuList}>
              {/* Paragraph component for the section title */}
              <ParagraphComponent text={'Resources'} sizeVariant={'medium'} colorVariant={'white'} />
              {/* Map through the "resources" array and create links */}
              {content?.resources?.map(({ url, title }, index) => (
                <Link key={index} href={url}>
                  {title}
                </Link>
              ))}
            </div>

            {/* Container for the "Company" section */}
            <div className={style.footerMenuList}>
              {/* Paragraph component for the section title */}
              <ParagraphComponent text={'Company'} sizeVariant={'medium'} colorVariant={'white'} />
              {/* Map through the "company" array and create links */}
              {content?.company?.map(({ url, title }, index) => (
                <Link key={index} href={url}>
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
