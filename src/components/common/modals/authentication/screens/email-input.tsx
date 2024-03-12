'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { useEffect } from 'react'

export function EmailInput() {
  const { setStep, setFormData, formData } = useAuthenticationModalStore()
  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: { email: formData.email },
  })

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  return (
    <>
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            const errors = useFormField().error
            return (
              <FormItem>
                <FormLabel className="text-body-1-med">
                  <div className="flex w-full justify-between">
                    <p>Email</p>
                    <p
                      className="cursor-pointer"
                      onClick={() => {
                        setStep('NUMBER_INPUT')
                      }}>
                      Log in with phone
                    </p>
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
        <Input
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-new-off-black text-title-3-demi text-monochrome-white"
        />
      </Form>
      <p className="flex w-full items-center justify-center pt-2 text-body-1-demi">
        Don't have an account?{' '}
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p>
    </>
  )
}
