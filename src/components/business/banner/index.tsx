'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import style from './banner.module.scss'
import HeadingComponent from '../heading'
import ParagraphComponent from '../paragraph'
import Button from '../button'

interface ButtonData {
  text: string | undefined
  variant: 'solid' | 'outline'
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

const MainBanner: React.FC<BannerProps> = ({
  titleHtmlTag,
  bannerTitle,
  titleVariant,
  bannerCaption,
  paraVariant,
  buttonData,
  bannerImg,
  brandImages,
}) => {
  // Render buttons based on buttonData
  const renderedButtons = buttonData?.map((button, index) => (
    <Button key={index} text={button.text} variant={button.variant} />
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
              <Image priority loading="eager" src={brandImages[currentIndex].banner} alt="genuin" />
            ) : (
              <Image priority loading="eager" src={bannerImg} alt="genuin" />
            )}
          </div>
        </div>
        <div className={style.containerBrand}>
          {/* Render brand images */}
          {brandImages?.map(({ img }: any, index: any) => (
            <div className={`${style.imageContainer} ${index === currentIndex ? `${style.active}` : ''}`} key={index}>
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default MainBanner
