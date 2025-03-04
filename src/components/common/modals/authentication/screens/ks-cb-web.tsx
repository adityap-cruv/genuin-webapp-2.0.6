import React from 'react'
import { ModalShell } from '../modal-shell'
import imageAppStore from '@icons/ks-cb-flow/app-store-tab.svg'
import imagePlayStore from '@icons/ks-cb-flow/play-store-tab.svg'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules'
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import Image from 'next/image'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { GenuinIcon } from '@icons/genuin-icon'
import { QRCode } from 'react-qrcode-logo'
import { CommunityDiscussion03 } from '@icons/ks-cb-flow/community-03'
import { CommunityDiscussion01 } from '@icons/ks-cb-flow/community-01'
import { CommunityDiscussion02 } from '@icons/ks-cb-flow/community-02'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { toTitleCase } from '@/lib/utils'

SwiperCore.use([Pagination])
export function KsToCbWeb() {
  const { brandName, reactionSuffix, reactionTitle } = useGenuinOptions((state) => ({
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    reactionSuffix: state.config.reactions.suffix,
    reactionTitle: state.config.reactions.title,
  }))
  const logoImageDataUrl =
    "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0C44.7783 0 0.222931 44.3332 0.000709297 99.5552C-0.165957 144.333 29.0562 182.333 69.5005 195.277C88.5004 201.333 109.334 192.777 117.834 174.722C120.5 169.055 122 162.722 122 155.999V154.111C122 152.388 120.278 151.166 118.667 151.777C112.5 153.999 105.834 155.166 98.8892 154.999C68.8893 154.388 44.7228 129.444 45.0005 99.4441C45.2783 69.3331 69.8338 44.9998 100 44.9998C130.389 44.9998 155 69.6109 155 99.9996V155.999C155 167.277 152.556 177.999 148.222 187.61C179.111 170.611 200 137.722 200 99.9996C200 44.7776 155.222 0 100 0Z' fill='%230645FF'/%3E%3C/svg%3E"

  return (
    <ModalShell className="max-w-[450px] sm:min-w-[450px]">
      <Swiper
        pagination={{
          clickable: true,
        }}
        mousewheel={true}
        keyboard={true}
        modules={[Pagination, Mousewheel, Keyboard]}
        className="mySwiper h-fit w-full">
        <SwiperSlide>
          <div className="flex flex-col items-center gap-2">
            <CommunityDiscussion01 className="h-40 fill-primary" />
            <p className="text-center text-title-1-bold">Create Your Communities with Genuin App - Forever Free!</p>
            <p className="text-center text-body-1-med ">
              Experience the power of community building with Genuin App, absolutely free forever. Start crafting and
              expanding your own communities today by sharing captivating content. Shape the future alongside us!
            </p>
            <br />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex flex-col items-center gap-2">
            <CommunityDiscussion02 className="h-40 fill-primary" />
            <p className="text-center text-title-1-bold">
              Make Connections & {toTitleCase(reactionTitle) + ' ' + reactionSuffix} Dialogues
            </p>
            <p className="text-center text-body-1-med">
              Invite others to join your {brandName} community, share engaging content, and{' '}
              {reactionTitle + ' ' + reactionSuffix} meaningful conversations to make connections and foster
              intellectual dialogue.
            </p>
            <br />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex flex-col items-center gap-2">
            <CommunityDiscussion03 className="h-40 fill-primary" />
            <p className="text-center text-title-1-bold">Moderate your Community</p>
            <p className="text-center text-body-1-med">
              Create a safe space where your members can thrive. Customize your community with guidelines, add
              moderators, and more.
            </p>
            <br />
          </div>
        </SwiperSlide>
      </Swiper>
      <div
        className="flex max-h-40 w-full items-center rounded-lg bg-[#F8F8F8] px-4 py-3"
        style={{
          background: 'linear-gradient(30deg, #E9CAF4 5%, #F8F8F8 50%, #ADDAFF 100%)',
        }}>
        <div className="flex w-[65%] flex-col gap-2">
          <p className="text-cap-1-bold">
            Ready to embark on <span className="font-semibold">your community</span> building journey?
          </p>
          <div className="flex items-center">
            <p className="text-cap-1-med">Download the</p>
            <div>
              <Link href={{ pathname: PATH_NAME.home() }}>
                <GenuinIcon.logo className="mr-2 h-4 w-16 fill-new-off-black" />
              </Link>
            </div>
            <p className="text-cap-1-med">app.</p>
          </div>
          <div className="flex gap-x-2">
            <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="h-6 w-auto" src={imageAppStore} alt="app store" />
            </a>
            <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="h-6 w-auto" src={imagePlayStore} alt="play store" />
            </a>
          </div>
        </div>
        <div className="flex w-[35%] flex-col items-center justify-center">
          <div className="h-1 w-[100px] rounded-t-md bg-monochrome-white "></div>
          <QRCode
            value="https://qabegenuin.page.link/a7Td"
            size={80}
            qrStyle="dots"
            logoImage={logoImageDataUrl}
            logoHeight={20}
            logoWidth={20}
            eyeRadius={10}
            logoOpacity={1}
            logoPaddingStyle="circle"
            removeQrCodeBehindLogo={true}
            style={{ borderRadius: '100px' }}
          />
          <div
            className="w-[100px] rounded-b-md bg-monochrome-white p-0.5 pt-0 text-center"
            style={{
              fontSize: '10px',
            }}>
            Scan to download
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
