'use client'

import { cn } from '@/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { postFeedback } from '../api'
import { useSizeContext } from '@/context/size'
import { Header } from '../header'
import { useMutation } from '@tanstack/react-query'
import { Loader } from '@/components/loader'
import { toast } from '@/components/ui/use-toast'
import { Analytics } from '@/analytics'

// Define the form schema outside the component for better reusability
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email.' }),
  issue: z.string().min(1, { message: 'Please describe your issue.' }),
})

export function ContactUsForm() {
  const { isMobile } = useSizeContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issue: '',
      email: '',
    },
    mode: 'onBlur',
  })

  const { isValid, isDirty } = form.formState

  const mutation = useMutation({
    mutationFn: postFeedback,
    onSuccess: () => {
      form.reset()
      toast({
        description: 'Your message has been sent successfully.',
      })
      Analytics.track(Analytics.EventNames.SettingsContactUsFormSent)
    },
    onError: () => {
      form.setError('root', {
        message: 'Failed to send message. Please try again later.',
      })
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      email: values.email,
      message: values.issue,
      type: 'contact_us',
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='relative h-full w-full'>
        <Header
          title='Contact Us'
          submitText='Send'
          submitDisabled={!isValid || !isDirty || mutation.isPending}
          showSubmitButton={isMobile}
        />
        <div className='px-4 md:px-8 h-full w-full'>
          <p className={cn(`py-4 text-body-1-med text-tertiary`)}>
            Need help, experiencing problems or want to share feedback? Share
            the details below.
          </p>

          <FormField
            control={form.control}
            name='email'
            render={({ field, fieldState }) => (
              <FormItem className='sm:w-full'>
                <FormLabel className='w-full text-body-1-med'>
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    className={cn(
                      'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                      fieldState.error && '!border-red',
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='!text-cap-1-demi' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='issue'
            render={({ field, fieldState }) => (
              <FormItem className='sm:w-full'>
                <FormLabel className='text-body-1-med'>
                  Describe your issue
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className={cn(
                      'border-tertiary-200 bg-tertiary-100 p-2 py-3 text-title-3-med',
                      fieldState.error && '!border-red',
                    )}
                  />
                </FormControl>
                <FormMessage className='!text-cap-1-demi' />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className='flex items-center justify-center'>
              <p className='text-title-3-med text-supplementary-red'>
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          {!isMobile && (
            <Button
              variant='default'
              type='submit'
              size='custom'
              disabled={!isValid || !isDirty}
              className='absolute bottom-4 right-8 px-6 py-2'>
              {mutation.isPending ? (
                <Loader className='fill-white stroke-white h-4 w-4' />
              ) : (
                <p className='text-new-para-2 text-tertiary-100'>Send</p>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
