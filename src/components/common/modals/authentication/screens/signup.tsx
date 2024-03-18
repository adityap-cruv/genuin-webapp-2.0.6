'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { signup } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useEffect, useState } from 'react'
import { SIGNUP_SOURCE } from '@lib/constants'
import { signIn } from 'next-auth/react'
import { ImageInput } from '../components/image-input'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useGenuinOptions } from '@lib/stores/genuin-options'

const formSchema = z.object({
  displayName: z
    .string()
    .min(3, { message: 'Min length should be 3.' })
    .max(25, { message: 'Max length should be 25.' })
    .regex(/^[a-zA-Z0-9 ]+$/i, { message: 'Full Name can only have letters, numbers and spaces.' }),
  email: z.string().email({ message: 'Please enter valid email.' }),
})

export function Signup() {
  const { setStep, formData, setFormData, action } = useAuthenticationModalStore()
  const deviceId = useLocalStorage().deviceId
  const brandName = useGenuinOptions().config?.name
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    criteriaMode: 'firstError',
    defaultValues: {
      displayName: formData.displayName,
      email: formData.email,
    },
  })
  const { isDirty, isValid } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ displayName: value.displayName, email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ displayName, email }: { displayName: string; email: string }) {
    setIsLoading(true)
    // grecaptcha.enterprise.ready(async () => {
    //   const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY, {
    //     action: 'SIGNUP',
    //   })
    await signup({
      email,
      profileImage: formData.image ?? '',
      name: displayName,
      isAvatar: formData.isAvatar,
      recaptchaAction: 'SIGNUP',
      // recaptchaToken: token,
      deviceId,
      signupSource: SIGNUP_SOURCE.web,
      actionMetadata: { path: pathname, action },
    })
      .then(async (res) => {
        if (res?.code === 200) {
          await signIn('credentials', {
            ...res.data.user,
            accessToken: res.accessToken,
            redirect: false,
          }).then((res) => {
            if (res?.ok) setStep('EMAIL_SENT_NOTE')
          })
        }
        // Recaptcha validation issue
        else if (res.code === 5242) {
          form.control.setError('root', { message: 'Bot access detected' })
        }
        // Email verification pending and password not set.
        else if (res.code === 5231) {
          setStep('EMAIL_SENT_NOTE')
        }
        // Email verified password not set.
        else if (res.code === 5237) {
          setStep('MAGIC_LINK_SENT_NOTE')
        }
        // Account exists log in instead.
        else if (res.code === 5232) {
          form.control.setError('email', { message: 'Email already exists. Log in instead.' })
        } else {
          form.control.setError('root', { message: 'Something went wrong. Please try again.' })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    // })
  }

  return (
    <>
      <h3 className="flex w-full items-center justify-center pb-4 text-heading-3">
        Sign up for {brandName ?? 'genuin'}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ImageInput />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Full Name</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('displayName')?.length ?? 0}/25</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={25}
                      type="text"
                      className={cn('border-monochrome-9 bg-monochrome-11 text-title-3-med', errors && '!border-red')}
                      {...field}
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
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Email</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={cn('border-monochrome-9 bg-monochrome-11 text-title-3-med', errors && '!border-red')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <span className="flex flex-col gap-y-3 text-title-3-demi">
            <Input
              type="submit"
              value="Verify Email"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-new-off-black  text-monochrome-white hover:bg-new-dark-grey disabled:hover:bg-new-off-black"
              disabled={!isDirty || !isValid || isLoading}
            />
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </span>
        </form>
        <p className="py-4 text-center text-cap-1-med text-monochrome-4">
          By registering, you agree to {brandName ?? 'genuin'}’s&nbsp;
          <Link href={PATH_NAME.terms} className="break-keep text-primary">
            Terms of Service
          </Link>
          &nbsp;and&nbsp;
          <Link className="text-primary" href={PATH_NAME.privacy}>
            Privacy
          </Link>
        </p>
        <p className="flex w-full items-center justify-center text-body-1-demi">
          Already have an account?
          <span
            className="cursor-pointer text-primary"
            onClick={() => {
              setStep('EMAIL_INPUT')
            }}>
            &nbsp;Log in
          </span>
        </p>
      </Form>
    </>
  )
}
