'use client'
import Image from 'next/image'
import imageAppStore from '@images/appStore.svg'
import imagePlayStore from '@images/playStore.svg'
import { URL_TO_APP_STORE, URL_TO_PLAY_STORE } from '@lib/constants'
import { QRCode } from 'react-qrcode-logo'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'
import { CustomImage } from '@/components/custom/custom-image'
import GetAppButton from '../../get-app-button'
import Link from 'next/link'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { Form, FormControl, FormItem, FormField, FormMessage } from '@/components/ui/form'
import { PhoneInput } from '@/components/ui/phone-input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { sendGetAppLink } from '@/lib/get-deeplink'
import Analytics from '@/services/analytics'
import { Loader } from '@/components/ui/loader'
import { useMutation } from '@tanstack/react-query'

type DownloadDialogType = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  deepLink?: string
}

export function Body({ title, subtitle, deepLink }: DownloadDialogType) {
  const { links, brandLogo, brandName, isMobile, privacyPolicy, termsAndCondition } = useGenuinOptions(
    useShallow((state) => ({
      links: {
        appStoreLink: state.config?.integrations.sdk.ios.appstore_link,
        playStoreLink: state.config?.integrations.sdk.android.playstore_link,
      },
      brandLogo: state.config?.logo,
      brandName: state.config?.name,
      isMobile: state.isMobile,
      privacyPolicy: state.config?.privacy_policy ?? PATH_NAME.privacy,
      termsAndCondition: state.config?.terms_and_condition ?? PATH_NAME.terms,
    }))
  )

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 text-center sm:min-w-[384px] sm:max-w-md sm:px-4">
      {brandLogo && (
        <CustomImage
          src={brandLogo}
          height={40}
          width={40}
          className="h-10 w-10 rounded-full object-cover"
          alt="logo"
        />
      )}

      <div className="flex flex-col items-center gap-2">
        <p className="text-new-h4-mobile">Get the {brandName} app</p>
        {subtitle && <p className="line-clamp-2 max-w-none text-title-3-demi text-tertiary">{subtitle}</p>}
      </div>

      {!isMobile ? (
        <>
          <div>
            <QRCode value={deepLink} size={132} qrStyle="squares" logoPaddingStyle="square" />
            <p className="text-center text-body-1-demi">Scan to download app</p>
          </div>

          <hr className="border-1 w-3/4 border-tertiary" />

          <FormContent privacyPolicy={privacyPolicy} termsAndCondition={termsAndCondition} />

          <div className="flex gap-x-2">
            <a href={links.appStoreLink ?? URL_TO_APP_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imageAppStore} alt="app store" />
            </a>
            <a href={links.playStoreLink ?? URL_TO_PLAY_STORE} target="_blank" rel="noopener noreferrer">
              <Image className="mx-2 h-10 w-auto" src={imagePlayStore} alt="play store" />
            </a>
          </div>
        </>
      ) : (
        <div className="w-full">
          <GetAppButton
            buttonText="Get App"
            className="w-full text-body-1-demi text-monochrome-white"
            variant="default"
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

function FormContent({ privacyPolicy, termsAndCondition }: { privacyPolicy: string; termsAndCondition: string }) {
  const searchParams = useSearchParams()
  const [isLinkSent, setIsLinkSent] = useState(false)
  const [error, setError] = useState<string>('')

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
      void Analytics.track({
        eventName: 'Get App Link Sent',
        properties: {
          phone_no: variables.phone ?? '',
          email: variables.email,
        },
      })
      setIsLinkSent(true)
      form.reset()
      form.clearErrors()
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to send download link. Please try again.')
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
    return <div className="text-green-600 py-2 text-center font-semibold">Download link sent!</div>
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-center text-new-sm">Send download link to your phone or email</p>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => {
                return (
                  <FormItem className="p-0 sm:w-full">
                    <FormControl>
                      <PhoneInput
                        value={field.value as any}
                        defaultCountry="US"
                        international
                        className="w-full"
                        popoverClassName="absolute z-50"
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
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="p-0 sm:w-full">
                    <FormControl>
                      <Input
                        placeholder="Enter Email"
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 !text-title-3-med placeholder:!text-tertiary-300'
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
              type="submit"
              variant="default"
              className="w-full"
              disabled={!form.formState.isValid || mutation.isLoading}>
              {' '}
              {mutation.isLoading ? (
                <Loader size="sm" className="stroke-monochrome-white" />
              ) : (
                <p className="text-body-1-demi text-monochrome-white">Send link</p>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {error && <div className="text-destructive w-full py-2 text-center text-cap-1-demi text-red">{error}</div>}

      <p className="text-cap-1-med">
        By clicking Send Link, I acknowledge that I have read the{' '}
        <Link href={{ pathname: privacyPolicy }} className="underline">
          Privacy Policy
        </Link>{' '}
        and agree to the{' '}
        <Link href={{ pathname: termsAndCondition }} className="underline">
          Terms of Service
        </Link>
      </p>
    </div>
  )
}
