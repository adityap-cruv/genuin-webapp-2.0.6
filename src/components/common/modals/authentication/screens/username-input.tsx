import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useAuthenticationModalStore } from '../store'
import { updateUser, validateUsername } from '../api/auth'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { ModalShell } from '../modal-shell'
import { useSession } from 'next-auth/react'
import Analytics from '@services/analytics'
import { type ScreenProps } from '.'

const usernameSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Usernames can only use letters, numbers, underscores, and periods.' }),
})

export function UsernameInput({ onNext }: ScreenProps) {
  const { data: sessionData, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const { setFormData, formData } = useAuthenticationModalStore()
  // prefield username is always valid.
  const [isUsernameValid, setIsUsernameValid] = useState(true)
  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    mode: 'onBlur',
    defaultValues: { username: '' },
  })
  const { isValid, isDirty } = form.formState

  useEffect(() => {
    const watch = form.watch((value) => {
      setFormData({ username: value.username })
    })
    return () => {
      watch.unsubscribe()
    }
  }, [form.watch])

  useEffect(() => {
    if (isValid && !isDirty) {
      form.clearErrors()
      setIsUsernameValid(true)
    }
    const validateUser = setTimeout(async () => {
      if (formData.username && formData.username?.length > 0 && isDirty) {
        const usernameAvailable = await validateUsername(formData.username ?? '')
        if (!usernameAvailable) {
          form.setError('username', { message: 'This username isn’t available. Choose a different username.' })
        } else {
          form.clearErrors()
        }
        setIsUsernameValid(usernameAvailable ?? false)
      }
    }, 500)

    return () => {
      clearTimeout(validateUser)
    }
  }, [formData.username, isValid, isDirty])

  async function onSubmit({ username }: { username: string }) {
    setIsLoading(true)
    try {
      if (isUsernameValid) {
        const { status } = await updateUser({ nickname: username })
        if (status) {
          await updateSession({
            ...sessionData,
            user: { ...sessionData?.user, nickname: username },
          })
          onNext()
          void Analytics.track({
            eventName: 'Ks Username Set ',
            properties: { username },
          })
        }
      } else {
        form.setError('username', { message: 'This username isn’t available. Choose a different username.' })
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <div>
        <h3 className="flex w-full items-center justify-center text-title-1-demi sm:text-heading-3 ">
          Create username
        </h3>
        <p className="flex w-full justify-center text-title-3-med text-tertiary">Enter a name to show on your videos</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="pb-6 sm:w-full">
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p className="">Username</p>
                      <p className="text-cap-1-med ">{form.getValues('username')?.length ?? 0}/25</p>
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
          <Button
            type="submit"
            disabled={!isUsernameValid || isLoading || !isValid}
            className="mt-4 flex w-full items-center justify-center border-0">
            {isLoading ? (
              <Loader size="sm" className="fill-new-off-white" />
            ) : (
              <p className="text-title-3-demi text-new-off-white">Save and proceed</p>
            )}
          </Button>
          {form.formState.errors.root && (
            <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>
      </Form>
    </ModalShell>
  )
}
