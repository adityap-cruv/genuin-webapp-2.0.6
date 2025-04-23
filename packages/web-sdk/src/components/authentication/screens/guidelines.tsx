import { ModalShell } from '../modal-shell'
// import { useGenuinOptions } from '@lib/stores/genuin-options'
// import { GenuinIcon } from '@icons/genuin-icon'
import { GenuinIcon } from '@/components/icons/genuin-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { getBrandGuidelines, acceptBrandGuidelines } from '../api/auth'
import { useEffect, useState } from 'react'
// import { Loader } from '@components/ui/loader'
import { Loader } from '@/components/loader'
import { type ScreenProps } from '.'
// import { CustomImage } from '@/components/custom/custom-image'
import { CustomImage } from '@/components/custom-image'
import { useAuth } from '@/context/auth'
import { useBaseContext } from '@/context/base'

const FormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
})

type Guideline = {
  title: string
  description: string
}

type GuidelineProps = ScreenProps

export function Guidelines({ onNext }: GuidelineProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [guidelines, setGuidelines] = useState<Guideline[] | null>(null)
  const { user } = useAuth()
  // TODO: Figure out all the values.
  // const { brandLogo, brandId, user } = useGenuinOptions(
  //   useShallow((state) => ({
  //     brandLogo: state.brandWebLogo,
  //     brandId: state.brandId,
  //     user: state.user,
  //   })),
  // )

  const { brandDetails } = useBaseContext()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: false,
    },
  })
  const { isDirty } = form.formState

  useEffect(() => {
    async function fetchGuidelines() {
      brandDetails?.brand_id &&
        void getBrandGuidelines({
          brandId: brandDetails?.brand_id.toString(),
          idDefault: false,
        }).then((res) => {
          if (res.code === 200) {
            setGuidelines(res.data)
          }
        })
    }

    void fetchGuidelines()
  }, [])

  async function onSubmit() {
    setIsLoading(true)
    const answer = await acceptBrandGuidelines()
    if (answer) {
      if (!user?.hasTopics) {
        onNext('CATEGORY_SELECTION')
      } else if (!user?.usernameSet) {
        onNext('USERNAME_INPUT')
      } else {
        onNext()
      }
    } else {
      form.setError('root', { message: 'Please try again.' })
    }
    setIsLoading(false)
  }

  if (!guidelines) {
    return (
      <ModalShell>
        <Loader />
      </ModalShell>
    )
  }

  return (
    <ModalShell>
      <div className='w-full'>
        {brandDetails?.logo ? (
          <CustomImage
            alt='Logo'
            src={brandDetails.logo}
            className='object-cover h-12 w-1/2'
          />
        ) : (
          <GenuinIcon.logo className='h-10' />
        )}
      </div>
      <div className='h-[50vh] w-full overflow-auto'>
        <h2 className='text-title-1-bold'>Brand Guidelines</h2>
        <br />
        {guidelines.map((guideline, index) => (
          <div
            key={index}
            className='mb-4 grid gap-1'>
            <p className='text-body-1-bold'>
              {index + 1}. {guideline.title}
            </p>
            <p className='ml-4 text-body-1-med'>{guideline.description}</p>
          </div>
        ))}
      </div>
      <div className='w-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='mobile'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start gap-2 space-x-3 space-y-0 rounded-lg border border-tertiary-300 p-3 sm:w-full'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className={`rounded-full border border-tertiary-300 ${isDirty && 'bg-red'}`}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>I agree to the guidelines</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type='submit'
              variant='default'
              className='mt-5 w-full'
              disabled={!isDirty || isLoading}>
              {isLoading ? (
                <Loader className='fill-white' />
              ) : (
                <p className='text-title-3-demi text-white'>Continue</p>
              )}
            </Button>
            {form.formState.errors.root && (
              <p className='flex items-center justify-center pt-2 text-center text-body-1-demi text-supplementary-red'>
                {form.formState.errors.root.message}
              </p>
            )}
          </form>
        </Form>
      </div>
    </ModalShell>
  )
}
