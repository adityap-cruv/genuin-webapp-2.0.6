'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { useEffect } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import phone_icon from '@icons/icPhone.svg'
import { PATH_NAME } from '@lib/utils/constants/path'

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
    <ModalShell>
      <p className="text-heading-3 text-center">Log in to Ted</p>
      <div className="w-full">
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
                  <FormLabel className="w-full text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Email</p>
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
      </div>

      <p className="text-title-3-demi text-monochrome">OR</p>
      <Button
        variant="outline"
        className="w-full border border-monochrome-9"
        onClick={() => {
          setStep('NUMBER_INPUT')
        }}>
        <div className="relative flex w-full items-center justify-center">
          <img src={phone_icon.src} className="absolute left-0 h-5 w-5" alt="at" />
          <p className="text-title-3-demi">Use phone</p>
        </div>
      </Button>
      <p className="text-new-para-2-mobile">
        By registering, you agree to Ted's
        <Link href={PATH_NAME.terms}>
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={PATH_NAME.privacy}>
          <span className="text-primary"> Privacy</span>
        </Link>
      </p>
      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?{' '}
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
