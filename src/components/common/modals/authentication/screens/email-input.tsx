'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { PATH_NAME } from '@lib/utils/constants/path'
import { ksSignup, signup } from '@lib/api/auth'
import { usePathname } from 'next/navigation'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Loader } from '@components/ui/loader'
import { SIGNUP_SOURCE } from '@lib/constants'
import { signIn } from 'next-auth/react'

export function EmailInput() {
  const { setStep, setFormData, formData, action } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const brandName = useGenuinOptions().config?.name

  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { email: formData.email },
  })
  const { isValid, isDirty } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit() {
    setIsLoading(true)

    try {
      const ksResponse = await ksSignup({
        email: formData.email ?? '',
        actionMetadata: { path: pathname, action },
      })
      if (ksResponse.code === 200) {
        if (ksResponse.flow === 'signup') {
          const signupResponse = await signup({
            email: formData.email ?? '',
            signupSource: SIGNUP_SOURCE.web,
          })

          await signIn('credentials', {
            ...signupResponse.data.user,
            accessToken: signupResponse.accessToken,
            redirect: false,
          })
            .then((res) => {
              if (res?.ok) {
                setStep('EMAIL_SENT_NOTE')
              } else {
                throw new Error()
              }
            })
            .catch((e) => {
              throw new Error()
            })
        } else {
          setStep('PASSWORD_INPUT_LOGIN')
        }
      } else if (ksResponse.code === 5237) {
        setStep('MAGIC_LINK_SENT_NOTE')
      } else if (ksResponse.code === 5231) {
        setStep('EMAIL_SENT_NOTE_ACCOUNT_EXISTS')
      } else {
        form.control.setError('root', { message: 'Something went wrong. Please try again!' })
      }
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className="text-center text-heading-3">Log in or sign up</p>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="w-full text-body-1-med">
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
            <Button
              type="submit"
              variant="default"
              className="w-full bg-new-off-black hover:bg-new-dark-grey"
              disabled={!isValid || isLoading || !isDirty}>
              {isLoading ? (
                <Loader className="stroke-new-off-white" size="sm" />
              ) : (
                <p className="text-title-3-demi">Continue</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}
      <p className="text-center text-new-para-2-mobile">
        By registering, you agree to {brandName ?? 'genuin'}'s
        <a href={PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Terms of Service </span>
        </a>
        and
        <a href={PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
          <span className="text-primary"> Privacy</span>
        </a>
      </p>
    </ModalShell>
  )
}
