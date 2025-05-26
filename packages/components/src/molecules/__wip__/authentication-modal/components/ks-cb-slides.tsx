import { CommunityDiscussion03 } from '@icons/ks-cb-flow/community-03'
import { CommunityDiscussion01 } from '@icons/ks-cb-flow/community-01'
import { CommunityDiscussion02 } from '@icons/ks-cb-flow/community-02'
import 'swiper/swiper-bundle.css'
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { toTitleCase } from '@/lib/utils'

export function KsCbSlides() {
  const { brandName, reactionSuffix, reactionTitle } = useGenuinOptions(
    useShallow((state) => ({
      brandName: state.config?.name ? state.config?.name : 'Genuin',
      reactionTitle: state.config.reactions.title,
      reactionSuffix: state.config.reactions.suffix,
    }))
  )

  return (
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
          <p className="text-center text-title-1-bold">Become a Creator for {brandName}</p>
          <p className="text-center text-body-1-med ">
            Join us in shaping the future of {brandName} by making your own {brandName} community and expanding it by
            sharing thought-provoking content.
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
            {reactionTitle + ' ' + reactionSuffix} meaningful conversations to make connections and foster intellectual
            dialogue.
          </p>
          <br />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex flex-col items-center gap-2">
          <CommunityDiscussion03 className="h-40 fill-primary" />
          <p className="text-center text-title-1-bold">Moderate your Community</p>
          <p className="text-center text-body-1-med">
            Create a safe space where your members can thrive. Customize your community with guidelines, add admins, and
            more.
          </p>
          <br />
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
