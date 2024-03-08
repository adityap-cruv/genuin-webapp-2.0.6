'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn, getAvatarUrl } from '@lib/utils'
import { z } from 'zod'
import { useAuthenticationModalStore } from '../store'
import { Label } from '@components/ui/label'
import { signup } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { useEffect } from 'react'
import { SIGNUP_SOURCE } from '@lib/constants'
import { signIn } from 'next-auth/react'

export function Signup() {
  const { setStep, formData, setFormData } = useAuthenticationModalStore()
  const deviceId = useLocalStorage().deviceId

  const formSchema = z.object({
    displayName: z
      .string()
      .min(3, { message: 'Min length should be 3.' })
      .max(25, { message: 'Max length should be 25.' }),
    email: z.string().email({ message: 'Please enter valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      displayName: formData.displayName,
      email: formData.email,
    },
  })
  const { isDirty, isValid, isSubmitting } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ displayName: value.displayName, email: value.email })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ displayName, email }: { displayName: string; email: string }) {
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_CLIENT_KEY, {
        action: 'SIGNUP',
      })
      await signup({
        email,
        profileImage: formData.image ?? '',
        name: displayName,
        isAvatar: formData.isAvatar,
        recaptchaAction: 'SIGNUP',
        recaptchaToken: token,
        deviceId,
        signupSource: SIGNUP_SOURCE.web,
      }).then(async (res) => {
        if (res?.code === 200) {
          await signIn('credentials', {
            ...res.data.user,
            redirect: false,
          }).then((res) => {
            if (res?.ok) setStep('EMAIL_SENT_NOTE')
          })
        }
      })
    })
    // TODO: Verify Email here.
    // form.control.setError('email', { message: 'Account already exists. Log in instead. ' })
  }

  return (
    <>
      <h3 className="flex w-full items-center justify-center pb-4 text-heading-3">Sign up for Ted</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex w-full flex-col items-center justify-center gap-y-2">
            <img
              src={
                typeof formData.image === 'string'
                  ? getAvatarUrl(formData.image)
                  : URL.createObjectURL(formData.image as any)
              }
              className="h-20 w-20 rounded-full bg-blue-70"
            />
            <input
              id="pic"
              type="file"
              className="hidden w-full"
              accept="image/*"
              onChange={(e) => {
                setFormData({ image: URL.createObjectURL(e.target.files?.[0] as any) })
                setStep('IMAGE_CROPPER')
              }}
            />
            <Label htmlFor="pic" className="cursor-pointer !text-body-1-demi text-primary">
              Change profile picture
            </Label>
          </div>
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Display Name</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('displayName')?.length ?? 0}/24</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={25}
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Email</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={cn('border-monochrome-9 bg-monochrome-11 text-title-3-med', errors && '!border-red')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <span className="text-title-3-demi">
            {isSubmitting ? (
              <p>loading</p>
            ) : (
              <Input
                type="submit"
                value="Verify Email"
                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-new-off-black  text-monochrome-white hover:bg-new-dark-grey disabled:hover:bg-new-off-black"
                disabled={!isDirty || !isValid}
              />
            )}
          </span>
        </form>
        <p className="flex w-full items-center justify-center pt-2 text-body-1-demi">
          Already have an account?
          <span
            className="cursor-pointer text-primary"
            onClick={() => {
              setStep('EMAIL_INPUT')
            }}>
            &nbsp;Log in
          </span>
        </p>
      </Form>
    </>
  )
}
