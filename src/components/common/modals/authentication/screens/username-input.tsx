import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useAuthenticationModalStore } from '../store'

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'There should be minimum 3 characters for username.' })
    .regex(/^[a-zA-Z0-9._-]+$/, { message: 'Please enter valid username.' }),
})

export function UsernameInput() {
  const setFormData = useAuthenticationModalStore().setFormData
  const form = useForm<z.infer<typeof usernameSchema>>({ resolver: zodResolver(usernameSchema), mode: 'onSubmit' })
  const { isDirty, isValid } = form.formState

  useEffect(() => {
    const watch = form.watch((value) => {
      setFormData({ username: value.username })
    })
    return () => {
      watch.unsubscribe()
    }
  }, [form.watch])

  // TODO: handle submit here.
  function onSubmit({ username }: { username: string }) {}

  return (
    <>
      <h3 className="flex w-full items-center justify-center text-heading-3">Create username</h3>
      <p className="flex w-full justify-center pt-3 text-title-3-med text-secondary">
        Enter a name to show on your videos
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Username</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('username')?.length ?? 0}/25</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={25}
                      minLength={8}
                      type="text"
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
            disabled={!isDirty || !isValid}
            className="mt-4 flex items-center justify-center border-0 bg-new-off-black !text-title-3-demi text-new-off-white"
            value="Save and proceed"
          />
        </form>
      </Form>
    </>
  )
}
