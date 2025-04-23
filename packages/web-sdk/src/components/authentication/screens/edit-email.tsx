import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@/utils'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { ModalShell } from '../modal-shell'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { type ScreenProps } from '.'
import { sendOtp } from '../api/auth'
import { useAuthModalContext } from '@/components/authentication/context'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter valid email.' }),
})

/**
 * Edit email modal is used in settings page.
 * @returns
 */
export function EditEmail({ onNext }: ScreenProps) {
  const { setFormData, formData, isOpen } = useAuthModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [initialEmail, setInitialEmail] = useState(formData.email)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { email: formData.email },
  })
  const { isValid, isDirty } = form.formState

  // Store the initial email when the component mounts
  useEffect(() => {
    setInitialEmail(formData.email)
  }, [])

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  // Reset email when modal closes without saving
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: initialEmail }) // Restore initial value
    }
  }, [isOpen])

  async function onSubmit({ email }: { email: string }) {
    setIsLoading(true)
    try {
      const response = await sendOtp({ email, isUpdate: true })
      if (response.codeSent && response.responseCode === 200) {
        onNext()
      } else {
        form.control.setError('email', {
          message:
            response.message ?? 'Something went wrong. Please try again!',
        })
      }
    } catch (e) {
      form.control.setError('root', {
        message: 'Something went wrong. Please try again!',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className='text-center text-title-1-demi sm:text-heading-3'>Email</p>
      <div className='w-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className='sm:w-full'>
                    <FormControl>
                      <Input
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red-500',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage
                      className={cn('!text-cap-1-med text-tertiary')}>
                      Verifying your email helps secure your account.
                    </FormMessage>
                  </FormItem>
                )
              }}
            />
            <Button
              type='submit'
              variant='default'
              className='w-full'
              disabled={!isValid || isLoading || !isDirty}>
              {isLoading ? (
                <Loader className='fill-white' />
              ) : (
                <p className='text-title-3-demi text-white'>Save</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
      {form.formState.errors.root && (
        <p className='flex items-center justify-center text-center text-title-3-med text-supplementary-red'>
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  )
}
