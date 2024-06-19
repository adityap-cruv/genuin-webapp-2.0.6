'use client'
import icBack from '@icons/icBack.svg'
import { cn } from '@lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import Image from 'next/image'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Feedback } from '@lib/api/settings'
import { useRouter } from 'next/navigation'
import { analyticsService } from '@services/analytics_service'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email.' }),
  issue: z.string(),
})

export default function MainComponent() {
  const isMobile = useGenuinOptions().isMobile
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issue: '',
      email: '',
    },
    mode: 'onBlur',
  })
  const { isValid, isDirty } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { status } = await Feedback({
      email: values.email,
      message: values.issue ?? '',
      type: 'contact_us',
    })
    if (status) {
      form.reset()
      void analyticsService({
        eventName: 'Settings Contact Us Form Sent',
        properties: {},
      })
    }
  }

  return (
    <div className="h-body">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative h-full w-full">
          <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
            {isMobile && (
              <Image
                src={icBack}
                alt="back"
                onClick={() => {
                  router.back()
                  void analyticsService({
                    eventName: 'Settings Closed',
                    properties: {},
                  })
                }}
              />
            )}
            <p className="text-title-2-bold">Contact Us</p>
            {isMobile && (
              <button
                type="submit"
                className={`text-title-3-demi ${!isValid ? 'text-primary-600' : 'text-primary'} `}
                disabled={!isValid || !isDirty}>
                Send
              </button>
            )}
          </div>
          {isMobile && <hr className="bg-monochrome-black/10" />}
          <p className={`${isMobile ? 'm-4 mb-0' : 'mx-8'} text-body-1-med text-monochrome`}>
            Need help, experiencing problems or want to share feedback? Share the details below.
          </p>

          <div className="px-8 py-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="w-full text-body-1-med">Email Address</FormLabel>
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

            <FormField
              name="issue"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">Describe your issue</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        required
                        className={cn(
                          'border-tertiary-200 bg-tertiary-100 p-2 py-3 text-title-3-med',
                          errors && '!border-red'
                        )}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />
          </div>

          <span className="flex flex-col gap-y-3 text-title-3-demi">
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </span>
          {!isMobile && (
            <Button
              variant="default"
              type="submit"
              size={'custom'}
              disabled={!isValid || !isDirty}
              className="absolute -bottom-5 right-8 bg-new-off-black px-6 py-3 hover:bg-new-dark-grey">
              <p className="text-new-para-2 text-tertiary-100">Send</p>
            </Button>
          )}
        </form>
      </Form>
    </div>
  )
}
