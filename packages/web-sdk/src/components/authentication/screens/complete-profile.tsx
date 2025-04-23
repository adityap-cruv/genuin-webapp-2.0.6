import {
  FormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormField,
} from '@/components/ui/form'
import { ImageInput } from '../components/image-input'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { useCallback, useEffect, useState } from 'react'
import { patchUserDetails } from '../api/auth'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { ModalShell } from '../modal-shell'
import { useAuth } from '@/context/auth'
import { useAuthModalContext } from '@/components/authentication/context'

const formSchema = z.object({
  displayName: z
    .string()
    .max(25, { message: 'Max length should be 25.' })
    .optional(),
  bio: z.string().max(150, { message: 'Max length should be 150.' }).optional(),
})

export function CompleteProfile() {
  const { updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const { formData, close: closeModal } = useAuthModalContext()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: formData?.bio ?? '',
      displayName: formData?.displayName ?? '',
    },
    mode: 'onBlur',
  })

  const { isDirty } = form.formState

  useEffect(() => {
    console.log(isDirty, formData.image instanceof File)
    setHasChanged(isDirty || formData.image instanceof File)
  }, [isDirty, formData.image])

  const onSubmit = useCallback(
    async ({
      displayName,
      bio,
    }: {
      displayName?: string | null
      bio?: string | null
    }) => {
      setIsLoading(true)
      try {
        const { status, user } = await patchUserDetails({
          name: displayName,
          bio,
          is_avatar: formData.imageName ? formData.isAvatar : undefined,
          profile_image: formData.imageName,
        })

        if (status) {
          closeModal()
          updateUser({
            bio: user.bio ?? '',
            name: user.name ?? '',
            image: user.profile_image,
            isAvatar: user.is_avatar,
          })
        } else {
          throw new Error()
        }
      } catch (e) {
        form.setError('root', { message: 'Something went wrong.' })
      } finally {
        setIsLoading(false)
      }
    },
    [closeModal, formData.imageName, formData.isAvatar, updateUser],
  )

  return (
    <ModalShell>
      <h3 className='flex w-full items-center justify-center text-title-1-demi sm:text-heading-3 '>
        Complete profile
      </h3>
      <ImageInput />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full'>
          <FormField
            name='displayName'
            control={form.control}
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className='sm:w-full'>
                  <FormLabel className='text-body-1-med'>
                    <div className='flex w-full justify-between'>
                      <p>Full Name</p>
                      <p className='text-cap-1-med '>
                        {form.getValues('displayName')?.length ?? 0}/25
                      </p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      maxLength={25}
                      type='text'
                      className={cn(
                        'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                        errors && '!border-red-500',
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <FormField
            name='bio'
            control={form.control}
            render={({ field }) => {
              const errors = useFormField().error
              return (
                <FormItem className='sm:w-full'>
                  <FormLabel className='text-body-1-med'>
                    <div className='flex w-full justify-between'>
                      <p className=''>Bio</p>
                      <p className='text-cap-1-med '>
                        {form.getValues('bio')?.length ?? 0}/150
                      </p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      maxLength={150}
                      {...field}
                      className={cn(
                        'border-tertiary-200 bg-tertiary-100 p-2 py-3 text-title-3-med',
                        errors && '!border-red-500',
                      )}
                    />
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <div className='flex flex-col gap-y-3 text-title-3-demi'>
            <Button
              type='submit'
              className='flex w-full items-center justify-center rounded-lg'
              disabled={isLoading || !hasChanged}>
              {isLoading ? (
                <Loader className='fill-white' />
              ) : (
                <p className='text-title-3-demi text-white'>Save</p>
              )}
            </Button>
            {form.formState.errors.root && (
              <p className='flex items-center justify-center text-title-3-med text-supplementary-red'>
                {form.formState.errors.root.message}
              </p>
            )}
          </div>
        </form>
      </Form>
    </ModalShell>
  )
}
