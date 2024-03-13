import Otp from '@components/ui/otp'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { verifyOtp } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { LOGIN_SOURCE } from '@lib/constants'

const formSchema = z.object({
  phone: z.string(),
})

export function OtpInput() {
  const { setStep, formData, setFormData } = useAuthenticationModalStore()
  const [otp, setOtp] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const [timer, setTimer] = useState(30)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: '',
    },
  })

  useEffect(() => {
    setFormData({ otp })
  }, [otp])

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

  async function onSubmit() {
    setIsLoading(true)

    await verifyOtp({
      userId: formData.userId ?? '',
      otp,
      token: deviceId,
      loginSource: LOGIN_SOURCE.web,
    })
      .then(async (res) => {
        if (res?.code === 200) {
          setIsLoading(false)
          setStep('OTP_INPUT')
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
    }
  }
  return (
    <ModalShell>
      <div className="flex flex-col items-center">
        <p className="mb-2 text-center text-title-3-med text-monochrome">
          Enter the 6-digit code sent to: {formData.phone}
        </p>

        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col items-center sm:w-full">
                      <FormControl>
                        <Otp
                          length={6}
                          otp={otp}
                          onOtpChange={(value) => {
                            setOtp(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage className={cn('!text-cap-1-demi')} />
                      {form.formState.errors.root && (
                        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
                          {form.formState.errors.root.message}
                        </p>
                      )}
                    </FormItem>
                  )
                }}
              />
              <Button type="submit" variant="default" className="w-full bg-new-off-black hover:bg-new-dark-grey">
                <p className="text-title-3-demi">Verify</p>
              </Button>
            </form>
          </Form>
        </div>
        {timer <= 0 ? (
          <p className="mt-4 cursor-pointer text-body-1-med text-primary" onClick={resendOtp}>
            Resend otp
          </p>
        ) : (
          <p className="mt-4 text-center text-body-1-med text-monochrome">
            Resend code in <span className="text-monochrome-black">{`00:${timer.toString().padStart(2, '0')}`}</span>
          </p>
        )}
      </div>

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
