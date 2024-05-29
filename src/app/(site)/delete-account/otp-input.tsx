'use client'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/ui/form'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { Loader } from '@components/ui/loader'
import { useDeleteAccountStore } from './store'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'
import icBack from '@icons/icBack.svg'
import icConfirmationTick from '@icons/icConfirmationTick.svg'
import { deleteUserAccount, sendAccountDeleteCode, verifyAccountDeleteCode } from '@lib/api/delete-account'

const formSchema = z.object({
  otp: z.string(),
})

export function OtpInput() {
  const { setStep, formData, setFormData, previousStep } = useDeleteAccountStore()
  const [isValidOtp, setIsValidOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(formData?.retryTime ?? 30)
  const otpform = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    const w = otpform.watch((value) => {
      const otp = parseInt(value.otp ?? '')
      const isValidLength = otp.toString().length === 6
      setIsValidOtp(isValidLength)
      setFormData({ otp: value.otp })

      if (!isValidLength) {
        otpform.clearErrors()
      }
    })
    return () => {
      w.unsubscribe()
    }
  }, [otpform.watch])

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

  async function otpSubmit() {
    // setStep('DELETE_CONFORMATION')
    setIsLoading(true)
    await verifyAccountDeleteCode({
      otp: formData?.otp,
      userId: formData?.userId,
      deviceType: 3,
    })
      .then(async (res) => {
        if (res?.code === 200) {
          setFormData({ authToken: res.authToken })
          setStep('DELETE_CONFORMATION')
        } else if (res?.code === 1008) {
          otpform.control.setError('root', { message: 'That doesn`t look right. Please check your code and try again' })
        } else if (res?.code === 5025) {
          otpform.control.setError('root', { message: 'The user you are looking for is no longer available.' })
        } else {
          otpform.control.setError('root', { message: 'Something went wrong please try again after sometime!' })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  async function resendOtp(verificationType: number) {
    if (timer <= 0) {
      setIsLoading(true)
      await sendAccountDeleteCode({
        phone: formData?.phoneNumber ?? '',
        verificationType,
      })
        .then(async (res) => {
          if (res?.code === 200) {
            setFormData({ userId: res.data.user_id })
            setStep('OTP_INPUT')
            setTimer(res?.data?.retryTime)
          } else if (res.code === 5025) {
            otpform.control.setError('root', { message: `The user you are looking for is no longer available!` })
          } else {
            otpform.control.setError('root', { message: 'Something went wrong please try again after sometime!' })
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  function formatTime() {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-3">
        <div className="w-full">
          <img
            src={icBack.src}
            alt="back"
            className="hover:cursor-pointer"
            onClick={() => {
              if (previousStep) {
                setStep(previousStep)
              }
            }}
          />
        </div>
        <p className="text-center text-heading-3">Enter code</p>
        <p className="w-full text-center text-title-3-med text-tertiary">
          Enter the 6-digit code sent to: {formData?.phoneNumber}
        </p>
        <div className="w-full">
          <Form {...otpform}>
            <form onSubmit={otpform.handleSubmit(otpSubmit)}>
              <FormField
                control={otpform.control}
                name="otp"
                render={({ field }) => {
                  return (
                    <FormItem className="flex w-auto flex-col items-center p-0 sm:w-full">
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          render={({ slots }) => (
                            <InputOTPGroup>
                              {slots.map((slot, index) => (
                                <InputOTPSlot className="h-10 w-10" key={index} {...slot} />
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
              <div className="py-6">
                {timer <= 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-center text-body-1-med text-tertiary">
                      Didn't get the code?{' '}
                      <span
                        onClick={() => {
                          void resendOtp(1)
                        }}
                        className="font-bold text-primary hover:cursor-pointer">
                        Resend otp
                      </span>
                    </p>
                    <p
                      onClick={() => {
                        void resendOtp(2)
                      }}
                      className="text-center font-bold text-primary hover:cursor-pointer">
                      Call me instead
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-body-1-med text-monochrome">
                    Resend code in <span className="font-bold">{formatTime()}</span>
                  </p>
                )}
              </div>
              <Button type="submit" variant="default" className="w-full" disabled={!isValidOtp || isLoading}>
                {isLoading ? (
                  <Loader size="sm" className="fill-new-off-white" />
                ) : (
                  <p className="text-title-3-demi">Verify</p>
                )}
              </Button>
            </form>
          </Form>
        </div>
        {otpform.formState.errors.root && (
          <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
            {otpform.formState.errors.root.message}
          </p>
        )}
      </div>
    </>
  )
}

export function ConformationMessage() {
  const router = useRouter()
  const { setStep, formData } = useDeleteAccountStore()
  const [isLoading, setIsLoading] = useState(false)

  async function onDelete() {
    // setStep('DELETE_CONFORMATION')
    setIsLoading(true)
    await deleteUserAccount({ authToken: formData?.authToken ?? '' })
      .then(async (res) => {
        if (res?.code === 200) {
          setStep('DELETE_SUCCESS')
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-heading-3">Delete account?</p>
      <p className="text-center text-title-3-med text-tertiary">
        Are you sure you want to delete your Genuin account? Your this action can't be reversed.
      </p>
      <div className="mt-8 flex gap-4">
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          onClick={() => {
            router.replace(PATH_NAME.home())
          }}>
          Cancel
        </Button>
        <Button variant="default" className="w-full bg-red hover:bg-red-40" onClick={onDelete}>
          {isLoading ? (
            <Loader size="sm" className="fill-new-off-white" />
          ) : (
            <p className="text-title-3-demi">Delete</p>
          )}
        </Button>
      </div>
    </div>
  )
}

export function SuccessMessage() {
  const router = useRouter()
  return (
    <>
      <div className="flex flex-col gap-2">
        <img src={icConfirmationTick.src} alt="tick" className="h-12" />
        <p className="text-center text-heading-3">Account deleted!</p>
        <Button
          variant="default"
          className="mt-8 w-full"
          onClick={() => {
            router.replace(PATH_NAME.home())
          }}>
          Back to home
        </Button>
      </div>
    </>
  )
}
