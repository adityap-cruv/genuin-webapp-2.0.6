'use client'
import icBack from '@icons/icBack.svg'
import { cn } from '@lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import Image from 'next/image'
import { ImageInput } from '@components/common/modals/authentication/components/image-input'
import { useAuthenticationModalStore } from '@components/common/modals/authentication/store'
import { updateUser } from '@lib/api/auth'
import { useSession } from 'next-auth/react'
import { type ProfileDetailsType } from '@lib/schemas/profile/profile'
import { useToast } from '@components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { fetchUserData } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useEffect, useState } from 'react'
import { Toaster } from '@components/ui/toaster'
import { PATH_NAME } from '@lib/utils/constants/path'
import { InstagramIcon } from '@icons/instagram-icon'
import { TikTokIcon } from '@icons/tiktok-icon'
import { LinkedInIcon } from '@icons/linkedin-icon'
import { TwitterIcon } from '@icons/twitter-icon'

export default function MainComponent() {
  const { isMobile, user } = useGenuinOptions((state) => ({ isMobile: state.isMobile, user: state.user }))
  const [profileData, setProfileData] = useState<ProfileDetailsType | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await fetchUserData(user?.nickname ?? '')
        setProfileData(data)
      } catch (error) {
        throw new Error()
      }
    }
    void fetchSettings()
  }, [])

  if (!profileData)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader size="md" />
      </div>
    )
  if (profileData)
    return (
      <>
        <EditProfile profileData={profileData} isMobile={isMobile} />
        <Toaster />
      </>
    )
}

const formSchema = z.object({
  displayName: z.string().max(25, { message: 'Max length should be 25.' }).optional(),
  bio: z.string().max(150, { message: 'Max length should be 150.' }).optional().nullable(),
  instagram: z.string().optional(),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
})

function EditProfile({ profileData, isMobile }: { profileData: ProfileDetailsType; isMobile: boolean }) {
  const [hasChanged, setHasChanges] = useState(false)
  const { formData } = useAuthenticationModalStore()
  const { data: sessionData, update: updateSession } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: profileData?.bio,
      displayName: profileData?.name ?? '',
      instagram: profileData.insta_id ?? '',
      linkedIn: profileData.linkedin_id ?? '',
      twitter: profileData.twitter_id ?? '',
      tiktok: profileData.tiktok_id ?? '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    const w = form.watch((value) => {
      setHasChanges(true)
    })
    return () => {
      w.unsubscribe()
    }
  }, [form.watch])

  useEffect(() => {
    if (!hasChanged) return
    function beforeLoad(e: BeforeUnloadEvent) {
      e.preventDefault()
      return (e.returnValue = '')
    }
    window.addEventListener('beforeunload', beforeLoad, { capture: true })
    return () => {
      window.removeEventListener('beforeunload', beforeLoad)
    }
  }, [hasChanged])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { status, user } = await updateUser({
      name: values.displayName ? values.displayName : null,
      bio: values.bio ? values.bio : null,
      is_avatar: formData.imageName ? formData.isAvatar : undefined,
      profile_image: formData.imageName,
      insta_id: values.instagram ? values.instagram : null,
      linkedin_id: values.linkedIn ? values.linkedIn : null,
      twitter_id: values.twitter ? values.twitter : null,
      tiktok_id: values.tiktok ? values.tiktok : null,
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
          tiktok_id: user?.tiktok_id ?? null,
        },
      })
      toast({
        description: 'Your profile has been successfully updated.',
      })
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
            {isMobile && (
              <Image
                src={icBack}
                alt="back"
                onClick={() => {
                  const path = localStorage.getItem('previous_path')
                  router.push(path ?? PATH_NAME.home())
                }}
              />
            )}
            <p className="text-title-2-bold">Edit Profile</p>
            <button type="submit" className="text-title-3-demi text-primary">
              Save
            </button>
          </div>
          {isMobile && <hr className="bg-monochrome-black/10" />}

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
                        <InstagramIcon className="absolute ml-4 h-5 w-5 fill-primary" />
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
                        <LinkedInIcon className="absolute ml-4 h-5 w-5 fill-primary" />
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
                        <TwitterIcon className="absolute ml-4 h-5 w-5 fill-primary " />
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
              name="tiktok"
              control={form.control}
              render={({ field }) => {
                const errors = useFormField().error
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">TikTok profile</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <TikTokIcon className="absolute ml-4 h-5 w-5 fill-primary" />
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
