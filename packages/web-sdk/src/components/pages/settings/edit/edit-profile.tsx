import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { ImageInput } from '@/components/authentication/components/image-input'
import { useToast } from '@/components/ui/use-toast'
import { memo, useCallback, useEffect, useState } from 'react'
import { InstagramIcon } from '@/components/icons/social/instagram-icon'
import { TwitterIcon } from '@/components/icons/social/twitter-icon'
import { TikTokIcon } from '@/components/icons/social/tiktok-icon'
import { LinkedInIcon } from '@/components/icons/social/linkedin-icon'
import { ProfileDetailsType } from '../schema'
import { CounterTextField } from './couter-text-field'
import { CounterTextareaField } from './couter-textarea-field'
import { SocialMediaField } from './social-media-field'
import { useMutation } from '@tanstack/react-query'
import { updateUser } from '../api'
import { Header } from '../header'
import { useAuth } from '@/context/auth'
import { useAuthModalContext } from '@/components/authentication/context'

// Validation patterns moved to a separate object for better maintainability
const validationPatterns = {
  linkedIn:
    /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(in|company|school)\/[a-zA-Z0-9À-ž-]+\/?$/,
  instagram: /^[a-zA-Z0-9._]{1,30}$/,
  twitter: /^[a-zA-Z0-9_]{1,15}$/,
  tikTok: /^[a-zA-Z0-9._]{1,24}$/,
}

// Form schema with improved readability
const formSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .max(25, { message: 'Max length should be 25.' })
    .or(z.literal('')),
  bio: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .max(150, { message: 'Max length should be 150.' })
    .nullable()
    .or(z.literal('')),
  instagram: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .regex(validationPatterns.instagram, {
      message: 'Invalid Instagram username.',
    })
    .or(z.literal('')),

  linkedIn: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .regex(validationPatterns.linkedIn, { message: 'Invalid LinkedIn URL.' })
    .or(z.literal('')),

  twitter: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .regex(validationPatterns.twitter, { message: 'Invalid Twitter username.' })
    .or(z.literal('')),

  tiktok: z
    .string()
    .trim()
    .min(1, { message: 'This field cannot be empty.' })
    .regex(validationPatterns.tikTok, { message: 'Invalid TikTok username.' })
    .or(z.literal('')),
})

// Type for the form values
export type FormValues = z.infer<typeof formSchema>

type EditProfilePropsType = { profileDetails: ProfileDetailsType }

// Define an array of social media field configurations
const SOCIALS = [
  {
    name: 'instagram',
    label: 'Instagram',
    placeholder: '@username',
    Icon: InstagramIcon,
  },
  {
    name: 'linkedIn',
    label: 'LinkedIn',
    placeholder: 'https://www.linkedin.com/profile/username',
    Icon: LinkedInIcon,
  },
  {
    name: 'twitter',
    label: 'X',
    placeholder: '@username',
    Icon: TwitterIcon,
  },
  {
    name: 'tiktok',
    label: 'TikTok',
    placeholder: '@username',
    Icon: TikTokIcon,
  },
]

export const EditProfile = memo(function EditProfile({
  profileDetails,
}: EditProfilePropsType) {
  const { updateUser: updateAuthUser } = useAuth()
  const { formData } = useAuthModalContext()

  const { mutate, isPending } = useMutation({
    mutationFn: updateUser,
    onError: () => {
      toast({
        description: 'Something went wrong. Please try again.',
      })
    },
  })

  const [hasChanged, setHasChanged] = useState(false)
  const { toast } = useToast()

  // Initialize form with profile details
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: profileDetails?.bio,
      displayName: profileDetails?.name ?? '',
      instagram: profileDetails?.insta_id ?? '',
      linkedIn: profileDetails?.linkedin_id ?? '',
      twitter: profileDetails?.twitter_id ?? '',
      tiktok: profileDetails?.tiktok_id ?? '',
    },
    mode: 'onBlur',
  })

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => setHasChanged(true))
    return () => subscription.unsubscribe()
  }, [form])

  useEffect(() => {
    // If the image is a file, then the user has changed the image.
    setHasChanged(formData.image instanceof File)
  }, [formData.image])

  // Add unsaved changes warning
  useEffect(() => {
    if (!hasChanged) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      return (e.returnValue = '')
    }

    window.addEventListener('beforeunload', handleBeforeUnload, {
      capture: true,
    })
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanged])

  useEffect(() => {
    if (profileDetails) {
      form.reset({
        bio: profileDetails.bio ?? '',
        displayName: profileDetails.name ?? '',
        instagram: profileDetails.insta_id ?? '',
        linkedIn: profileDetails.linkedin_id ?? '',
        twitter: profileDetails.twitter_id ?? '',
        tiktok: profileDetails.tiktok_id ?? '',
      })
      setHasChanged(false) // Reset the change state
    }
  }, [profileDetails, form.reset])

  // Form submission handler
  const onSubmit = useCallback(
    async (values: FormValues) => {
      mutate(
        {
          name: values.displayName,
          bio: values.bio,
          is_avatar: formData.imageName ? formData.isAvatar : undefined,
          profile_image: formData.imageName,
          insta_id: values.instagram,
          linkedin_id: values.linkedIn,
          twitter_id: values.twitter,
          tiktok_id: values.tiktok,
        },
        {
          onSuccess: (user) => {
            if (!user) return
            updateAuthUser({
              bio: user.bio ?? undefined,
              name: user.name ?? undefined,
              image: user.profile_image,
              isAvatar: user.is_avatar,
            })
            toast({
              description: 'Your profile has been successfully updated.',
            })
            setHasChanged(false)
          },
        },
      )
    },
    [formData],
  )

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='h-full w-full overflow-auto'>
        <Header
          submitDisabled={isPending || !hasChanged || !form.formState.isValid}
          showSubmitButton
          title='Edit Profile'
        />
        {/* Form Content */}
        <div className='px-8 py-4 pb-20'>
          <ImageInput forSettings />

          {/* Display Name Field - using reusable component */}
          <CounterTextField
            name='displayName'
            control={form.control}
            label='Full Name'
            maxLength={25}
            getValues={form.getValues}
          />

          {/* Bio Field - using reusable component */}
          <CounterTextareaField
            name='bio'
            control={form.control}
            label='Bio'
            maxLength={150}
            getValues={form.getValues}
          />

          {/* Social Media Links Section */}
          <p className='text-title-2-bold'>Links</p>

          {/* Map through the SOCIALS array to render SocialMediaField components */}
          {SOCIALS.map(({ name, label, placeholder, Icon }) => (
            <SocialMediaField
              key={name}
              name={name as keyof FormValues}
              control={form.control}
              label={label}
              placeholder={placeholder}
              Icon={Icon}
            />
          ))}
        </div>

        {/* Error Message Display */}
        {form.formState.errors.root && (
          <span className='flex flex-col gap-y-3 text-title-3-demi'>
            <p className='flex items-center justify-center text-title-3-med text-supplementary-red'>
              {form.formState.errors.root.message}
            </p>
          </span>
        )}
      </form>
    </Form>
  )
})
