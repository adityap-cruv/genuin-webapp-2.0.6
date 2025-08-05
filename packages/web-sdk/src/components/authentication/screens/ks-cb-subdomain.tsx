import { useCallback, useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@/components/ui/button'
import { fetchKsCbRequestStatus, ksCbRequest, useKsCbStatus } from '../api/auth'
import { Loader } from '@/components/loader'
import { useAuth } from '@/context/auth'
import { KsCbSlides } from '../components/ks-cb-slides'
import { Analytics } from '@/analytics'
import { useAuthModalContext } from '@/components/authentication/context'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForksCbStatus } from '@/utils/constants/keys'
import { getAppLink } from '@/components/download-app/get-deeplink'
import { useBaseContext } from '@/context/base'
import { useModalHandler } from '@/hooks/useModalHandler'

export function KsToCbSubdomain() {
  const { brandDetails } = useBaseContext()
  const { setStep } = useAuthModalContext()
  const { updateUser, user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const { data: ksCbStatus, isLoading: isKsCbStatusLoading } = useKsCbStatus()
  const queryClient = useQueryClient()
  const { openModal } = useModalHandler()
  // To check if the user has already requested to become a creator.
  const isRequested = user?.ksCbRequestStatus === 2

  useEffect(() => {
    if (ksCbStatus?.status && user?.ksCbRequestStatus !== ksCbStatus.status) {
      updateUser({ ksCbRequestStatus: ksCbStatus.status })
    }
  }, [ksCbStatus])

  const { mutate: requestKsCb } = useMutation({
    mutationFn: ksCbRequest,
    onSuccess: async (res) => {
      if (res.code === 200) {
        updateUser({ ksCbRequestStatus: res.data.ks_cb_request_status })
        void queryClient.invalidateQueries({
          queryKey: getQueryKeyForksCbStatus(),
        })
        Analytics.track(Analytics.EventNames.BecomeCbRequestClicked)
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
      if (brandDetails?.web_cta === 'app') {
        void getAppLink().then((generatedLink) => {
          openModal({
            deepLink: generatedLink,
            subtitle: 'Download app to browse more communities.',
          })
        })
      } else {
        setStep('STARTER', 'KS_CB_REQUEST')
      }
      return
    }

    requestKsCb()
  }, [user, brandDetails?.web_cta, setStep, requestKsCb])

  return (
    <ModalShell>
      <KsCbSlides />
      {user?.ksCbRequestStatus !== 3 && (
        <Button
          type='submit'
          variant='default'
          className='w-full text-white'
          disabled={isRequested || isKsCbStatusLoading}
          onClick={handleClick}>
          {isKsCbStatusLoading ? (
            <Loader className='fill-white' />
          ) : isRequested ? (
            'Requested'
          ) : (
            'Become a Creator'
          )}
        </Button>
      )}
      {error && <p className='text-red-500'>{error}</p>}
    </ModalShell>
  )
}
