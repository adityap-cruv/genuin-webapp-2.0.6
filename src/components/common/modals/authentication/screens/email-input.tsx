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
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { loginViaEmail } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { LOGIN_SOURCE } from '@lib/constants'
import { usePathname } from 'next/navigation'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Loader } from '@components/ui/loader'

export function EmailInput() {
  const { setStep, setFormData, formData, action } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const pathname = usePathname()
  const brandName = useGenuinOptions().config?.name

  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: { email: formData.email },
  })
  const { isValid } = form.formState

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
    await loginViaEmail({
      email: formData.email,
      deviceId,
      loginSource: LOGIN_SOURCE.web,
      actionMetaData: { path: pathname, action },
    })
      .then(async (res) => {
        if (res?.code === 200) {
          setStep('PASSWORD_INPUT_LOGIN')
        }
        if (res.code === 5237) {
          if (res.data.is_email_verified) {
            setStep(res.data.is_password_set ? 'PASSWORD_INPUT_LOGIN' : 'MAGIC_LINK_SENT_NOTE')
          } else {
            setStep('EMAIL_SENT_NOTE')
          }
        }
        if (res.code === 5174) {
          form.control.setError('root', { message: 'API Rate Limit Exceeded' })
        }
        if (res.code === 5234) {
          form.control.setError('email', {
            message: 'Account with this email id doesn`t exist on our system. Please sign-up instead',
          })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ModalShell>
      <p className="text-center text-heading-3">Log in to {brandName ?? 'genuin'}</p>
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
              disabled={!isValid || isLoading}>
              {isLoading ? (
                <Loader className="stroke-new-off-white" size="sm" />
              ) : (
                <p className="text-title-3-demi">Next</p>
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

      {/* <p className="text-title-3-demi text-monochrome">OR</p>
      <Button
        variant="outline"
        className="w-full border border-monochrome-9"
        onClick={() => {
          setStep('NUMBER_INPUT')
        }}>
        <div className="relative flex w-full items-center justify-center">
          <img src={phone_icon.src} className="absolute left-0 h-5 w-5" alt="at" />
          <p className="text-title-3-demi">Use phone</p>
        </div>
      </Button> */}
      <p className="text-new-para-2-mobile">
        By registering, you agree to {brandName ?? 'genuin'}'s
        <Link href={PATH_NAME.terms} target="_blank">
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={PATH_NAME.privacy} target="_blank">
          <span className="text-primary"> Privacy</span>
        </Link>
      </p>
      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?{' '}
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p>
    </ModalShell>
  )
}
