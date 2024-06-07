import React, { useState } from 'react'
import { Button } from '@components/ui/button'
import { FormField, Form, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from '@components/ui/loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { userContactDetails } from '@lib/api/contact-us'

const formSchema = z.object({
  firstName: z.string().nonempty({ message: 'First name is required' }),
  lastName: z.string().nonempty({ message: 'Last name is required' }),
  email: z.string().nonempty({ message: 'Email is required' }).email({ message: 'Invalid email format' }),
  companyName: z.string().nonempty({ message: 'Company name is required' }),
  companyType: z.string().nonempty({ message: 'Company type is required' }),
  country: z.string().nonempty({ message: 'Country is required' }),
  website: z.string().url(),
  piquedInterest: z.string(),
  companySize: z.string(),
})

export function ModalForm({ setIsLinkSent }: { setIsLinkSent: (val: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      companyName: '',
      companyType: '',
      country: '',
      website: '',
      piquedInterest: '',
      companySize: '',
    },
    mode: 'onBlur',
  })

  const { isValid, isDirty, errors } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.log(values)
    setIsLoading(true)
    try {
      const payload = {
        email: values.email,
        company: values.companyName,
        company_type: values.companyType,
        company_size: values.companySize,
        firstname: values.firstName,
        lastname: values.lastName,
        what_piqued_your_interest_in_genuin_: values.piquedInterest,
        country: values.country,
        website: values.website,
      }

      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== '' && value !== 'none')
      )
      const { status } = await userContactDetails(filteredPayload)
      if (status) {
        setIsLinkSent(true)
      } else {
        throw new Error()
      }
    } catch (e) {
      form.setError('root', { message: 'Something went wrong.' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderFormField = (
    name: keyof z.infer<typeof formSchema>,
    placeholder: string,
    type: string,
    maxLength?: number
  ) => (
    <FormField
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className="py-1.5 sm:w-full">
          <FormControl>
            <Input
              maxLength={maxLength}
              type={type}
              placeholder={placeholder}
              className={`border border-tertiary-200 bg-tertiary-100 text-title-3-med ${
                errors[name] && isDirty ? '!border-red' : ''
              }`}
              {...field}
            />
          </FormControl>
          {isDirty && <FormMessage className="!text-cap-1-demi" />}
        </FormItem>
      )}
    />
  )

  return (
    <div className="flex w-full items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex gap-x-4">
            {renderFormField('firstName', 'First Name', 'text', 25)}
            {renderFormField('lastName', 'Last Name', 'text', 25)}
          </div>
          {renderFormField('email', 'Email', 'email', 25)}
          <div className="flex gap-x-4">
            {renderFormField('companyName', 'Company Name', 'text', 50)}
            <FormField
              name="companySize"
              control={form.control}
              render={({ field }) => (
                <FormItem className="py-1.5 sm:w-full">
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border border-tertiary-200 bg-tertiary-100">
                        <SelectValue placeholder="Company Size" />
                      </SelectTrigger>
                      <SelectContent className="bg-monochrome-white">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="<10">{'<'}10</SelectItem>
                        <SelectItem value="11-99">11-99</SelectItem>
                        <SelectItem value="100-249">100-249</SelectItem>
                        <SelectItem value=">250">{'>'}250</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {isDirty && <FormMessage className="!text-cap-1-demi" />}
                </FormItem>
              )}
            />{' '}
          </div>
          <FormField
            name="companyType"
            control={form.control}
            render={({ field }) => (
              <FormItem className="py-1.5 sm:w-full">
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border border-tertiary-200 bg-tertiary-100">
                      <SelectValue placeholder="Company Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-monochrome-white">
                      {/* <SelectItem value="none">None</SelectItem> */}
                      <SelectItem value="Retail Media Network">Retail Media Network</SelectItem>
                      <SelectItem value="Brand/Advertiser">Brand/Advertiser</SelectItem>
                      <SelectItem value="Media Network">Media Network</SelectItem>
                      <SelectItem value="Content Creator">Content Creator</SelectItem>
                      <SelectItem value="Community Member">Community Member</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {isDirty && <FormMessage className="!text-cap-1-demi" />}
              </FormItem>
            )}
          />
          {renderFormField('website', 'Website Url', 'text', 50)}
          {renderFormField('country', 'Country', 'text', 25)}
          {renderFormField('piquedInterest', 'What piqued your interest in Genuin', 'text', 150)}
          <span className="mt-4 flex flex-col gap-y-3 text-title-3-demi">
            <Button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-new-off-black hover:bg-new-dark-grey"
              disabled={isLoading || !isValid || !isDirty}>
              {isLoading ? <Loader size="sm" className="fill-new-off-white" /> : <p>Submit</p>}
            </Button>
            <p className="text-para-1-home-m mt-0.5 text-left text-new-dark-grey">
              By submitting this form, you agree to receive promotional messages from Genuin about its products and
              services. You can unsubscribe at any time by clicking on the link at the bottom of our emails.
            </p>
            {errors.root && (
              <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
                {errors.root.message}
              </p>
            )}
          </span>
        </form>
      </Form>
    </div>
  )
}
