import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { useAuthenticationModalStore } from '../store'
import { resendVerificationMail } from '@lib/api/auth'
import { shortenedEmail } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { GenuinIcon } from '@icons/genuin-icon'
import imageAppStore from '@icons/ks-cb-flow/app-store-tab.svg'
import imagePlayStore from '@icons/ks-cb-flow/play-store-tab.svg'
import 'swiper/swiper-bundle.css'
import Image from 'next/image'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import { QRCode } from 'react-qrcode-logo'
import { CommunityDiscussion01 } from '@icons/ks-cb-flow/community-01'

export const Note = {
  email: Email,
  magicLink: MagicLink,
  miniprofilesuccess: MiniProfileSuccess,
}

function Email({ acountExists = false }: { acountExists?: boolean }) {
  const { formData } = useAuthenticationModalStore()
  const [error, setError] = useState({ message: '', code: 0 })
  const [emailSentText, setEmailSentText] = useState('')
  const [timer, setTimer] = useState(formData.retryTime ?? 0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1)
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [timer])

  async function resendMail() {
    if (formData.email && timer <= 0) {
      await resendVerificationMail(formData.email, 12)
        .then((res) => {
          if (res.code === 200) {
            setEmailSentText('Email has been sent sucessfully')
            setTimer(res?.retryTime)
          } else if (res.code === 5239) {
            setError((x) => {
              return { message: 'Email has already been verified', code: res.code }
            })
          } else {
            setTimer(res?.retryTime)
            throw new Error()
          }
        })
        .catch((e) => {
          setError((x) => {
            return { message: 'Something went wrong.Please try again.', code: -1 }
          })
        })
    }
  }

  function formatTime() {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        {acountExists && 'An account with this email already exists. '}We have sent a confirmation link to{' '}
        <span className="text-title-1-bold">{shortenedEmail(formData.email)}</span>. Verify your email{' '}
        {!acountExists && 'to save your profile'}
        {acountExists && 'to continue'}.
      </p>
      {error.code !== 5239 && acountExists && (
        <p className="text-title-3-demi">
          {timer <= 0 ? (
            <span onClick={resendMail} className="cursor-pointer text-primary">
              Resend
            </span>
          ) : (
            <span className="text-center text-body-1-med font-bold text-secondary">Resend email in {formatTime()}</span>
          )}
        </p>
      )}
      {emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-green">{emailSentText}</p>
      )}
      {error.message && !emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error.message}</p>
      )}
    </ModalShell>
  )
}

function MagicLink() {
  const { formData } = useAuthenticationModalStore()
  const brandName = useGenuinOptions().config?.name
  const [error, setError] = useState({ message: '', code: 0 })
  const [emailSentText, setEmailSentText] = useState('')
  const [timer, setTimer] = useState(formData.retryTime ?? 0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1)
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [timer])

  async function resendMail() {
    if (formData.email && timer <= 0) {
      await resendVerificationMail(formData.email, 12)
        .then((res) => {
          if (res.code === 200) {
            setEmailSentText('Email has been sent sucessfully')
            setTimer(res?.retryTime)
          } else if (res.code === 5239) {
            setError((x) => {
              return { message: 'Email has already been verified', code: res.code }
            })
          } else {
            setTimer(res?.retryTime)
            throw new Error()
          }
        })
        .catch((e) => {
          setError((x) => {
            return { message: 'Something went wrong.Please try again.', code: -1 }
          })
        })
    }
  }

  function formatTime() {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return (
    <ModalShell>
      <p className="text-center text-title-1-med">
        We have sent a magic link to <span className="text-title-1-bold">{shortenedEmail(formData.email)}</span>. Click
        the link to Log in to {brandName}.
      </p>
      {error.code !== 5239 && (
        <p className="text-title-3-demi">
          {timer <= 0 ? (
            <span onClick={resendMail} className="cursor-pointer text-primary">
              Resend
            </span>
          ) : (
            <span className="text-center text-body-1-med font-bold text-secondary">Resend email in {formatTime()}</span>
          )}
        </p>
      )}
      {emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-green">{emailSentText}</p>
      )}
      {error.message && !emailSentText && (
        <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error.message}</p>
      )}
    </ModalShell>
  )
}

function MiniProfileSuccess() {
  const brandName = useGenuinOptions().config?.name

  const logoImageDataUrl =
    "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0C44.7783 0 0.222931 44.3332 0.000709297 99.5552C-0.165957 144.333 29.0562 182.333 69.5005 195.277C88.5004 201.333 109.334 192.777 117.834 174.722C120.5 169.055 122 162.722 122 155.999V154.111C122 152.388 120.278 151.166 118.667 151.777C112.5 153.999 105.834 155.166 98.8892 154.999C68.8893 154.388 44.7228 129.444 45.0005 99.4441C45.2783 69.3331 69.8338 44.9998 100 44.9998C130.389 44.9998 155 69.6109 155 99.9996V155.999C155 167.277 152.556 177.999 148.222 187.61C179.111 170.611 200 137.722 200 99.9996C200 44.7776 155.222 0 100 0Z' fill='%230645FF'/%3E%3C/svg%3E"

  return (
    <ModalShell className="!sm:px-0 sm:m-0">
      <p className="text-center text-title-1-demi">You’ve been added as a Community Builder for {brandName}</p>

      <div
        className="flex max-h-40 w-full items-center rounded-lg p-4"
        style={{
          background: 'linear-gradient(30deg, var(--primary-400) -80%, #FFFFFF 50%, var(--primary-400) 120%)',
        }}>
        <div className="flex w-[65%] flex-col gap-2">
          <p className="text-cap-1-bold text-monochrome-black">
            Ready to embark on <span className="font-semibold">your community</span> building journey?
          </p>
          <div className="flex items-center">
            <p className="text-cap-1-med text-monochrome-black">Download the</p>
            <Link href={{ pathname: PATH_NAME.home() }}>
              <GenuinIcon.logo className="mr-2 h-4 w-full fill-new-off-black" />
            </Link>
            <p className="text-cap-1-med text-monochrome-black">app.</p>
          </div>
          <div className="flex gap-x-2">
            <a href={URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="h-6 w-auto" src={imageAppStore} alt="app store" />
            </a>
            <a href={URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="h-6 w-auto" src={imagePlayStore} alt="play store" />
            </a>
          </div>
        </div>
        <div className="flex w-[35%] flex-col items-center justify-center">
          <div className="h-1 w-[100px] rounded-t-md bg-monochrome-white "></div>
          <QRCode
            value="https://qabegenuin.page.link/a7Td"
            size={80}
            qrStyle="dots"
            logoImage={logoImageDataUrl}
            logoHeight={20}
            logoWidth={20}
            eyeRadius={10}
            logoOpacity={1}
            logoPaddingStyle="circle"
            removeQrCodeBehindLogo={true}
            style={{ borderRadius: '100px' }}
          />
          <div
            className="w-[100px] rounded-b-md bg-monochrome-white p-0.5 pt-0 text-center text-monochrome-black"
            style={{
              fontSize: '10px',
            }}>
            Scan to download
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
