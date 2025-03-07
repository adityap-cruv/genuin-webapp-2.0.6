import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { fetchKsCbRequestStatus, ksCbRequest } from '../api/auth'
import { useSession } from 'next-auth/react'
import { Loader } from '@components/ui/loader'
import Analytics from '@services/analytics'
import { type User } from 'next-auth'
import { KsCbSlides } from '../components/ks-cb-slides'

// TODO: Modify this this component's api calls to accept Enum values instead of numbers. For readability and maintainability.
export function KsToCbSubdomain() {
  const { setStep } = useAuthenticationModalStore()
  const { data: sessionData, update: updateSession } = useSession()
  const { brandName, user } = useGenuinOptions((state) => ({
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    user: state.user,
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Check if the user has requested to become a cb.
  const isRequested = user?.ksCbRequestStatus === 2

  useEffect(() => {
    setLoading(true)
    // This func won't return any error so no need to handle it.
    void fetchKsCbRequestStatus().then(async (res) => {
      // Update the session data if the status is changed.
      if (res.status && sessionData?.user.ksCbRequestStatus !== res.status) {
        await updateSession({
          ...sessionData,
          user: { ...sessionData?.user, ksCbRequestStatus: res.status } as User,
        })
      }
      setLoading(false)
    })
  }, [])

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
        } else {
          setError('Something went wrong.')
        }
      })
      .catch((e) => {
        setError('Something went wrong.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <ModalShell className="sm:max-w-[384px]">
      <KsCbSlides />
      {user?.ksCbRequestStatus !== 3 && (
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={loading || isRequested}
          onClick={handleClick}>
          {loading ? (
            <Loader size="sm" className="stroke-monochrome-white" />
          ) : isRequested ? (
            'Requested'
          ) : (
            `Become a Creator for ${brandName}`
          )}
        </Button>
      )}
      {error && <p className="text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
