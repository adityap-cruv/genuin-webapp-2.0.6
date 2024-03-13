import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUser } from '@lib/api/auth'
import { useAuthenticationModalStore } from '../store'

const passwordSchema = z.object({ password: z.string().min(8) })

export function PasswordInput() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const setStep = useAuthenticationModalStore().setStep
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })
  const { isDirty, isValid } = form.formState

  // TODO: Handle password here.
  async function onSubmit({ password }: { password: string }) {
    setIsLoading(true)
    try {
      const ans = await updateUser({ password })
      if (ans) {
        setStep('USERNAME_INPUT')
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h3 className="flex w-full items-center justify-center text-heading-3">Set your password</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Password</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        maxLength={24}
                        minLength={8}
                        type={passwordVisible ? 'text' : 'password'}
                        className={cn('border-monochrome-9 bg-monochrome-11 text-title-3-med', errors && '!border-red')}
                        {...field}
                      />
                      <div className="absolute right-4 top-0 flex h-full items-center">
                        {!passwordVisible ? (
                          <EyeOffIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible(true)
                            }}
                          />
                        ) : (
                          <EyeIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible(false)
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage
                    className={cn(
                      '!text-cap-1-demi',
                      isValid && 'text-supplementary-green',
                      (!isDirty || !isValid) && 'text-monochrome-6'
                    )}>
                    {(!isDirty || !isValid) && 'Must be at least 8 characters'}
                    {isValid && 'Looks good!'}
                  </FormMessage>
                </FormItem>
              )
            }}
          />
          <Input
            type="submit"
            disabled={!isDirty || !isValid || isLoading}
            className="flex items-center justify-center border-0 bg-new-off-black !text-title-3-demi text-new-off-white"
            value="Save and proceed"
          />
          {form.formState.errors.root && (
            <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>
      </Form>
    </>
  )
}
