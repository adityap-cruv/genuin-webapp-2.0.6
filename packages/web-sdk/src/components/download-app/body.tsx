'use client'
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from '@/components/ui/form'
import { PhoneInput } from '@/components/ui/phone-input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import { useBaseContext } from '@/context/base'
import { useSizeContext } from '@/context/size'
import { CustomImage } from '../custom-image'
import { QRCode } from 'react-qrcode-logo'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@/const'
import { useSearchParams } from 'wouter'
import { cn, getIconLink } from '@/utils'
import { Loader } from '../loader'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { sendGetAppLink } from './api'
import GetAppButton from '../get-app-button'
import { Analytics } from '@/analytics'
import { BrandDetailsConfigType } from '@/type'

type DownloadDialogType = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  deepLink?: string
}

export function Body({ title, subtitle, deepLink }: DownloadDialogType) {
  const { brandDetails } = useBaseContext()
  const { isMobile } = useSizeContext()

  return (
    <div className='flex w-full flex-col items-center justify-center gap-6 text-center sm:min-w-[384px] sm:max-w-md sm:px-4'>
      {brandDetails?.logo && (
        <CustomImage
          src={brandDetails?.logo}
          height={40}
          width={40}
          className='rounded-full object-cover h-10 w-10'
          alt='logo'
        />
      )}

      <div className='flex flex-col items-center gap-2'>
        <p className='text-title-1-bold'>Get the {brandDetails?.name} app</p>
        {subtitle && (
          <p className='line-clamp-2 max-w-none text-title-3-demi text-tertiary'>
            {subtitle}
          </p>
        )}
      </div>

      {!isMobile ? (
        <>
          <div>
            <QRCode
              value={deepLink}
              size={132}
              qrStyle='squares'
              logoPaddingStyle='square'
            />
            <p className='text-center text-body-1-demi'>Scan to download app</p>
          </div>

          <hr className='border-1 w-3/4 border-tertiary' />

          <FormContent brandDetails={brandDetails} />

          <div className='flex gap-x-2'>
            <a
              href={
                typeof brandDetails?.integrations.sdk.ios === 'string'
                  ? brandDetails.integrations.sdk.ios
                  : (brandDetails?.integrations.sdk.ios?.appstore_link ??
                    URL_TO_APP_STORE)
              }
              target='_blank'
              rel='noopener noreferrer'>
              <img
                className='mx-2 h-10 w-auto'
                src={getIconLink('appStore')}
                alt='app store'
              />
            </a>
            <a
              href={
                typeof brandDetails?.integrations.sdk.android === 'string'
                  ? brandDetails.integrations.sdk.android
                  : (brandDetails?.integrations.sdk.android?.playstore_link ??
                    URL_TO_PLAY_STORE)
              }
              target='_blank'
              rel='noopener noreferrer'>
              <img
                className='mx-2 h-10 w-auto'
                src={getIconLink('playStore')}
                alt='play store'
              />
            </a>
          </div>
        </>
      ) : (
        <div className='w-full'>
          <GetAppButton
            buttonText='Get App'
            className='w-full text-body-1-demi text-white'
            variant='default'
          />
        </div>
      )}
    </div>
  )
}

const formSchema = z
  .object({
    email: z.string().email().or(z.literal('')).optional(),
    phone: z
      .string()
      .or(z.literal(''))
      .optional()
      .refine((val) => val === '' || isValidPhoneNumber(val ?? ''), {
        message: 'Enter a valid phone number',
      }),
    _form: z.string().optional(),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: 'Either phone or email is required',
    path: ['_form'],
  })

function FormContent({
  brandDetails,
}: {
  brandDetails: BrandDetailsConfigType | undefined
}) {
  const searchParams = useSearchParams()
  const [isLinkSent, setIsLinkSent] = useState(false)
  const [error, setError] = useState<string>('')
  const pathName = usePathNameWithSubdomain()

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload: Record<string, any> = {}
      if (data.phone) payload.mobile = data.phone
      if (data.email) payload.email = data.email
      if (searchParams.toString()) {
        payload.query_params = '?' + searchParams.toString()
      }

      return await sendGetAppLink(payload)
    },
    onSuccess: (_, variables) => {
      Analytics.track(Analytics.EventNames.GetAppButtonClicked, {
        phone_no: variables.phone ?? '',
        email: variables.email,
      })
      setIsLinkSent(true)
      form.reset()
      form.clearErrors()
    },
    onError: (error: Error) => {
      setError(
        error.message || 'Failed to send download link. Please try again.',
      )
      form.reset()
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    criteriaMode: 'firstError',
    defaultValues: {
      email: '',
      phone: '',
      _form: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data)
  }

  if (isLinkSent) {
    return (
      <div className='text-green-600 py-2 text-center font-semibold'>
        Download link sent!
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col items-center gap-4'>
      <p className='text-center text-new-sm'>
        Send download link to your phone or email
      </p>
      <div className='w-full'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex w-full flex-col gap-3'>
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => {
                return (
                  <FormItem className='p-0 sm:w-full'>
                    <FormControl>
                      <PhoneInput
                        value={field.value as any}
                        defaultCountry='US'
                        international
                        className='w-full'
                        popoverClassName='absolute z-50'
                        onChange={(value) => {
                          form.setValue('phone', value)
                          void form.trigger()
                        }}
                        onBlur={() => {
                          void form.trigger()
                        }}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => {
                return (
                  <FormItem className='p-0 sm:w-full'>
                    <FormControl>
                      <Input
                        placeholder='Enter Email'
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 !text-title-3-med placeholder:!text-tertiary-300',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <Button
              type='submit'
              variant='default'
              className='w-full'
              disabled={!form.formState.isValid || mutation.isPending}>
              {' '}
              {mutation.isPending ? (
                <Loader className='stroke-white' />
              ) : (
                <p className='text-body-1-demi text-white'>Send link</p>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {error && (
        <div className='text-destructive w-full py-2 text-center text-cap-1-demi text-red'>
          {error}
        </div>
      )}

      <p className='text-cap-1-med'>
        By clicking Send Link, I acknowledge that I have read the{' '}
        <a
          href={brandDetails?.privacy_policy ?? pathName.privacy()}
          className='underline'>
          Privacy Policy
        </a>{' '}
        and agree to the{' '}
        <a
          href={brandDetails?.terms_and_condition ?? pathName.terms()}
          className='underline'>
          Terms of Service
        </a>
      </p>
    </div>
  )
}
