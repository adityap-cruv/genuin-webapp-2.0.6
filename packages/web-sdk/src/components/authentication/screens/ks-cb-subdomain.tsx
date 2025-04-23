import { useCallback, useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@/components/ui/button'
import { fetchKsCbRequestStatus, ksCbRequest } from '../api/auth'
import { Loader } from '@/components/loader'
import { useAuth } from '@/context/auth'
import { KsCbSlides } from '../components/ks-cb-slides'
import { Analytics } from '@/analytics'
import { useAuthModalContext } from '@/components/authentication/context'

export function KsToCbSubdomain() {
  const { setStep } = useAuthModalContext()
  const { updateUser, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // To check if the user has already requested to become a creator.
  const isRequested = user?.ksCbRequestStatus === 2

  useEffect(() => {
    setLoading(true)
    // This func won't return any error so no need to handle it.
    void fetchKsCbRequestStatus().then(async (res) => {
      // Update the session data if the status is changed.
      if (res.status && user?.ksCbRequestStatus !== res.status) {
        updateUser({ ksCbRequestStatus: res.status })
      }
      setLoading(false)
    })
  }, [])

  const handleClick = useCallback(() => {
    setLoading(true)
    setError(null)
    Analytics.track(Analytics.EventNames.BecomeCbRequestClicked)
    if (!user) {
      setStep('STARTER', 'KS_CB_REQUEST')
      setLoading(false)
      return
    }

    ksCbRequest()
      .then(async (res) => {
        if (res.code === 200) {
          updateUser({ ksCbRequestStatus: res.data.ks_cb_request_status })
          setLoading(false)
        } else {
          setError('Something went wrong.')
          setLoading(false)
        }
      })
      .catch(() => {
        setError('Something went wrong.')
        setLoading(false)
      })
  }, [user, setStep, updateUser])

  return (
    <ModalShell>
      <KsCbSlides />
      {user?.ksCbRequestStatus !== 3 && (
        <Button
          type='submit'
          variant='default'
          className='w-full text-white'
          disabled={isRequested || loading}
          onClick={handleClick}>
          {loading ? (
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
