import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
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
import { AddIcon } from '@icons/add-icon'
import { cn } from '@/lib/utils'
import { QRCode } from 'react-qrcode-logo'
import { AppleIcon } from '@icons/apple-icon'
import { PlayStoreIcon } from '@icons/playstore-icon'

export function DownloadAppDialog() {
  const genuinOptions = useGenuinOptions(
    useShallow((state) => ({
      ksCbRequestStatus: state.user?.ksCbRequestStatus,
      brandName: state.config?.name,
      brandLogo: state.config?.logo,
      isMobile: state.isMobile,
      links: {
        appStoreLink: state.config?.integrations?.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations?.sdk.android.playstore_link,
      },
      email: state.user?.email,
    }))
  )

  const { ksCbRequestStatus, brandLogo, brandName, isMobile, links, email } = genuinOptions

  if (!ksCbRequestStatus || ksCbRequestStatus !== 3) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex w-full max-w-full shrink-0 items-center gap-x-3 rounded-md p-2 px-4 hover:bg-monochrome-6/10">
          <AddIcon className="stroke-primary" />
          <p className={cn('whitespace-nowrap !text-title-3-demi text-primary')}>Create Community</p>
        </div>
      </DialogTrigger>
      <DialogContent className="z-50 flex flex-col items-center gap-4 rounded-t-lg lg:min-w-max lg:max-w-lg lg:!px-14 lg:!py-10">
        <CustomAvatar
          imageUrl={brandLogo ?? ''}
          fallbackString={brandName ?? ''}
          isAvatar={false}
          className="h-16 w-16"
        />
        {!isMobile && (
          <p className="whitespace-pre-wrap break-all text-center font-bold" style={{ fontSize: 40 }}>
            Get the {brandName} app
          </p>
        )}
        <p className="text-center text-title-2-demi">
          Download the app to create a new <br />
          Community.
        </p>
        {links.playStoreLink && links.appStoreLink && (
          <div>
            <Tabs defaultValue="app_store">
              <TabsList>
                <TabsTrigger
                  value="app_store"
                  className="border-1 rounded-s-lg border border-tertiary data-[state=active]:border-b data-[state=active]:border-secondary data-[state=active]:opacity-100">
                  <AppleIcon className={`mr-2`} />
                  <p className="text-body-1-demi">From App Store</p>
                </TabsTrigger>
                <TabsTrigger
                  value="play_store"
                  className="border-1 rounded-e-lg border border-tertiary opacity-50 data-[state=active]:border-b data-[state=active]:border-secondary data-[state=active]:opacity-100">
                  <PlayStoreIcon className={`mr-2`} />
                  <p className="text-body-1-demi">From Google Play</p>
                </TabsTrigger>
              </TabsList>
              <div className="my-2">
                <TabsContent value="app_store" className="flex justify-center">
                  <div>
                    <QRCode
                      ecLevel="L"
                      value={links.appStoreLink}
                      size={130}
                      qrStyle="squares"
                      logoPaddingStyle="square"
                    />
                    <p className="text-center font-bold" style={{ fontSize: '14px' }}>
                      Scan to download
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="play_store" className="flex justify-center">
                  <div>
                    <QRCode
                      value={links.playStoreLink}
                      ecLevel="L"
                      size={130}
                      qrStyle="squares"
                      logoPaddingStyle="square"
                    />
                    <p className="text-center font-bold" style={{ fontSize: '14px' }}>
                      Scan to download
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <p className="text-center text-body-1-demi text-secondary-300">OR</p>
          </div>
        )}
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
          <SubmitButton email={email} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton({ email }: { email: string | null | undefined }) {
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
