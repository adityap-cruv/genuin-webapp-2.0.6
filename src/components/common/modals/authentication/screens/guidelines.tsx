import { ModalShell } from '../modal-shell'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { GenuinIcon } from '@icons/genuin-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form'
import { addEmailForKs, getBrandGuidelines, signup } from '@lib/api/auth'
import { SIGNUP_SOURCE } from '@lib/constants'
import { signIn } from 'next-auth/react'
import { useAuthenticationModalStore } from '../store'
import { useEffect, useState } from 'react'
import { Loader } from '@components/ui/loader'
import { analyticsService } from '@services/analytics_service'
import { usePathname, useSearchParams } from 'next/navigation'
import { deleteSearchParam } from '@lib/utils'
import { rudderStackIdentify } from '@services/useRudderAnalytics'

const FormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
})

interface Guideline {
  title: string
  description: string
}

export function Guidelines() {
  const { setStep, formData, action } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)
  const [guidelines, setGuidelines] = useState<Guideline[] | null>(null)
  const brandId = useGenuinOptions().brandId
  const pathName = usePathname()
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: false,
    },
  })
  const { isDirty } = form.formState

  useEffect(() => {
    async function fetchGuidelines() {
      void getBrandGuidelines({ brandId, idDefault: false }).then((res) => {
        if (res.code === 200) {
          setGuidelines(res.data)
        }
      })
    }

    void fetchGuidelines()
  }, [])

  async function submitViaSms() {
    const token = searchParams.get('token') ?? ''

    setIsLoading(true)
    try {
      await addEmailForKs({ email: formData.email, token })
        .then((res) => {
          if (res?.code === 200) {
            deleteSearchParam({
              pathName,
              searchParams: searchParams.toString(),
              paramsToDelete: ['utm_medium', 'token', 'sms_verification_status'],
            })
            void signIn('credentials', {
              ...res.data.user,
              accessToken: res.accessToken,
              redirect: false,
            })
            setStep('EMAIL_SENT_NOTE')
          } else {
            form.control.setError('root', { message: 'Something went wrong. Please try again!' })
            throw new Error()
          }
        })
        .catch((e) => {
          form.control.setError('root', { message: 'Something went wrong. Please try again!' })
          throw new Error()
        })
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  async function submitViaMail() {
    setIsLoading(true)
    try {
      const signupResponse = await signup({
        email: formData.email ?? '',
        signupSource: SIGNUP_SOURCE.web,
        actionMetadata: { path: window.location.pathname, action },
      })
      await signIn('credentials', {
        ...signupResponse.data.user,
        accessToken: signupResponse.accessToken,
        redirect: false,
      })
        .then((res) => {
          if (res?.ok) {
            setStep('EMAIL_SENT_NOTE')
            void rudderStackIdentify()
            void analyticsService({
              eventName: 'ks_signed_up',
              properties: { email: formData.email },
            })
          } else {
            form.control.setError('root', { message: 'Something went wrong. Please try again!' })
            throw new Error()
          }
        })
        .catch((e) => {
          form.control.setError('root', { message: 'Something went wrong. Please try again!' })
          throw new Error()
        })
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit() {
    const fromSms = searchParams.get('utm_medium') ?? ''

    if (fromSms === 'sms') {
      await submitViaSms()
    } else {
      await submitViaMail()
    }
  }

  const { brandLogo } = useGenuinOptions((state) => ({
    brandLogo: state.brandWebLogo,
  }))

  if (!guidelines) {
    return (
      <ModalShell>
        <Loader size="md" />
      </ModalShell>
    )
  }

  return (
    <ModalShell>
      <div className="w-full">
        {brandLogo ? <img src={brandLogo} className="h-10" /> : <GenuinIcon.logo className="h-10" />}
      </div>
      <div className="h-[50vh] w-full overflow-auto">
        <h2 className="text-title-1-bold">Brand Guidelines</h2>
        <br />
        {guidelines.map((guideline, index) => (
          <div key={index} className="mb-4 grid gap-1">
            <p className="text-body-1-bold">
              {index + 1}. {guideline.title}
            </p>
            <p className="ml-4 text-body-1-med">{guideline.description}</p>
          </div>
        ))}
      </div>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 space-x-3 space-y-0 rounded-lg border border-monochrome-9 p-3 shadow sm:w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className={`rounded-full border border-tertiary-200 ${isDirty && 'bg-supplementary-red'}`}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I agree to the guidelines</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" variant="default" className="mt-5 w-full" disabled={!isDirty || isLoading}>
              {isLoading ? (
                <Loader className="stroke-new-off-white" size="sm" />
              ) : (
                <p className="text-title-3-demi">Continue</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ModalShell>
  )
}
