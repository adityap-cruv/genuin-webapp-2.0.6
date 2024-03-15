import { FormField, Form, FormItem, FormLabel, FormControl, FormMessage, useFormField } from '@components/ui/form'
import { ImageInput } from '../components/image-input'
import { Input } from '@components/ui/input'
import { cn } from '@lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@components/ui/textarea'
import { useEffect, useState } from 'react'
import { useAuthenticationModalStore } from '../store'
import { updateUser } from '@lib/api/auth'
import { useGenuinOptions } from '@lib/stores/genuin-options'

const formSchema = z.object({
  displayName: z.string().max(25, { message: 'Max length should be 25.' }).optional(),
  bio: z.string().max(150, { message: 'Max length should be 150.' }).optional(),
})

export function CompleteProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const defaultFullname = useGenuinOptions().user?.name
  const { formData, setFormData, close: closeModal } = useAuthenticationModalStore()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: formData.bio,
      displayName: defaultFullname ?? '',
    },
    mode: 'onChange',
  })
  // const { isValid, isDirty } = form.formState

  useEffect(() => {
    const w = form.watch((value) => {
      setFormData({ bio: value.bio, displayName: value.displayName })
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  async function onSubmit({ displayName, bio }: { displayName?: string | null; bio?: string | null }) {
    setIsLoading(true)
    try {
      const userUpdated = await updateUser({ name: displayName, bio })
      if (userUpdated) {
        closeModal()
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
    <>
      <h3 className="flex w-full items-center justify-center pb-4 text-heading-3">Complete profile</h3>
      <ImageInput />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="displayName"
            control={form.control}
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Full Name</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('displayName')?.length ?? 0}/25</p>
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
            name="bio"
            control={form.control}
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem>
                  <FormLabel className="text-body-1-med">
                    <div className="flex w-full justify-between">
                      <p>Bio</p>
                      <p className="text-cap-1-med text-secondary">{form.getValues('bio')?.length ?? 0}/150</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={150}
                      {...field}
                      className={cn(
                        'border-monochrome-9 bg-monochrome-11 p-2 py-3 text-title-3-med',
                        errors && '!border-red'
                      )}
                    />
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <span className="flex flex-col gap-y-3 text-title-3-demi">
            <Input
              type="submit"
              value="Save"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-new-off-black  text-monochrome-white hover:bg-new-dark-grey disabled:hover:bg-new-off-black"
              disabled={isLoading}
            />
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </span>
        </form>
      </Form>
    </>
  )
}
