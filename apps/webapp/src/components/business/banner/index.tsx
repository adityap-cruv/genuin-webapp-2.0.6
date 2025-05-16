'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import style from './banner.module.scss'
import HeadingComponent from '../heading'
import ParagraphComponent from '../paragraph'
import Button from '../button'
import Link from 'next/link'

interface ButtonData {
  text: string | undefined
  variant: 'solid' | 'outline'
  path: string | undefined
}

interface BannerProps {
  titleHtmlTag?: number
  bannerTitle?: string
  titleVariant: 'black' | 'white' // Adjust as needed
  bannerCaption?: string
  paraVariant?: 'small' | 'medium' // Adjust as needed
  buttonData?: ButtonData[]
  bannerImg?: any
  brandImages?: any
}

const MainBanner = ({
  titleHtmlTag,
  bannerTitle,
  titleVariant,
  bannerCaption,
  paraVariant,
  buttonData,
  bannerImg,
  brandImages,
}: BannerProps) => {
  // Render buttons based on buttonData
  const renderedButtons = buttonData?.map((button, index) => (
    <>
      <Link href={{ pathname: button.path }}>
        <Button key={index} text={button.text} variant={button.variant} />
      </Link>
    </>
  ))

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex: any) => (prevIndex + 1) % brandImages?.length)
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [brandImages])

  const handleThumbnailClick = (index: any) => {
    setCurrentIndex(index)
  }
  return (
    <div className={style.banner}>
      <div className={style.container}>
        <div className={style.containerRow}>
          {/* Left side of the banner */}
          <div className={style.bannerLeft}>
            {/* Heading Component */}
            <HeadingComponent headingLevel={titleHtmlTag} title={bannerTitle} colorVariant={titleVariant} />
            {/* Caption Component */}
            <ParagraphComponent text={bannerCaption} sizeVariant={paraVariant} />
            {/* Button Component */}
            <div className={style.bannerButton}>{renderedButtons}</div>
          </div>
          {/* Right side of the banner */}
          <div className={style.bannerRight}>
            {/* Image Component */}
            {brandImages ? (
              // <img
              //   loading="lazy"
              //   fetchPriority="low"
              //   decoding="async"
              //   height={500}
              //   src={brandImages[currentIndex].banner.src}
              // />
              <Image priority loading="eager" src={brandImages[currentIndex].banner} height={600} alt="genuin" />
            ) : (
              <Image priority loading="eager" src={bannerImg} alt="genuin" />
              // <img loading="lazy" fetchPriority="low" decoding="async" src={bannerImg.src} />
            )}
          </div>
        </div>
        <div className={style.containerBrand}>
          {/* Render brand images */}
          {brandImages?.map(
            ({ img }: any, index: any) =>
              img && (
                <div
                  className={`${style.imageContainer} ${index === currentIndex ? `${style.active}` : ''}`}
                  key={index}>
                  <Image
                    priority
                    loading="eager"
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => {
                      handleThumbnailClick(index)
                    }}
                  />
                </div>
              )
          )}
        </div>
      </div>
    </div>
  )
}

export default MainBanner
