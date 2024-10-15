import { isValidPhoneNumber } from 'react-phone-number-input'
import { PhoneInput } from '@components/ui/phone-input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/ui/form'
import { useState } from 'react'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'
import { type ScreenProps } from '.'
import { sendOtp } from '../api/auth'

const formSchema = z.object({
  phone: z.string(),
})

export function EditNumber({ onNext }: ScreenProps) {
  const { formData, setFormData } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: formData.phoneNumber,
    },
  })

  async function onSubmit() {
    setIsLoading(true)
    try {
      const response = await sendOtp({ phoneNumber: formData.phoneNumber, isUpdate: true })
      if (response.codeSent) {
        onNext()
      } else {
        form.control.setError('phone', { message: response.message })
      }
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-demi sm:text-heading-3">Phone</p>
      <div className="w-full">
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
                        value={'+1' as any}
                        international
                        className="w-full"
                        onChange={(value) => {
                          setFormData({ phoneNumber: value })
                        }}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-med text-tertiary')}>
                      Verifying your phone number helps secure your account.
                    </FormMessage>
                  </FormItem>
                )
              }}
            />
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={!isValidPhoneNumber(formData.phoneNumber ?? '') || isLoading}>
              {isLoading ? (
                <Loader size="sm" className="fill-new-off-white" />
              ) : (
                <p className="text-title-3-demi">Save</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
      {form.formState.errors.root && (
        <p className="flex items-center justify-center text-center text-title-3-med text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  )
}
