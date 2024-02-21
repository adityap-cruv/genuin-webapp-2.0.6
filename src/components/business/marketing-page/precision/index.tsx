import React from 'react'
import m1 from '@images/business/marketing-page/m_01.webp'
import m2 from '@images/business/marketing-page/m_02.webp'
import m3 from '@images/business/marketing-page/m_03.webp'
import m4 from '@images/business/marketing-page/m_04.webp'
import m5 from '@images/business/marketing-page/m_05.webp'
import m6 from '@images/business/marketing-page/m_06.webp'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Button } from '@components/ui/button'

export default function Precision() {
  return (
    <>
      <div className="my-24 flex w-full">
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m1.src} alt="precision" />
        </div>
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Distribute Your Community Widely on the Open Web with Adreels</p>
          <p className="my-2 text-new-para-1">
            Publish your community through video ad networks using Genuin AdReels video feed syndication.
          </p>
          <Link href={{ pathname: PATH_NAME.adreels() }}>
            <Button variant={'outline'} size="custom" className="my-1 px-4 py-2">
              <p className="text-new-para-2">Explore Programmatic Power</p>
            </Button>
          </Link>{' '}
        </div>
      </div>

      <div className="my-24 flex w-full">
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Integrate Seamlessly with Email & SMS Marketing Programs</p>
          <p className="my-2 text-new-para-1">
            Attract new members efficiently via through email and SMS system integrations.
          </p>
        </div>
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m2.src} alt="precision" />
        </div>
      </div>

      <div className="my-24 flex w-full">
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m3.src} alt="precision" />
        </div>
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Gain New Community Marketing Assets Automatically</p>
          <p className="my-2 text-new-para-1">
            Platform automatically creates dynamic ads, link posts and social content based on community content.
          </p>
        </div>
      </div>

      <div className="my-24 flex w-full">
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Incorporate Community Building at Physical Events</p>
          <p className="my-2 text-new-para-1">QR Codes link directly to communities</p>
        </div>
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m4.src} alt="precision" />
        </div>
      </div>

      <div className="my-24 flex w-full">
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m5.src} alt="precision" />
        </div>
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Make your Community Visible in Web Search</p>
          <p className="my-2 text-new-para-1">SEO activity</p>
        </div>
      </div>

      <div className="my-24 flex w-full">
        <div className="flex w-1/2 flex-col justify-center">
          <p className="my-2 text-new-h2">Promote Your Community In Native Formats</p>
          <p className="my-2 text-new-para-1">
            Embed automatically created community advertising assets in a wide range of industry standard supported
            formats
          </p>
        </div>
        <div className="flex w-1/2 justify-center">
          <img loading="lazy" fetchPriority="low" className="w-10/12" decoding="async" src={m6.src} alt="precision" />
        </div>
      </div>
    </>
  )
}
