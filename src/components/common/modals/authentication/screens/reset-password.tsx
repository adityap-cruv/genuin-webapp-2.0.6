import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn, deleteSearchParam } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthenticationModalStore } from '../store'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { ModalShell } from '../modal-shell'
import { usePathname, useSearchParams } from 'next/navigation'
import { setForgotPassword } from '@lib/api/auth-passwords'

const passwordSchema = z.object({ password: z.string().min(8) })

export function ResetPassword() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setStep } = useAuthenticationModalStore()
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })
  const { isDirty, isValid } = form.formState
  const pathName = usePathname()
  const searchParams = useSearchParams()

  async function onSubmit({ password }: { password: string }) {
    const forgotPasswordToken = searchParams.get('token') ?? ''
    setIsLoading(true)
    try {
      const { code } = await setForgotPassword({ password, forgotPasswordToken })
      if (code === 200) {
        deleteSearchParam({
          pathName,
          searchParams: searchParams.toString(),
          paramsToDelete: ['reset_password_status', 'token'],
        })
        setStep('RESET_PASSWORD_SUCCESS_NOTE')
      } else {
        form.control.setError('root', { message: 'Something went wrong. Please try again!' })
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center text-title-1-demi sm:text-heading-3 ">Reset Password</h3>
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
                      <p>New Password</p>
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
              <p className="text-title-3-demi text-new-off-white">Save</p>
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
