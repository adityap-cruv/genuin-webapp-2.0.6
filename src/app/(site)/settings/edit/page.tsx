'use client'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icUrl from '@icons/icUrl.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import icBack from '@icons/icBack.svg'
import { cn } from '@lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import Image from 'next/image'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { ImageInput } from '@components/common/modals/authentication/components/image-input'
import { useAuthenticationModalStore } from '@components/common/modals/authentication/store'
import { updateUser } from '@lib/api/auth'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

const formSchema = z.object({
  displayName: z.string().max(25, { message: 'Max length should be 25.' }).optional(),
  bio: z.string().max(150, { message: 'Max length should be 150.' }).optional().nullable(),
  instagram: z.string().optional(),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  customUrl: z.string().optional(),
})

export default function Component() {
  const { isMobile, user } = useGenuinOptions((state) => ({ isMobile: state.isMobile, user: state.user }))
  const { formData } = useAuthenticationModalStore()
  const { data: sessionData, update: updateSession } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user?.bio,
      displayName: user?.name ?? '',
      instagram: '',
      linkedIn: '',
      twitter: '',
      customUrl: '',
    },
    mode: 'onBlur',
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { status, user } = await updateUser({
      name: values.displayName,
      bio: values.bio,
      is_avatar: formData.imageName ? formData.isAvatar : undefined,
      profile_image: formData.imageName,
      insta_id: values.instagram ?? null,
      linkedin_id: values.linkedIn ?? null,
      twitter_id: values.twitter ?? null,
    })
    if (status) {
      await updateSession({
        ...sessionData,
        user: {
          ...sessionData?.user,
          is_avatar: user?.is_avatar,
          image: user?.profile_image,
          insta_id: user?.insta_id ?? null,
          linkedin_id: user?.linkedin_id ?? null,
          twitter_id: user?.twitter_id ?? null,
        },
      })
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
            {isMobile && (
              <Link href={PATH_NAME.home()}>
                <Image src={icBack} alt="back" />
              </Link>
            )}{' '}
            <p className="text-title-2-bold">Edit Profile</p>
            <button type="submit" className="text-title-3-demi text-primary">
              Save
            </button>
          </div>
          {isMobile && <hr className="bg-monochrome-9" />}

          <div className="px-8 py-4">
            <ImageInput />

            <FormField
              name="displayName"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">
                      <div className="flex w-full justify-between">
                        <p className="">Full Name</p>
                        <p className="text-cap-1-med ">{form.getValues('displayName')?.length ?? 0}/25</p>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        maxLength={25}
                        type="text"
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 text-title-3-med',
                          errors && '!border-red'
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
              name="bio"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">
                      <div className="flex w-full justify-between">
                        <p className="text-body-1-med">Bio</p>
                        <p className="text-cap-1-med ">{form.getValues('bio')?.length ?? 0}/150</p>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        maxLength={150}
                        {...field}
                        value={field.value ?? ''}
                        className={cn(
                          'border-tertiary-200 bg-tertiary-100 p-2 py-3 text-title-3-med',
                          errors && '!border-red'
                        )}
                      />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <p className="text-title-2-bold">Links</p>
            <FormField
              name="instagram"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">Instagram profile</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Image src={icInstagram} className="absolute ml-4 " alt="instagram" />
                        <Input
                          type="text"
                          placeholder="@username"
                          className={cn(
                            'border border-tertiary-200 bg-tertiary-100 pl-12 text-title-3-med',
                            errors && '!border-red'
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <FormField
              name="linkedIn"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">LinkedIn profile</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Image src={icLinkedIn} className="absolute ml-4 " alt="linkedin" />
                        <Input
                          type="text"
                          placeholder="@username"
                          className={cn(
                            'border border-tertiary-200 bg-tertiary-100 pl-12 text-title-3-med',
                            errors && '!border-red'
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <FormField
              name="twitter"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">Twitter profile</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Image src={icTwitter} className="absolute ml-4 " alt="twitter" />
                        <Input
                          type="text"
                          placeholder="@username"
                          className={cn(
                            'border border-tertiary-200 bg-tertiary-100 pl-12 text-title-3-med',
                            errors && '!border-red'
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />

            <FormField
              name="customUrl"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">Custom URL</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Image src={icUrl} className="absolute ml-4 " alt="url" />
                        <Input
                          type="text"
                          placeholder="@username"
                          className={cn(
                            'border border-tertiary-200 bg-tertiary-100 pl-12 text-title-3-med',
                            errors && '!border-red'
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />
          </div>

          <span className="flex flex-col gap-y-3 text-title-3-demi">
            {form.formState.errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {form.formState.errors.root.message}
              </p>
            )}
          </span>
        </form>
      </Form>
    </div>
  )
}
