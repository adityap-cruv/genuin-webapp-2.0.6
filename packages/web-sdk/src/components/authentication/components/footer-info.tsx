import { cn } from '@/utils'
import { type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { EmailIcon } from '@/components/icons/email-icon'
import { KeypadIcon } from '@/components/icons/keypad-icon'
import { useBrandDetails } from '@/context/brand-details'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { useAuthModalContext } from '@/components/authentication/context'

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
  const { brandDetails } = useBrandDetails()
  const { formData, setFormData } = useAuthModalContext()
  const pathName = usePathNameWithSubdomain()

  return (
    <>
      <div className='flex w-full items-center gap-4'>
        <div
          style={{ height: 1 }}
          className='w-full bg-tertiary-200'>
          &nbsp;
        </div>
        <p className='whitespace-nowrap text-body-1-med text-tertiary'>OR</p>
        <div
          style={{ height: 1 }}
          className='w-full bg-tertiary-200'>
          &nbsp;
        </div>
      </div>
      <Button
        variant='custom'
        className='w-full p-0 '
        onClick={() => {
          setFormData({
            flowType: formData.flowType === 'email' ? 'phone' : 'email',
          })
        }}>
        {formData.flowType === 'email' ? (
          <>
            <KeypadIcon className='mr-1 h-4 w-4 fill-primary-400' />
            <p className='text-body-1-med text-primary-400'>
              Use phone number instead
            </p>
          </>
        ) : (
          <>
            <EmailIcon className='mr-1 h-4 w-4 stroke-primary-400' />
            <p className='text-body-1-med text-primary-400'>
              Use email instead
            </p>
          </>
        )}
      </Button>
      <p
        className={cn('mt-2 text-center text-new-para-2-mobile', className)}
        {...restProps}>
        By continuing, you agree to
        <a
          href={brandDetails?.terms_and_condition ?? pathName.terms()}
          target='_blank'
          rel='noopener noreferrer'>
          <span className='text-primary'> Terms of Use </span>
        </a>
        and
        <a
          href={brandDetails?.privacy_policy ?? pathName.privacy()}
          target='_blank'
          rel='noopener noreferrer'>
          <span className='text-primary'> Privacy Policy</span>
        </a>
      </p>
    </>
  )
}

//! this is a code for sso. we need to remove this code and add the new code for sso.
// {
//   config?.social_login.google && (
//     <Button
//       className='flex w-full border border-[#747775] bg-background font-medium text-black hover:bg-tertiary-100'
//       onClick={async (e) => {
//         await signInWithGoogle()
//       }}>
//       {loading === 'google' ? (
//         <Loader />
//       ) : (
//         <>
//           {/* <Image
//           src={googleIcon}
//           alt='Google'
//           width={24}
//           height={24}
//         /> */}
//           <GoogleIcon />
//           <p style={buttonStyle}>Continue with Google</p>
//         </>
//       )}
//     </Button>
//   )
// }
// {
//   config?.social_login.apple && (
//     <Button
//       className='w-full bg-black text-white hover:bg-[#212529]'
//       onClick={(e) => {
//         void signInWithApple()
//       }}>
//       {loading === 'apple' ? (
//         <Loader />
//       ) : (
//         <>
//           {/* <Image
//           src={appleIcon}
//           alt='Apple'
//           height={24}
//           width={24}
//         /> */}
//           <AppleIcon />
//           <p style={buttonStyle}>Continue with Apple</p>
//         </>
//       )}
//     </Button>
//   )
// }
// {
//   config?.social_login.brand && (
//     <Button
//       className='w-full'
//       onClick={(e) => {
//         void signInWithBrand()
//       }}>
//       {loading === 'brand' ? (
//         <Loader />
//       ) : (
//         <p className='text-body-1-demi text-white'>{`Continue with ${config.name}`}</p>
//       )}
//     </Button>
//   )
// }
