import React, { useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Mousewheel, Keyboard } from 'swiper/modules'
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import { CommunityDiscussion03 } from '@icons/ks-cb-flow/community-03'
import { CommunityDiscussion01 } from '@icons/ks-cb-flow/community-01'
import { CommunityDiscussion02 } from '@icons/ks-cb-flow/community-02'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ksCbRequest } from '../api/auth'
import { useSession } from 'next-auth/react'
import { Loader } from '@components/ui/loader'
import Analytics from '@services/analytics'
import { type User } from 'next-auth'
import { toTitleCase } from '@/lib/utils'

SwiperCore.use([Pagination])
export function KsToCbSubdomain() {
  const { setStep } = useAuthenticationModalStore()
  const { data: sessionData, update: updateSession } = useSession()
  const { brandName, user, reactionSuffix, reactionTitle } = useGenuinOptions((state) => ({
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    user: state.user,
    reactionSuffix: state.config?.reactions?.suffix,
    reactionTitle: state.config?.reactions.title,
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setLoading(true)
    setError(null)

    if (!user) {
      setStep('STARTER', 'KS_CB_REQUEST')
      setLoading(false)
      return
    }

    ksCbRequest()
      .then(async (res) => {
        if (res.code === 200) {
          await updateSession({
            ...sessionData,
            user: { ...sessionData?.user, ksCbRequestStatus: res.data.ks_cb_request_status } as User,
          })
          void Analytics.track({
            eventName: 'Become Cb Request Clicked',
            properties: {},
          })
          setLoading(false)
        } else {
          setError('Something went wrong.')
          setLoading(false)
        }
      })
      .catch((e) => {
        setError('Something went wrong.')
        setLoading(false)
      })
  }
  return (
    <ModalShell className="sm:max-w-[384px]">
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
              Make Connections & {reactionTitle ? toTitleCase(reactionTitle) + ' ' + reactionSuffix : ''} Dialogues
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
              Create a safe space where your members can thrive. Customize your community with guidelines, add admins,
              and more.
            </p>
            <br />
          </div>
        </SwiperSlide>
      </Swiper>
      {user?.ksCbRequestStatus !== 3 && (
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={user?.ksCbRequestStatus === 2}
          onClick={handleClick}>
          {loading ? (
            <Loader size="sm" className="fill-new-off-white" />
          ) : user?.ksCbRequestStatus === 2 ? (
            'Requested'
          ) : (
            `Become a Creator for ${brandName}`
          )}
        </Button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </ModalShell>
  )
}
