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

const buttonStyle: CSSProperties = { fontSize: 14, lineHeight: '20px', paddingLeft: 10 }

function getUrlToRedirect(provider: 'google' | 'apple') {
  const windowLocation = new URL(window.location.href)
  windowLocation.searchParams.set('provider', provider)
  return windowLocation.href
}

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
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
      router.replace(url.href)
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
        <p className="whitespace-nowrap text-body-1-med text-tertiary">Or with</p>
        <div style={{ height: 1 }} className="w-full bg-tertiary-200" />
      </div>
      {config?.social_login.google && (
        <Button
          style={{ boxShadow: '0px 0px 1px 0px rgba(0, 0, 0, 0.08), 0px 1px 1px 0px rgba(0, 0, 0, 0.17)' }}
          className="flex w-full bg-monochrome-white font-medium text-monochrome-black hover:bg-tertiary-100"
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
        <Button className="w-full bg-monochrome-black hover:bg-[#212529]">
          <Image src={appleIcon} alt="Apple" height={24} width={24} />
          <p style={buttonStyle}>Continue with Apple</p>
        </Button>
      )}
      {config?.social_login.brand && <Button className="w-full">{`Continue with ${config.name}`}</Button>}
      <p className={cn('text-center text-new-para-2-mobile', className)} {...restProps}>
        By continuing, you're agree to
        <Link href={PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Privacy Policy</span>
        </Link>
      </p>
    </>
  )
}
