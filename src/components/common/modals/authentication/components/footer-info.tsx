import { cn } from '@/lib/utils'
import { useState, type CSSProperties, type ComponentProps } from 'react'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import googleIcon from '@icons/googleIcon.svg'
import appleIcon from '@icons/appleIcon.svg'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { getUrlToRedirectForSSO } from '../api/auth'
import { Loader } from '@/components/ui/loader'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { EmailIcon } from '@icons/email-icon'
import { KeypadIcon } from '@icons/keypad-icon'
import { useAuthenticationModalStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const buttonStyle: CSSProperties = { fontSize: 14, lineHeight: '20px', paddingLeft: 10 }

function getUrlToRedirect(provider: string) {
  const windowLocation = new URL(window.location.href)
  windowLocation.searchParams.set('provider', provider)
  return windowLocation.href
}

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
  const { flowType, setFormData } = useAuthenticationModalStore(
    useShallow((state) => ({ flowType: state.formData.flowType, setFormData: state.setFormData }))
  )
  const { config } = useGenuinOptions()
  const [loading, setIsLoading] = useState<null | 'google' | 'apple' | 'brand'>(null)
  const router = useRouter()
  const { toast } = useToast()

  async function signInWithGoogle() {
    try {
      setIsLoading('google')
      const responseUrl = await getUrlToRedirectForSSO('google')
      const url = new URL(responseUrl)
      url.searchParams.set('prompt', 'consent')
      url.searchParams.set('state', getUrlToRedirect('google'))
      router.push(url.href)
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' })
    } finally {
      setIsLoading(null)
    }
  }

  async function signInWithApple() {
    try {
      setIsLoading('apple')
      const responseUrl = await getUrlToRedirectForSSO('apple')
      const url = new URL(responseUrl)
      url.searchParams.set('prompt', 'consent')
      url.searchParams.set('state', getUrlToRedirect('apple'))
      router.push(url.href)
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' })
    } finally {
      setIsLoading(null)
    }
  }

  async function signInWithBrand() {
    try {
      setIsLoading('brand')
      if (typeof config?.social_login.brand_sso_id !== 'string') {
        throw new Error('Brand SSO ID is not available')
      }
      const responseUrl = await getUrlToRedirectForSSO(config?.social_login.brand_sso_id)
      const url = new URL(responseUrl)
      url.searchParams.set('prompt', 'consent')
      url.searchParams.set('state', getUrlToRedirect(config.social_login.brand_sso_id))
      router.push(url.href)
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <>
      <div className="flex w-full items-center gap-4">
        <div style={{ height: 1 }} className="w-full bg-tertiary-200" />
        <p className="whitespace-nowrap text-body-1-med text-tertiary">OR</p>
        <div style={{ height: 1 }} className="w-full bg-tertiary-200" />
      </div>
      {config?.social_login.google && (
        <Button
          className="flex w-full border border-[#747775] bg-monochrome-white font-medium text-monochrome-black hover:bg-tertiary-100"
          onClick={async (e) => {
            await signInWithGoogle()
          }}>
          {loading === 'google' ? (
            <Loader size="sm" />
          ) : (
            <>
              <Image src={googleIcon} alt="Google" width={24} height={24} />
              <p style={buttonStyle}>Continue with Google</p>
            </>
          )}
        </Button>
      )}
      {config?.social_login.apple && (
        <Button
          className="w-full bg-monochrome-black text-monochrome-white hover:bg-[#212529]"
          onClick={(e) => {
            void signInWithApple()
          }}>
          {loading === 'apple' ? (
            <Loader size="sm" />
          ) : (
            <>
              <Image src={appleIcon} alt="Apple" height={24} width={24} />
              <p style={buttonStyle}>Continue with Apple</p>
            </>
          )}
        </Button>
      )}
      {config?.social_login.brand && (
        <Button
          className="w-full"
          onClick={(e) => {
            void signInWithBrand()
          }}>
          {loading === 'brand' ? (
            <Loader size="sm" />
          ) : (
            <p className="text-body-1-demi text-monochrome-white">{`Continue with ${config.name}`}</p>
          )}
        </Button>
      )}
      <Button
        variant="custom"
        className="w-full p-0  text-primary-400"
        onClick={() => {
          flowType === 'email' ? setFormData({ flowType: 'phone' }) : setFormData({ flowType: 'email' })
        }}>
        {flowType === 'email' ? (
          <>
            <KeypadIcon className="mr-1 h-4 w-4 fill-primary-400"></KeypadIcon>
            <p className="text-body-1-med">Use phone number instead</p>
          </>
        ) : (
          <>
            <EmailIcon className="mr-1 h-4 w-4 stroke-primary-400"></EmailIcon>
            <p className="text-body-1-med">Use email instead</p>
          </>
        )}
      </Button>

      <p className={cn('mt-2 text-center text-new-para-2-mobile', className)} {...restProps}>
        By continuing, you agree to
        <Link href={config?.terms_and_condition ?? PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={config?.privacy_policy ?? PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Privacy Policy</span>
        </Link>
      </p>
    </>
  )
}
