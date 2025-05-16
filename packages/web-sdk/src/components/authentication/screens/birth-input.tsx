import { type ScreenProps } from '.'
import { ModalShell } from '../modal-shell'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  useFormField,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { useState } from 'react'
import '../css/date-picker.css'
import { patchUserDetails } from '../api/auth'
import { useAuth } from '@/context/auth'
import { useAuthModalContext } from '@/components/authentication/context'

const formSchema = z.object({
  birth: z.preprocess((arg) => {
    if (typeof arg === 'string') return new Date(arg)
  }, z.date()),
})

const minDate = new Date()
minDate.setFullYear(new Date().getFullYear() - 100)

const maxDate = new Date()
maxDate.setFullYear(new Date().getFullYear() - 18)

const suggestionDate = new Date()
suggestionDate.setFullYear(new Date().getFullYear() - 23)
suggestionDate.setMonth(0)
suggestionDate.setDate(1)

function getCurrentDate(str: string) {
  const [day, month, year] = str.split('/').map((value) => Number(value))
  let date
  if (year && month && day) date = new Date(Date.UTC(year, month - 1, day))
  if (date) return date.toISOString().split('T')[0]
}

/**
 * Birth input modal is used in settings page.
 * @returns
 */
export function BirthInput({ onNext }: ScreenProps) {
  const { formData } = useAuthModalContext()

  const [isLoading, setIsLoading] = useState(false)
  const { updateUser } = useAuth()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birth: formData.birth
        ? (getCurrentDate(formData.birth) ?? '')
        : suggestionDate.toISOString().split('T')[0],
    },
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
    if (date > new Date()) {
      form.setError('birth', { message: 'Please enter a valid date.' })
      return
    }

    try {
      const response = await patchUserDetails({ birthday: formattedDate })
      if (response.status) {
        updateUser({ birth: formattedDate })
        onNext()
      }
    } catch (e) {
      form.setError('root', {
        message: 'Something went wrong. Please try again!',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <p className='text-center text-title-1-demi sm:text-heading-3'>
        Birthdate
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full'>
          <FormField
            control={form.control}
            name='birth'
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className='sm:w-full'>
                  <FormControl>
                    <Input
                      max={maxDate.toISOString().split('T')[0]}
                      min={minDate.toISOString().split('T')[0]}
                      type='date'
                      className={cn(
                        'w-full border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                        errors && '!border-red-500',
                      )}
                      {...field}
                    />
                  </FormControl>
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
      {form.formState.errors.root && (
        <p className='text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red'>
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  )
}
