import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn, deleteSearchParam } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUser } from '@lib/api/auth'
import { useAuthenticationModalStore } from '../store'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { ModalShell } from '../modal-shell'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import Analytics from '@services/analytics'

const passwordSchema = z.object({ password: z.string().min(8) })

export function PasswordInput() {
  const { data: sessionData, update: updateSession } = useSession()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setStep } = useAuthenticationModalStore()
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })
  const { isDirty, isValid } = form.formState
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  // TODO: Handle password here.
  async function onSubmit({ password }: { password: string }) {
    setIsLoading(true)
    try {
      const { status } = await updateUser({ password })
      if (status) {
        await updateSession({
          ...sessionData,
          user: { ...sessionData?.user, isPasswordSet: true },
        })
        pathName.includes('settings') ? setStep('SET_PASSWORD_SUCCESS_NOTE') : setStep('USERNAME_INPUT')
        deleteSearchParam({
          pathName,
          searchParams: searchParams.toString(),
          paramsToDelete: ['email', 'email_verification_status'],
        })
        void Analytics.track({
          eventName: 'ks_password_set',
          properties: {},
        })
      } else {
        throw new Error()
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center text-title-1-demi sm:text-heading-3 ">
        Set your password
      </h3>
      <p className="text-center text-title-3-med">
        You are setting a new password for your account linked to <strong>{email}</strong>
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
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
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red'
                        )}
                        onKeyDown={(e) => {
                          if (e.key === ' ') {
                            e.preventDefault()
                            return false
                          }
                        }}
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
                      (!isDirty || !isValid) && 'text-tertiary-400'
                    )}>
                    {(!isDirty || !isValid) && 'Must be at least 8 characters'}
                    {isValid && 'Looks good!'}
                  </FormMessage>
                </FormItem>
              )
            }}
          />
          <Button
            type="submit"
            disabled={!isDirty || !isValid || isLoading}
            className="flex w-full items-center justify-center border-0">
            {isLoading ? (
              <Loader size="sm" className="fill-new-off-white" />
            ) : (
              <p className="text-title-3-demi text-new-off-white">Save and Proceed</p>
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
