import React, { useState } from 'react'
import style from './communities.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import ms1 from '@images/business/marketing-page/m_s1.webp'
import ms2 from '@images/business/marketing-page/m_s2.webp'
import ms3 from '@images/business/marketing-page/m_s3.webp'

export default function Communities() {
  const [isSelected, setIsSelected] = useState<string | null>('community')
  return (
    <section className={style.container}>
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.Communities.title} colorVariant={'black'} />
        <ParagraphComponent text={content.Communities.caption} sizeVariant={'medium'} colorVariant={'black'} />
        {/* <Button text={content.Communities.button} variant={'outline'} size={'small'} color={'black'} /> */}
      </div>

      <div className="flex justify-center">
        <div className="flex rounded-2xl bg-[#ECEAF2] p-2">
          <div
            className={`${isSelected === 'community' && 'bg-primary text-monochrome-white'} rounded-xl px-4 py-2`}
            onClick={() => {
              setIsSelected('community')
            }}>
            Community
          </div>
          <div
            className={`${isSelected === 'loop' && 'bg-primary text-monochrome-white'} rounded-xl px-4 py-2`}
            onClick={() => {
              setIsSelected('loop')
            }}>
            Loops
          </div>
          <div
            className={`${isSelected === 'post' && 'bg-primary text-monochrome-white'} rounded-xl px-4 py-2`}
            onClick={() => {
              setIsSelected('post')
            }}>
            Posts
          </div>
        </div>
      </div>
      <div className="my-12 flex justify-center">
        <img
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          src={isSelected === 'community' ? ms1.src : isSelected === 'loop' ? ms2.src : ms3.src}
          alt="genuin"
        />
      </div>
    </section>
  )
}
