import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useEffect, useMemo, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/utils'
import { Loader } from '@/components/loader'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { type ScreenProps } from '.'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { consumeOtp, sendOtp, updateEmailOrPhone } from '../api/auth'
import { useAuth } from '@/context/auth'
import { useAuthModalContext } from '@/components/authentication/context'

const formSchema = z.object({
  otp: z.string(),
})

const OTP_LENGTH = 6

type PropertiesType = { email?: string; phoneNumber?: string }
type VerificationType = 'email' | 'number' | 'login'
type OtpInputProps = {
  verificationType: VerificationType
  title?: string
} & ScreenProps

export function OtpInput({
  title,
  verificationType,
  onNext,
  onBack,
}: OtpInputProps) {
  const { formData, close } = useAuthModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const { updateUser, signIn } = useAuth()
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
      const isValidLength = value.otp?.length === 6
      if (isValidLength) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }

      if (!isValidLength) {
        form.control.setError('root', { message: '' })
      }
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ otp }: { otp: string }) {
    setIsLoading(true)
    const properties: PropertiesType = {
      email: undefined,
      phoneNumber: undefined,
    }
    if (verificationType === 'login') {
      formData.flowType === 'email'
        ? (properties.email = formData.email)
        : (properties.phoneNumber = formData.phoneNumber)
      const data = await consumeOtp({ code: otp, ...properties })
      if (data.otpVerified) {
        data.user && signIn(data.user)
        if (!data.user?.brandGuidelines) {
          onNext()
        } else if (!data.user.hasTopics) {
          onNext('CATEGORY_SELECTION')
        } else if (!data.user.usernameSet) {
          onNext('USERNAME_INPUT')
        } else {
          close()
        }
      } else {
        form.setError('otp', { message: 'Invalid OTP' })
      }
    } else {
      const response = await updateEmailOrPhone(otp)
      if (response.verified) {
        if (verificationType === 'email') {
          updateUser({ email: formData.email })
        } else {
          updateUser({ phoneNumber: formData.phoneNumber })
        }
        onNext()
      } else {
        form.setError('root', { message: 'Invalid OTP' })
      }
    }
    setIsLoading(false)
  }

  const isFlowEmail = useMemo(() => {
    if (verificationType === 'login') {
      return formData.flowType === 'email'
    }
    return verificationType === 'email'
  }, [verificationType, formData.flowType])

  return (
    <ModalShell onBack={onBack}>
      <div className='flex flex-col items-center'>
        <p className='mb-6 text-center text-title-1-demi sm:text-heading-3'>
          {title ?? 'Enter code'}
        </p>
        <p className='w-full text-center text-title-3-med text-secondary-300'>
          Please Enter the 6-digit code sent to your
          {`${isFlowEmail ? ' email address' : ' phone number'}`}
          <span className='text-title-3-demi text-secondary'>{`: ${
            isFlowEmail
              ? formData.email
              : formatPhoneNumberIntl(formData.phoneNumber ?? '')
          }`}</span>
        </p>
        <div className='w-full'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='otp'
                render={({ field }) => {
                  return (
                    <FormItem className='flex flex-col items-center sm:w-full'>
                      <FormControl>
                        <InputOTP
                          autoFocus
                          maxLength={OTP_LENGTH}
                          className='w-full'
                          render={({ slots }) => (
                            <InputOTPGroup>
                              {slots.map((slot, index) => (
                                <InputOTPSlot
                                  key={index}
                                  {...slot}
                                  className='rounded-lg border border-tertiary-200 bg-tertiary-100 focus:border-tertiary-300'
                                />
                              ))}
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
              <TimerMessage
                time={30}
                verificationType={verificationType}
              />
              <Button
                type='submit'
                variant='default'
                className='mt-2 w-full'
                disabled={isLoading || !isValid}>
                {isLoading ? (
                  <Loader className='fill-white' />
                ) : (
                  <p className='text-title-3-demi text-white'>Verify</p>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      {form.formState.errors.root && (
        <p className='text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red'>
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  )
}

function TimerMessage({
  time,
  verificationType,
}: {
  verificationType: VerificationType
  time: number
}) {
  const { formData } = useAuthModalContext()
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [timer, setTimer] = useState(time)

  async function handleResendOtp() {
    setIsSendingOtp(true)
    if (verificationType === 'login') {
      const properties: PropertiesType = {
        email: undefined,
        phoneNumber: undefined,
      }
      formData.flowType === 'email'
        ? (properties.email = formData.email)
        : (properties.phoneNumber = formData.phoneNumber)
      const response = await sendOtp({ ...properties })
      setTimer(response.retryTime)
    } else {
      const response =
        verificationType === 'email'
          ? await sendOtp({ email: formData.email, isUpdate: true })
          : await sendOtp({ phoneNumber: formData.phoneNumber, isUpdate: true })
      setTimer(response.retryTime)
    }
    setIsSendingOtp(false)
  }

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

  return timer <= 0 ? (
    <Button
      variant='custom'
      type='button'
      disabled={isSendingOtp}
      className='w-full cursor-pointer text-center text-body-1-med text-primary'
      onClick={handleResendOtp}>
      Resend code
    </Button>
  ) : (
    <p className='text-center text-body-1-med'>
      Resend code in{' '}
      <span className='text-foreground'>{`00:${timer.toString().padStart(2, '0')}`}</span>
    </p>
  )
}
