'use client'
import { Form, FormControl, FormField, FormItem, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { type ScreenProps } from '.'
import { sendOtp } from '../api/auth'

export function EditEmail({ onNext }: ScreenProps) {
  const { setFormData, formData } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)
  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { email: formData.email },
  })
  const { isValid, isDirty } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ email }: { email: string }) {
    setIsLoading(true)
    try {
      const response = await sendOtp({ email, isUpdate: true })
      if (response.codeSent) {
        onNext()
      } else {
        form.control.setError('root', { message: response.message })
      }
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-demi sm:text-heading-3">Email</p>
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
                    <FormControl>
                      <Input
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-med text-tertiary')}>
                      Verifying your email helps secure your account.
                    </FormMessage>
                  </FormItem>
                )
              }}
            />
            <Button type="submit" variant="default" className="w-full" disabled={!isValid || isLoading || !isDirty}>
              {isLoading ? (
                <Loader className="stroke-new-off-white" size="sm" />
              ) : (
                <p className="text-title-3-demi">Save</p>
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
    </ModalShell>
  )
}
