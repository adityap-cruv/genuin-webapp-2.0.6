import { type ScreenProps } from '.'
import { ModalShell } from '../modal-shell'
import { Form, FormField, FormItem, FormControl, useFormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { useState } from 'react'
import '../css/date-picker.css'
import { updateUser } from '../api/auth'
import { useSession } from 'next-auth/react'

const formSchema = z.object({
  birth: z.preprocess((arg) => {
    if (typeof arg === 'string') return new Date(arg)
  }, z.date()),
})

const minDate = new Date()
minDate.setFullYear(new Date().getFullYear() - 100)

const maxDate = new Date()
maxDate.setFullYear(new Date().getFullYear() - 18)

export function BirthInput({ onNext }: ScreenProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: sessionData, update: updateSession } = useSession()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { birth: '' },
    criteriaMode: 'firstError',
    mode: 'onBlur',
  })
  const { isValid, isDirty } = form.formState

  async function onSubmit({ birth }: { birth: string }) {
    setIsLoading(true)
    const date = new Date(birth)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based in JavaScript
    const year = date.getFullYear()
    const formattedDate = `${day}/${month}/${year}`
    // console.log('ans;:', new Date(birth).toLocaleDateString())
    if (date > new Date()) {
      form.setError('birth', { message: 'Please enter a valid date.' })
      return
    }

    try {
      const response = await updateUser({ birthday: formattedDate })
      if (response.status) {
        await updateSession({ ...sessionData, user: { ...sessionData?.user, birth: formattedDate } }).then((_) => {
          onNext()
        })
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className="text-center text-title-1-demi sm:text-heading-3">Birthdate</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="birth"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
                  <FormControl>
                    <Input
                      max={maxDate.toISOString().split('T')[0]}
                      min={minDate.toISOString().split('T')[0]}
                      type="date"
                      className={cn(
                        'w-full border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                        errors && '!border-red'
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )
            }}
          />
          <Button type="submit" variant="default" className="w-full" disabled={!isValid || isLoading || !isDirty}>
            {isLoading ? (
              <Loader className="fill-monochrome-white" size="sm" />
            ) : (
              <p className="text-title-3-demi">Save</p>
            )}
          </Button>
        </form>
      </Form>
      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  )
}
