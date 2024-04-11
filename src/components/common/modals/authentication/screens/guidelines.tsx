import { ModalShell } from '../modal-shell'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { GenuinIcon } from '@icons/genuin-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form'
import { signup } from '@lib/api/auth'
import { SIGNUP_SOURCE } from '@lib/constants'
import { signIn } from 'next-auth/react'
import { useAuthenticationModalStore } from '../store'
import { useState } from 'react'
import { Loader } from '@components/ui/loader'

const FormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
})

export function Guidelines() {
  const { setStep, formData } = useAuthenticationModalStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mobile: false,
    },
  })
  const { isDirty } = form.formState

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    try {
      const signupResponse = await signup({
        email: formData.email ?? '',
        signupSource: SIGNUP_SOURCE.web,
      })

      await signIn('credentials', {
        ...signupResponse.data.user,
        accessToken: signupResponse.accessToken,
        redirect: false,
      })
        .then((res) => {
          if (res?.ok) {
            setStep('EMAIL_SENT_NOTE')
          } else {
            form.control.setError('root', { message: 'Something went wrong. Please try again!' })
            throw new Error()
          }
        })
        .catch((e) => {
          form.control.setError('root', { message: 'Something went wrong. Please try again!' })
          throw new Error()
        })
    } catch (e) {
      form.control.setError('root', { message: 'Something went wrong. Please try again!' })
    } finally {
      setIsLoading(false)
    }
  }

  const { brandName, brandLogo } = useGenuinOptions((state) => ({
    brandName: state.config?.name ? state.config?.name : 'Genuin',
    brandLogo: state.brandWebLogo,
  }))

  return (
    <ModalShell>
      <div className="w-full">
        {brandLogo ? <img src={brandLogo} className="h-10" /> : <GenuinIcon.logo className="h-10" />}
      </div>
      <div className="h-[50vh] w-full overflow-auto">
        <h2 className="text-title-1-bold">Brand Guidelines</h2>
        <br />
        <span className="text-body-1-med">
          Welcome to {brandName}! As you get settled, we wanted to introduce you to our Platform Guidelines. To keep{' '}
          {brandName} a space for authentic connection and ongoing learning, here are a few ground rules, you, as a
          user, acknowledge and agree to by using this platform.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Learn together: </span>
        <span className="text-body-1-med">
          {brandName} is all about learning and sharing knowledge with people who share your interests, passions, and
          experiences. We prioritize content that helps us to learn and grow together.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Be Authentic: </span>
        <span className="text-body-1-med">
          Let's keep it genuine (see what we did there?) and secure. Do not impersonate another person or entity on
          {brandName}, and refrain from misrepresenting your expertise or title.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Keep conversations respectful: </span>
        <span className="text-body-1-med">
          As humans, we don't always agree, and that's ok. We welcome sharing of opinions and respectful dialogue which
          means that we lead with positive intent and choose curiosity over conflict. Harassment and hate speech have no
          place here.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Respect the privacy of your fellow users: </span>
        <span className="text-body-1-med">
          Do not reveal confidential or personal identifier information about another person or entity while on{' '}
          {brandName}.
        </span>
        <br />
        <br />
        <span className="text-body-1-bold">Enforcement</span>
        <br />
        <span className="text-body-1-med">We will enforce these guidelines as needed in the following manners :</span>
        <ul
          className="p-4"
          style={{
            listStyle: 'inside',
          }}>
          <li className="text-body-1-med">Ask you nicely to abide by our rules</li>
          <li className="text-body-1-med">Remove offending content</li>
          <li className="text-body-1-med">Limitation or termination of a user or community's access to {brandName}</li>
          <li className="text-body-1-med">If illegal activity is reported, we may notify relevant law enforcement.</li>
        </ul>
      </div>
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-2 space-x-3 space-y-0 rounded-lg border border-monochrome-9 p-3 shadow sm:w-full">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className={`rounded-full border border-tertiary-200 ${isDirty && 'bg-supplementary-red'}`}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I agree to the guidelines</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" variant="default" className="mt-5 w-full" disabled={!isDirty || isLoading}>
              {isLoading ? (
                <Loader className="stroke-new-off-white" size="sm" />
              ) : (
                <p className="text-title-3-demi">Continue</p>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </ModalShell>
  )
}
