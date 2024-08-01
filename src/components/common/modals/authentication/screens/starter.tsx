import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Form, FormControl, FormItem, FormField, FormMessage, useFormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModalShell } from '../modal-shell'
import { FooterInfo } from '../components/footer-info'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PhoneInput } from '@components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Loader } from '@/components/ui/loader'
import { useState, useEffect } from 'react'
import { type FlowType, useAuthenticationModalStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import { type ScreenProps } from '.'
import { sendOtp } from '../api/auth'

const TABS_TRIGGER_CLASS =
  'rounded-lg border-none py-2 !text-title-3-med data-[state=active]:!text-title-3-demi text-secondary-300 data-[state=active]:bg-monochrome-white data-[state=active]:text-primary'

export function Starter({ onBack, onNext }: ScreenProps) {
  const { flowType, setFormData } = useAuthenticationModalStore(
    useShallow((state) => ({ flowType: state.formData.flowType, setFormData: state.setFormData }))
  )

  return (
    <ModalShell>
      <span className="text-center">
        <h3 className="text-title-1-demi" style={{ fontSize: '32px' }}>
          Log in or sign up
        </h3>
        <p className="pt-3 text-title-3-med text-secondary-300">
          We'll send you a code to log in or create an account.
        </p>
      </span>
      <Tabs
        className="w-full"
        defaultValue={flowType}
        onValueChange={(value) => {
          setFormData({ flowType: value as FlowType })
        }}>
        <TabsList className="h-14 rounded-lg bg-tertiary-200 p-2">
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="email">
            Email
          </TabsTrigger>
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="phone">
            Phone
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailForm onNext={onNext} />
        </TabsContent>
        <TabsContent value="phone">
          <NumberForm onNext={onNext} />
        </TabsContent>
      </Tabs>
      <FooterInfo />
    </ModalShell>
  )
}

const emailFormSchema = z.object({ email: z.string().email({ message: 'Please enter valid email.' }) })

function EmailForm({ onNext }: { onNext: () => void }) {
  const { setFormData, email } = useAuthenticationModalStore(
    useShallow((state) => ({
      setFormData: state.setFormData,
      email: state.formData.email,
    }))
  )
  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    mode: 'onBlur',
    defaultValues: {
      email,
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
            response.retryTime < 10 ? `0${response.retryTime}` : response.retryTime
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
          name="email"
          render={({ field }) => {
            const errors = useFormField().error
            return (
              <FormItem className="sm:w-full">
                <FormControl>
                  <Input
                    placeholder="Enter Email"
                    className={cn(
                      'border border-tertiary-200 bg-tertiary-100 !text-title-3-med placeholder:!text-tertiary-300',
                      errors && '!border-red'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn('!text-cap-1-demi')} />
              </FormItem>
            )
          }}
        />
        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
          {isLoading ? (
            <Loader size="sm" className="fill-monochrome-white" />
          ) : (
            <p className="text-body-1-demi">Continue</p>
          )}
        </Button>
      </form>
    </Form>
  )
}

const phoneNumberSchema = z.object({ phone: z.string() })

function NumberForm({ onNext }: { onNext: () => void }) {
  const { setFormData, phoneNumber } = useAuthenticationModalStore(
    useShallow((state) => ({
      setFormData: state.setFormData,
      phoneNumber: state.formData.phoneNumber,
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof phoneNumberSchema>>({
    resolver: zodResolver(phoneNumberSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: phoneNumber ?? '+1',
    },
  })

  async function onSubmit() {
    setIsLoading(true)
    const response = await sendOtp({ phoneNumber })
    if (response.codeSent) {
      onNext()
    } else {
      const minutes = Math.floor(response.retryTime / 60)
      if (minutes >= 1) {
        const leftSeconds = response.retryTime % 60
        form.setError('phone', {
          message: `Please try again after ${minutes < 10 ? `0${minutes}` : minutes}:${
            leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds
          } minutes!`,
        })
      } else {
        form.setError('phone', {
          message: `Please try again after 00:${
            response.retryTime < 10 ? `0${response.retryTime}` : response.retryTime
          }!`,
        })
      }
    }
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            return (
              <FormItem className="sm:w-full">
                <FormControl>
                  <PhoneInput
                    value={field.value}
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
          disabled={!isValidPhoneNumber(phoneNumber ?? '') || isLoading}>
          {isLoading ? (
            <Loader size="sm" className="fill-new-off-white" />
          ) : (
            <p className="text-body-1-demi">Continue</p>
          )}
        </Button>
      </form>
    </Form>
  )
}
