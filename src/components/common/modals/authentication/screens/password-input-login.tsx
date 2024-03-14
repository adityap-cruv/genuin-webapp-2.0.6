import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginViaEmail, updateUser } from '@lib/api/auth'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { LOGIN_SOURCE } from '@lib/constants'
import { useLocalStorage } from '@lib/stores/local-storage'
import { usePathname } from 'next/navigation'

const passwordSchema = z.object({ password: z.string().min(8) })

export function PasswordInputLogin() {
  const { setStep, setFormData, formData, action } = useAuthenticationModalStore()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const pathname = usePathname()
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })

  async function onSubmit({ password }: { password: string }) {
    setIsLoading(true)
    await loginViaEmail({
      email: formData.email,
      deviceId,
      password,
      loginSource: LOGIN_SOURCE.web,
      actionMetaData: { path: pathname, action },
    })
      .then(async (res) => {
        if (res?.code === 200) {
          console.log(res.data)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center text-heading-3">Log in</h3>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                      <div>
                        <div className="relative">
                          <Input
                            maxLength={24}
                            minLength={8}
                            type={passwordVisible ? 'text' : 'password'}
                            className={cn(
                              'border-monochrome-9 bg-monochrome-11 text-title-3-med',
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
                        <p className="mt-2 text-center text-body-1-demi text-monochrome-6">Forgot password?</p>
                      </div>
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />
            <Button type="submit" variant="default" className="w-full bg-new-off-black hover:bg-new-dark-grey">
              <p className="text-title-3-demi">{isLoading ? 'Loading...' : 'Next'}</p>
            </Button>
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </form>
        </Form>
      </div>
      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p>
    </ModalShell>
  )
}
