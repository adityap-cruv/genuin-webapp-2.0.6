import { CommunityDiscussion01 } from '@/components/icons/community-1'
import { CommunityDiscussion02 } from '@/components/icons/community-2'
import { CommunityDiscussion03 } from '@/components/icons/community-3'
import { toTitleCase } from '@/utils'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules'
import 'swiper/swiper-bundle.css'
import { useBrandDetails } from '@/context/brand-details'

export function KsCbSlides() {
  const { brandDetails } = useBrandDetails()

  return (
    <Swiper
      pagination={{
        clickable: true,
      }}
      mousewheel={true}
      keyboard={true}
      modules={[Pagination, Mousewheel, Keyboard]}
      className='mySwiper h-fit w-full'>
      <SwiperSlide>
        <div className='flex flex-col items-center gap-2'>
          <CommunityDiscussion01 className='h-40 fill-primary' />
          <p className='text-center text-title-1-bold'>
            Become a Creator for {brandDetails?.name}
          </p>
          <p className='text-center text-body-1-med '>
            Join us in shaping the future of {brandDetails?.name} by making your
            own {brandDetails?.name} community and expanding it by sharing
            thought-provoking content.
          </p>
          <br />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='flex flex-col items-center gap-2'>
          <CommunityDiscussion02 className='h-40 fill-primary' />
          <p className='text-center text-title-1-bold'>
            Make Connections &{' '}
            {toTitleCase(brandDetails.reactions.title) +
              ' ' +
              brandDetails.reactions.suffix}{' '}
            Dialogues
          </p>
          <p className='text-center text-body-1-med'>
            Invite others to join your {brandDetails.name} community, share
            engaging content, and{' '}
            {brandDetails.reactions.title + ' ' + brandDetails.reactions.suffix}{' '}
            meaningful conversations to make connections and foster intellectual
            dialogue.
          </p>
          <br />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='flex flex-col items-center gap-2'>
          <CommunityDiscussion03 className='h-40 fill-primary' />
          <p className='text-center text-title-1-bold'>
            Moderate your Community
          </p>
          <p className='text-center text-body-1-med'>
            Create a safe space where your members can thrive. Customize your
            community with guidelines, add admins, and more.
          </p>
          <br />
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
