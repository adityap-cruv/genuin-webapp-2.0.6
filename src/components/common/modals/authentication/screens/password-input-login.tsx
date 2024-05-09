import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginViaEmail } from '@lib/api/auth'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import { LOGIN_SOURCE } from '@lib/constants'
import { useLocalStorage } from '@lib/stores/local-storage'
import { usePathname } from 'next/navigation'
import { Loader } from '@components/ui/loader'
import { signIn } from 'next-auth/react'

const passwordSchema = z.object({ password: z.string().min(8) })

export function PasswordInputLogin() {
  const { close, formData, action } = useAuthenticationModalStore()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const pathname = usePathname()
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })
  const { isValid } = form.formState

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
          // console.log(res.data)
          const user = {
            is_avatar: res.data.user.is_avatar,
            user_id: res.data.user.user_id,
            nickname: res.data.user.nickname,
            profile_image: res.data.user.profile_image,
            email: res.data.user.email,
            bio: res.data.user.bio,
            name: res.data.user.name,
            is_email_verified: res.data.user.is_email_verified,
            is_password_set: true,
            accessToken: res.data.accessToken,
            ks_cb_request_status: res.data.user.ks_cb_request_status,
            is_brand_system_user: res.data.user.is_brand_system_user ? res.data.user.is_brand_system_user : null,
            brand_id: res.data.user.brand ? res.data.user.brand.brand_id : null,
            brand_slug: res.data.user.brand ? res.data.user.brand.brand_slug : null,
          }
          // console.log('user', user)
          void signIn('credentials', { ...user, redirect: false })
            .then((res) => {
              if (res?.ok) {
                close()
              }
              form.setError('root', { message: 'Oops! something went wrong. try again.' })
            })
            .catch((e) => {
              form.setError('root', { message: 'Oops! something went wrong. try again.' })
            })
        }
        if (res?.code === 5238) {
          form.control.setError('password', {
            message: 'Password is incorrect. Please try again.',
          })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center text-title-1-demi sm:text-heading-3">Log in</h3>
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
                    <FormMessage className={cn('!text-cap-1-demi')} />
                    {/* <p className="mt-2 text-center text-body-1-demi text-monochrome-6">Forgot password?</p> */}
                  </FormItem>
                )
              }}
            />
            <Button type="submit" variant="default" className="w-full" disabled={!isValid || isLoading}>
              {isLoading ? (
                <Loader size="sm" className="fill-new-off-white" />
              ) : (
                <p className="text-title-3-demi">Log in</p>
              )}
            </Button>
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </form>
        </Form>
      </div>
      {/* <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p> */}
    </ModalShell>
  )
}
