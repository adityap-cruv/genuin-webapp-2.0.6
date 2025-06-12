import { useState, useCallback, useEffect } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ksCbRequest, useKsCbStatus } from '../api/auth'
import { useSession } from 'next-auth/react'
import { Loader } from '@components/ui/loader'
import Analytics from '@services/analytics'
import { KsCbSlides } from '../components/ks-cb-slides'
import { openModal } from '@/lib/utils'
import { getAppLink } from '@/lib/get-deeplink'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForksCbStatus } from '@/lib/utils/react-query/keys'

export function KsToCbSubdomain() {
  const { setStep } = useAuthenticationModalStore()
  const { data: sessionData, update: updateSession } = useSession()
  const { user, webCTA } = useGenuinOptions((state) => ({
    user: state.user,
    webCTA: state.webCTA,
  }))
  const [error, setError] = useState<string | null>(null)
  const { data: ksCbStatus, isLoading: isKsCbStatusLoading } = useKsCbStatus()
  const isRequested = ksCbStatus?.status === 2
  const queryClient = useQueryClient()

  useEffect(() => {
    if (ksCbStatus?.status && sessionData?.user) {
      void updateSession({
        ...sessionData,
        user: {
          ...sessionData.user,
          ksCbRequestStatus: ksCbStatus.status,
        },
      })
    }
  }, [ksCbStatus])

  const { mutate: requestKsCb, isLoading: isMutating } = useMutation({
    mutationFn: ksCbRequest,
    onSuccess: async (res) => {
      if (res.code === 200) {
        await updateSession({
          ...sessionData,
          user: {
            ...sessionData?.user,
            ksCbRequestStatus: res.data.ks_cb_request_status,
          },
        })
        void queryClient.invalidateQueries({ queryKey: getQueryKeyForksCbStatus() })
        void Analytics.track({
          eventName: 'Become Cb Request Clicked',
          properties: {},
        })
      } else {
        setError('Something went wrong.')
      }
    },
    onError: () => {
      setError('Something went wrong.')
    },
  })

  const handleClick = useCallback(() => {
    setError(null)

    if (!user) {
      if (webCTA === 'app') {
        void getAppLink().then((generatedLink) => {
          openModal({
            deepLink: generatedLink,
            subtitle: 'Download app to become a creator.',
          })
        })
      } else {
        setStep('STARTER', 'KS_CB_REQUEST')
      }
      return
    }

    requestKsCb()
  }, [user, webCTA, setStep, requestKsCb])

  return (
    <ModalShell className="sm:max-w-[384px]">
      <KsCbSlides />
      {ksCbStatus?.status !== 3 && (
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isMutating || isRequested || isKsCbStatusLoading}
          onClick={handleClick}>
          {isMutating || isKsCbStatusLoading ? (
            <Loader size="sm" className="stroke-monochrome-white" />
          ) : isRequested ? (
            'Requested'
          ) : (
            'Become a Creator'
          )}
        </Button>
      )}
      {error && <p className="text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
