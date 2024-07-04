import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { useShallow } from 'zustand/react/shallow'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import playStoreImage from '@images/playStore.svg'
import appStoreImage from '@images/appStore.svg'
import { axiosInstance } from '@/lib/api/instance'
import { useState } from 'react'
import { Loader } from '../ui/loader'
import Link from 'next/link'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@/lib/constants'

export function DownloadAppDialog() {
  const ksCbRequestStatus = useGenuinOptions().user?.ksCbRequestStatus
  if (!ksCbRequestStatus || ksCbRequestStatus !== 3) return

  const { brandLogo, brandName, isMobile, links } = useGenuinOptions(
    useShallow((state) => ({
      brandName: state.config?.name,
      brandLogo: state.config?.logo,
      isMobile: state.isMobile,
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
    }))
  )
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="my-2 border-primary px-6 py-2 font-semibold text-primary">
          Create a community
        </Button>
      </DialogTrigger>
      <DialogContent className="z-50 flex flex-col items-center gap-4 rounded-t-lg lg:min-w-max lg:max-w-lg lg:!px-14 lg:!py-10">
        <CustomAvatar
          imageUrl={brandLogo ?? ''}
          fallbackString={brandName ?? ''}
          isAvatar={false}
          className="h-16 w-16"
        />
        {!isMobile && (
          <p className="whitespace-pre-wrap break-all text-center" style={{ fontSize: 40 }}>
            Get the {brandName} app
          </p>
        )}
        <p className="text-center text-title-2-demi">
          Download the app to create a new <br />
          Community.
        </p>
        {isMobile ? (
          <div className="flex gap-4">
            <Link href={links.playStoreLink ?? URL_TO_PLAY_STORE}>
              <Image src={playStoreImage} alt="play store" />
            </Link>
            <Link href={links.appStoreLink ?? URL_TO_APP_STORE}>
              <Image src={appStoreImage} alt="app store" />
            </Link>
          </div>
        ) : (
          <SubmitButton />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton() {
  const { email } = useGenuinOptions(useShallow((state) => ({ email: state.user?.email })))
  const [status, setStatus] = useState<{ status: boolean; isLoading: boolean }>({
    status: false,
    isLoading: false,
  })

  if (status.status) {
    return <p className="text-body-1-demi">{`Email sent to ${email}`}</p>
  }

  return (
    <Button
      disabled={status.status || status.isLoading}
      className="w-full"
      onClick={async (e) => {
        setStatus((x) => {
          x.isLoading = true
          return { ...x }
        })
        const res = await sendMail(email ?? '')
        setStatus((x) => {
          x.isLoading = false
          x.status = res
          return { ...x }
        })
      }}>
      {status.isLoading ? <Loader size="sm" /> : 'Send Link'}
    </Button>
  )
}

async function sendMail(toMail: string) {
  return await axiosInstance
    .post('/api/v3/send_email', { email_type: 27, to_mail: [toMail] })
    .then((res) => {
      if (res.status === 200) {
        return true
      }
      return false
    })
    .catch((e) => {
      return false
    })
}
