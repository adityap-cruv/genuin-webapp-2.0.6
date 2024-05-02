'use client'
import { useState } from 'react'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icUrl from '@icons/icUrl.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import icBack from '@icons/icBack.svg'
import { cn, getAvatarUrl, getRandomAvatar } from '@lib/utils'
import { Label } from '@components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import Image from 'next/image'
import { useGenuinOptions } from '@lib/stores/genuin-options'

const formSchema = z.object({
  displayName: z.string().max(25, { message: 'Max length should be 25.' }).optional(),
  bio: z.string().max(150, { message: 'Max length should be 150.' }).optional(),
  instagram: z.string().optional(),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  custonUrl: z.string().optional(),
})

export default function Component() {
  const isMobile = useGenuinOptions().isMobile
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: '',
      displayName: '',
      instagram: '',
      linkedIn: '',
      twitter: '',
      custonUrl: '',
    },
    mode: 'onBlur',
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
            {isMobile && <Image src={icBack} alt="back" />}
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
              name="custonUrl"
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
            {/* <Button type="submit" className="flex w-full cursor-pointer items-center justify-center rounded-lg">
              Save
            </Button> */}
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

function ImageInput() {
  type FormData = {
    image: string | File
    isAvatar: boolean
  }
  const [formData, setFormData] = useState<FormData>({
    image: getRandomAvatar(),
    isAvatar: true,
  })

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2">
      <img
        src={
          formData.image
            ? typeof formData.image === 'string'
              ? formData.isAvatar
                ? getAvatarUrl(formData.image)
                : formData.image
              : URL.createObjectURL(formData.image)
            : null
        }
        className="h-20 w-20 rounded-full bg-blue-70"
      />
      <input
        id="pic"
        type="file"
        className="hidden w-full"
        accept="image/png, image/jpeg, image/jpg"
        onChange={(e) => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            image: URL.createObjectURL(e.target.files?.[0] as any),
          }))
        }}
      />
      <Label htmlFor="pic" className="cursor-pointer !text-body-1-bold text-primary">
        Change profile picture
      </Label>
    </div>
  )
}
