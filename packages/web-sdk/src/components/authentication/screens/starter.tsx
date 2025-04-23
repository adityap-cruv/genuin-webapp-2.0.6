import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { ModalShell } from '../modal-shell'
import { FooterInfo } from '../components/footer-info'
import { PhoneInput } from '@/components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
// import { Loader } from '@/components/ui/loader'
import { Loader } from '@/components/loader'
import { type ScreenProps } from '.'
import { sendOtp } from '../api/auth'
import { useAuthModalContext } from '@/components/authentication/context'

export function Starter({ onNext }: ScreenProps) {
  const { formData } = useAuthModalContext()

  return (
    <ModalShell>
      <span className='text-center'>
        <h3
          className='text-title-1-demi'
          style={{ fontSize: '32px' }}>
          Log in or sign up
        </h3>
        <p className='pt-3 text-title-3-med text-secondary-300'>
          We'll send you a code to log in or create an account.
        </p>
      </span>
      <div className='w-full'>
        {formData.flowType === 'email' ? (
          <EmailForm onNext={onNext} />
        ) : (
          <NumberForm onNext={onNext} />
        )}
      </div>
      <FooterInfo />
    </ModalShell>
  )
}

const emailFormSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email.' }),
})

function EmailForm({ onNext }: { onNext: () => void }) {
  const { setFormData, formData } = useAuthModalContext()
  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    mode: 'onBlur',
    defaultValues: {
      email: formData.email,
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const { isValid } = form.formState

  useEffect(() => {
    const watching = form.watch((value) => {
      setFormData({ email: value.email })
    })
    return () => {
      watching.unsubscribe()
    }
  }, [form.watch])

  async function handleSubmit({ email }: { email: string }) {
    setIsLoading(true)
    const response = await sendOtp({ email })
    if (response.codeSent) {
      onNext()
    } else {
      const minutes = Math.floor(response.retryTime / 60)
      if (minutes >= 1) {
        const leftSeconds = response.retryTime % 60
        form.setError('email', {
          message: `Please try again after ${minutes < 10 ? `0${minutes}` : minutes}:${
            leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds
          } minutes!`,
        })
      } else {
        form.setError('email', {
          message: `Please try again after 00:${
            response.retryTime < 10
              ? `0${response.retryTime}`
              : response.retryTime
          }!`,
        })
      }
    }
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => {
            const errors = useFormField().error
            return (
              <FormItem className='sm:w-full'>
                <FormControl>
                  <Input
                    placeholder='Enter Email'
                    className={cn(
                      'border border-tertiary-200 bg-tertiary-100 !text-title-3-med placeholder:!text-tertiary-300',
                      errors && '!border-red-500',
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
          type='submit'
          className='w-full'
          disabled={!isValid || isLoading}>
          {isLoading ? (
            <Loader className='fill-white' />
          ) : (
            <p className='text-body-1-demi text-white'>Continue</p>
          )}
        </Button>
      </form>
    </Form>
  )
}

const phoneNumberSchema = z.object({ phone: z.string() })

function NumberForm({ onNext }: { onNext: () => void }) {
  const { setFormData, formData } = useAuthModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof phoneNumberSchema>>({
    resolver: zodResolver(phoneNumberSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: formData.phoneNumber ?? '+1',
    },
  })

  async function onSubmit() {
    setIsLoading(true)
    const response = await sendOtp({ phoneNumber: formData.phoneNumber })
    if (response.codeSent) {
      onNext()
    } else {
      form.setError('phone', {
        message: response.message,
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    return () => {
      if (!isValidPhoneNumber(form.getValues().phone)) {
        setFormData({ phoneNumber: '' })
      }
    }
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => {
            return (
              <FormItem className='sm:w-full'>
                <FormControl>
                  <PhoneInput
                    value={field.value as any}
                    international
                    className='w-full'
                    onChange={(value) => {
                      form.setValue('phone', value)
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
          type='submit'
          variant='default'
          className='w-full'
          disabled={
            !isValidPhoneNumber(formData.phoneNumber ?? '') || isLoading
          }>
          {isLoading ? (
            <Loader className='fill-white' />
          ) : (
            <p className='text-body-1-demi text-white'>Continue</p>
          )}
        </Button>
      </form>
    </Form>
  )
}
