import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/ui/form'
import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { loginViaPhone, verifyOtp } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { LOGIN_SOURCE, VERIFICATION_TYPE } from '@lib/constants'
import { signIn } from 'next-auth/react'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { Loader } from '@components/ui/loader'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'

const formSchema = z.object({
  otp: z.string(),
})

export function OtpInput() {
  const { setStep, formData, setFormData, close: closeModal } = useAuthenticationModalStore()
  const [isValidOtp, setIsValidOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const [timer, setTimer] = useState(30)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    const w = form.watch((value) => {
      const otp = parseInt(value.otp ?? '')
      const isValidLength = otp.toString().length === 6
      setIsValidOtp(isValidLength)
      setFormData({ otp })

      if (!isValidLength) {
        form.control.setError('root', { message: '' })
      }
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

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

  async function onSubmit(data: any) {
    setIsLoading(true)

    await verifyOtp({
      userId: formData.userId ?? '',
      otp: parseInt(data.otp),
      token: deviceId,
      loginSource: LOGIN_SOURCE.web,
    })
      .then(async (res) => {
        if (res?.code === 200) {
          const user = res.data
          void signIn('credentials', { ...user, redirect: false })
            .then((res) => {
              if (res?.ok) closeModal()
            })
            .catch((e) => {
              form.control.setError('root', { message: 'Something went wrong.' })
            })
          // setStep('OTP_INPUT')
        }
        if (res?.code === 1008) {
          form.control.setError('root', { message: 'That doesn`t look right. Please check your code and try again' })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function resendOtp() {
    if (timer <= 0) {
      setTimer(30)

      setIsLoading(true)
      await loginViaPhone({
        phone: formData.phone,
        token: deviceId,
        verificationType: VERIFICATION_TYPE.sms,
        loginSource: LOGIN_SOURCE.web,
      })
        .then(async (res) => {
          if (res?.code === 200) {
            setFormData({ userId: res.data.user_id })
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  return (
    <ModalShell>
      <div className="flex flex-col items-center">
        <p className="mb-6 text-center text-heading-3">Enter code</p>
        <p className="w-full text-center text-title-3-med text-monochrome">
          Enter the 6-digit code sent to: {formData.phone}
        </p>

        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col items-center sm:w-full">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          render={({ slots }) => (
                            <InputOTPGroup>
                              {slots.map((slot, index) => (
                                <InputOTPSlot key={index} {...slot} />
                              ))}{' '}
                            </InputOTPGroup>
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
                className="w-full bg-new-off-black hover:bg-new-dark-grey"
                disabled={!isValidOtp || isLoading}>
                {isLoading ? (
                  <Loader size="sm" className="fill-new-off-white" />
                ) : (
                  <p className="text-title-3-demi">Verify</p>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}
      {timer <= 0 ? (
        <p className="cursor-pointer text-body-1-med text-primary" onClick={resendOtp}>
          Resend otp
        </p>
      ) : (
        <p className="text-center text-body-1-med text-monochrome">
          Resend code in <span className="text-monochrome-black">{`00:${timer.toString().padStart(2, '0')}`}</span>
        </p>
      )}

      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?
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
