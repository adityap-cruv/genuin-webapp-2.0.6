'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { useEffect, useState } from 'react'
import { ImageInput } from '../components/image-input'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { ModalShell } from '../modal-shell'

const formSchema = z.object({
  displayName: z
    .string()
    .min(3, { message: 'Full Name should have minimum 3 characters.' })
    .max(25, { message: 'Full Name should have maximum 25 characters.' })
    .regex(/^[a-zA-Z0-9 ]+$/i, { message: 'Full Name can only have letters, numbers and spaces.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

export function Signup() {
  const { setStep, formData, setFormData } = useAuthenticationModalStore()
  const brandName = useGenuinOptions().config?.name
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    criteriaMode: 'firstError',
    defaultValues: {
      displayName: formData.displayName,
      email: formData.email,
    },
  })
  const { isValid } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ displayName: value.displayName, email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ displayName, email }: { displayName: string; email: string }) {
    setIsLoading(true)
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center pb-4 text-heading-3 text-secondary">
        Sign up for {brandName ?? 'genuin'}
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <ImageInput />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p className="text-secondary">Full Name</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('displayName')?.length ?? 0}/25</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={25}
                      type="text"
                      className={cn(
                        'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p className="text-secondary">Email</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={cn(
                        'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
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
          <span className="flex flex-col gap-y-3 text-title-3-demi">
            <Button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg"
              disabled={!isValid || isLoading}>
              {isLoading ? (
                <Loader size="sm" className="fill-new-off-white" />
              ) : (
                <p className="text-title-3-demi text-new-off-white">Verify Email</p>
              )}
            </Button>
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </span>
        </form>
        <p className="py-4 text-center text-cap-1-med text-tertiary-400">
          By registering, you agree to {brandName ?? 'genuin'}’s&nbsp;
          <Link href={PATH_NAME.terms} target="_blank" className="break-keep text-primary">
            Terms of Service
          </Link>
          &nbsp;and&nbsp;
          <Link className="text-primary" target="_blank" href={PATH_NAME.privacy}>
            Privacy
          </Link>
        </p>
        <p className="flex w-full items-center justify-center text-body-1-demi text-secondary">
          Already have an account?
          <span
            className="cursor-pointer text-primary"
            onClick={() => {
              setStep('EMAIL_INPUT')
            }}>
            &nbsp;Log in
          </span>
        </p>
      </Form>
    </ModalShell>
  )
}
