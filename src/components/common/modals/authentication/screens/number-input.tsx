import { PhoneInput } from '@components/ui/phone-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { useEffect, useState } from 'react'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { Button } from '@components/ui/button'
import at_icon from '@icons/Ic@.svg'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@lib/utils'
import { loginViaPhone } from '@lib/api/auth'
import { useLocalStorage } from '@lib/stores/local-storage'
import { LOGIN_SOURCE, VERIFICATION_TYPE } from '@lib/constants'

const formSchema = z.object({
  phone: z.string(),
})

export function NumberInput() {
  const { setStep, formData, setFormData } = useAuthenticationModalStore()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInvalidNumber, setIsInvalidNumber] = useState(false)
  const deviceId = useLocalStorage().deviceId
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    criteriaMode: 'firstError',
    defaultValues: {
      phone: '',
    },
  })

  function isValidPhoneNumber(phoneNumber: string) {
    const pattern = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/

    if (!phoneNumber) {
      setIsInvalidNumber(false)
    }

    if (pattern.test(phoneNumber)) {
      setIsInvalidNumber(true)
    } else {
      setIsInvalidNumber(false)
    }
  }

  useEffect(() => {
    isValidPhoneNumber(phoneNumber)
    setFormData({ phone: phoneNumber })
    if (!isInvalidNumber) {
      form.control.setError('root', { message: '' })
    }
  }, [phoneNumber, isInvalidNumber])

  async function onSubmit() {
    setIsLoading(true)
    await loginViaPhone({
      phone: formData.phone,
      token: deviceId,
      verificationType: VERIFICATION_TYPE.sms,
      loginSource: LOGIN_SOURCE.web,
    })
      .then(async (res) => {
        if (res?.code === 200) {
          setFormData({ userId: res.data.user_id })
          setIsLoading(false)
          setStep('OTP_INPUT')
        }
        if (res.code === 5234) {
          form.control.setError('root', { message: 'Account doesn`t exists. Sign up insted' })
        }
        if (res.code === 5174) {
          form.control.setError('root', { message: 'API Rate Limit Exceeded' })
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ModalShell>
      <p className="text-center text-heading-3">Log in to Ted</p>

      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => {
                return (
                  <FormItem className="sm:w-full">
                    <FormLabel className="text-body-1-med">
                      <div className="flex w-full justify-between">
                        <p>Phone</p>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput value={'+1'} international className="w-full" onChange={setPhoneNumber} />
                    </FormControl>
                    <FormMessage className={cn('!text-cap-1-demi')} />
                  </FormItem>
                )
              }}
            />
            <Button
              type="submit"
              variant="default"
              className="w-full bg-new-off-black hover:bg-new-dark-grey"
              disabled={!isInvalidNumber}>
              <p className="text-title-3-demi">{isLoading ? 'Loading...' : 'Next'}</p>
            </Button>
          </form>
        </Form>
      </div>
      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-supplementary-red">
          {form.formState.errors.root.message}
        </p>
      )}

      <p className="text-title-3-demi text-monochrome">OR</p>
      <Button
        variant="outline"
        className="w-full border border-monochrome-9"
        onClick={() => {
          setStep('EMAIL_INPUT')
        }}>
        <div className="relative flex w-full items-center justify-center">
          <img src={at_icon.src} className="absolute left-0 h-5 w-5" alt="at" />
          <p className="text-title-3-demi">Use Email</p>
        </div>
      </Button>
      <p className="text-new-para-2-mobile">
        By registering, you agree to Ted's
        <Link href={PATH_NAME.terms}>
          <span className="text-primary"> Terms of Service </span>
        </Link>
        and
        <Link href={PATH_NAME.privacy}>
          <span className="text-primary"> Privacy</span>
        </Link>
      </p>
      <p className="flex w-full items-center justify-center text-body-1-demi">
        Don't have an account?
        <span
          className="cursor-pointer text-primary"
          onClick={() => {
            setStep('SIGN_UP')
          }}>
          &nbsp;Sign up
        </span>
      </p>
    </ModalShell>
  )
}
