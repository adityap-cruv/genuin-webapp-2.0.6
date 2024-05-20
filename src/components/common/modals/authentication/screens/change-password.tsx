import { Form, FormField, useFormField, FormItem, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { updatePassword } from '@lib/api/auth'
import { useAuthenticationModalStore } from '../store'
import { Button } from '@components/ui/button'
import { Loader } from '@components/ui/loader'
import { ModalShell } from '../modal-shell'

const passwordSchema = z.object({
  oldPassword: z.string().min(8, 'Old password must be at least 8 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export function ChangePassword() {
  const [passwordVisible, setPasswordVisible] = useState({ oldPassword: false, newPassword: false })
  const [isLoading, setIsLoading] = useState(false)
  const { setStep } = useAuthenticationModalStore()
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), mode: 'onSubmit' })
  const { isDirty, isValid, errors } = form.formState

  useEffect(() => {
    const watch = form.watch((value) => {
      form.clearErrors()
      if (value.newPassword && value.oldPassword && value.newPassword === value.oldPassword) {
        form.setError('newPassword', { message: 'New password cannot be the same as old password.' })
      }
    })
    return () => {
      watch.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
    setIsLoading(true)
    try {
      const { code } = await updatePassword({ oldPassword, newPassword })
      if (code === 200) {
        setStep('CHANGE_PASSWORD_SUCCESS_NOTE')
      } else if (code === 5238) {
        form.setError('oldPassword', { message: 'Old password is incorrect. Please try again.' })
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalShell>
      <h3 className="flex w-full items-center justify-center text-title-1-demi sm:text-heading-3 ">Change Password</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className="sm:w-full">
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Old Password</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        maxLength={24}
                        minLength={8}
                        type={passwordVisible.oldPassword ? 'text' : 'password'}
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red'
                        )}
                        {...field}
                      />
                      <div className="absolute right-4 top-0 flex h-full items-center">
                        {!passwordVisible.oldPassword ? (
                          <EyeOffIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible({ ...passwordVisible, oldPassword: true })
                            }}
                          />
                        ) : (
                          <EyeIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible({ ...passwordVisible, oldPassword: false })
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  {/* <FormMessage
                    className={cn(
                      '!text-cap-1-demi',
                      isValid && 'text-supplementary-green',
                      (!isDirty || !isValid) && 'text-tertiary-400'
                    )}>
                    {(!isDirty || !isValid) && 'Must be at least 8 characters'}
                    {isValid && 'Looks good!'}
                  </FormMessage> */}

                  {form.formState.errors.oldPassword && (
                    <p className="text-cap-1-demi text-supplementary-red">
                      {form.formState.errors.oldPassword.message}
                    </p>
                  )}
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="newPassword"
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
                        type={passwordVisible.newPassword ? 'text' : 'password'}
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red'
                        )}
                        {...field}
                      />
                      <div className="absolute right-4 top-0 flex h-full items-center">
                        {!passwordVisible.newPassword ? (
                          <EyeOffIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible({ ...passwordVisible, newPassword: true })
                            }}
                          />
                        ) : (
                          <EyeIcon
                            className="cursor-pointer"
                            onClick={() => {
                              setPasswordVisible({ ...passwordVisible, newPassword: false })
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
            disabled={!isDirty || !isValid || isLoading || Object.keys(errors).length > 0}
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
