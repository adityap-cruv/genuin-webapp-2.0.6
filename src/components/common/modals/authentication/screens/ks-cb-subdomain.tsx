import React from 'react'
import { ModalShell } from '../modal-shell'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import { CommunityDiscussion03 } from '@icons/ks-cb-flow/community-03'
import { CommunityDiscussion01 } from '@icons/ks-cb-flow/community-01'
import { CommunityDiscussion02 } from '@icons/ks-cb-flow/community-02'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { useGenuinOptions } from '@lib/stores/genuin-options'

SwiperCore.use([Pagination])
export function KsToCbSubdomain() {
  const { setStep } = useAuthenticationModalStore()
  const { brandName, user } = useGenuinOptions((state) => ({
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    user: state.user,
  }))
  return (
    <ModalShell>
      <Swiper
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper h-fit w-full">
        <SwiperSlide>
          <div className="flex flex-col items-center gap-2">
            <CommunityDiscussion01 className="h-40 fill-primary" />
            <p className="text-center text-title-1-bold">Become a community builder for {brandName}</p>
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
            <p className="text-center text-title-1-bold">Make Connections & Spark Dialogues</p>
            <p className="text-center text-body-1-med">
              Invite others to join your {brandName} community, share engaging content, and spark meaningful
              conversations to make connections and foster intellectual dialogue.
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
      {user?.ks_cb_request_status !== 3 && (
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={user?.ks_cb_request_status === 2}
          onClick={() => {
            user ? setStep('VERIFY_MAIL') : setStep('EMAIL_INPUT')
          }}>
          {user?.isEmailVerified ? 'Requested' : `Become a community builder for ${brandName}`}
        </Button>
      )}
    </ModalShell>
  )
}
