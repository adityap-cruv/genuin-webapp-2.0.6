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
import { useAuthenticationModalStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const TABS_TRIGGER_CLASS =
  'rounded-lg border-none py-2 !text-title-3-med data-[state=active]:!text-title-3-demi text-secondary-300 data-[state=active]:bg-monochrome-white data-[state=active]:text-primary'

export function Starter() {
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
      <Tabs className="w-full" defaultValue="email">
        <TabsList className="h-14 rounded-lg bg-tertiary-200 p-2">
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="email">
            Email
          </TabsTrigger>
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="number">
            Number
          </TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <EmailForm />
        </TabsContent>
        <TabsContent value="number">
          <NumberForm />
        </TabsContent>
      </Tabs>
      <FooterInfo />
    </ModalShell>
  )
}

const emailFormSchema = z.object({ email: z.string().email({ message: 'Please enter valid email.' }) })

function EmailForm() {
  const form = useForm<z.infer<typeof emailFormSchema>>({ resolver: zodResolver(emailFormSchema), mode: 'onBlur' })
  const { isValid } = form.formState
  return (
    <Form {...form}>
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
      <Button className="w-full" disabled={!isValid}>
        <p className="text-body-1-demi">Continue</p>
      </Button>
    </Form>
  )
}

const phoneNumberSchema = z.object({ phone: z.string() })

function NumberForm() {
  const { formData, setFormData } = useAuthenticationModalStore(
    useShallow((state) => {
      return {
        setStep: state.setStep,
        setFormData: state.setFormData,
        formData: state.formData,
      }
    })
  )
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof phoneNumberSchema>>({
    resolver: zodResolver(phoneNumberSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: '',
    },
  })

  useEffect(() => {
    if (!isValidPhoneNumber(formData.phone ?? '')) form.clearErrors()
  }, [formData.phone])

  function onSubmit() {
    setIsLoading(true)
    alert('handle submit')
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
                    value="+1"
                    international
                    className="w-full"
                    onChange={(phone) => {
                      setFormData({ phone })
                    }}
                  />
                </FormControl>
                <FormMessage className={cn('!text-cap-1-demi')} />
              </FormItem>
            )
          }}
        />
        <Button type="submit" variant="default" className="w-full" disabled={!isValidPhoneNumber(formData.phone ?? '')}>
          {isLoading ? (
            <Loader size="sm" className="fill-new-off-white" />
          ) : (
            <p className="text-title-3-demi">Continue</p>
          )}
        </Button>
      </form>
    </Form>
  )
}
