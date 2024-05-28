'use client'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { PhoneInput } from '@components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { Loader } from '@components/ui/loader'
import { useDeleteAccountStore } from './store'
import { sendAccountDeleteCode } from '@lib/api/delete-account'

const formSchema = z.object({
  phone: z.string(),
})

export function PhoneNumberInput() {
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const { setStep, formData, setFormData } = useDeleteAccountStore()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: '',
    },
  })

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

  useEffect(() => {
    if (!isValidPhoneNumber(formData?.phoneNumber ?? '')) form.clearErrors()
  }, [formData?.phoneNumber])

  async function onSubmit() {
    // setStep('OTP_INPUT')
    setIsLoading(true)
    await sendAccountDeleteCode({
      phone: formData?.phoneNumber ?? '',
      verificationType: 1,
    })
      .then(async (res) => {
        if (res?.code === 200) {
          setFormData({ userId: res.data.user_id, retryTime: res.data.retryTime })
          setStep('OTP_INPUT')
        } else if (res.code === 5025) {
          form.control.setError('root', { message: `The user you are looking for is no longer available!` })
        } else if (res.code === 5174) {
          setTimer(res.data.retryTime)
        } else {
          form.control.setError('root', { message: 'Something went wrong please try again after sometime!' })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function formatTime() {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-3 text-center">
      <p className="text-heading-3">Delete account</p>
      <p className="text-title-3-med text-tertiary">We'll send you a code to verify your account.</p>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => {
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">
                      <div className="flex w-full justify-between">
                        <p className="">Phone</p>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={'+1'}
                        international
                        className="w-full"
                        onChange={(value) => {
                          setFormData({ phoneNumber: value })
                        }}
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
              disabled={!isValidPhoneNumber(formData?.phoneNumber ?? '') || isLoading || timer > 0}>
              {isLoading ? (
                <Loader size="sm" className="fill-new-off-white" />
              ) : (
                <p className="text-title-3-demi">Send me a code</p>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}

      {timer > 0 && (
        <p className="text-center text-body-1-med text-tertiary">
          You have tried too many times. please try after <span className="font-bold">{formatTime()}</span>
        </p>
      )}
    </div>
  )
}
