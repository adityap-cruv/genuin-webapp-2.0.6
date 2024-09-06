import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/ui/loader'
import { ModalShell } from '../authentication/modal-shell'
import { useWalletStore } from '../../wallet/store'
import { cashWithdrawAPI, getBalanceAPI } from '@/lib/api/wallet'
import { useShallow } from 'zustand/react/shallow'
import { useAuthenticationModalStore } from '../authentication/store'

// Define the schema with an optional `cash_balance` parameter
const createSchema = (cashBalance: number) =>
  z.object({
    amount: z
      .string()
      .min(1, { message: 'Required' })
      .refine(
        (value) => {
          const numberValue = Number(value)
          return !isNaN(numberValue) && numberValue > 0 && numberValue <= cashBalance / 100
        },
        { message: `Value cannot be greater than $${cashBalance / 100}` }
      ),
  })

export function WithdrawDialog() {
  const { walletDetails, setWalletDetails } = useWalletStore()
  const [isLoading, setIsLoading] = useState(false)
  const { closeModal } = useAuthenticationModalStore(useShallow((state) => ({ closeModal: state.close })))
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize form with dynamic schema based on walletDetails.cash_balance
  const schema = createSchema(walletDetails.cash_balance)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    // defaultValues: { amount: 0 },
  })

  useEffect(() => {
    const watch = form.watch((value) => {
      if (Number(value.amount) <= walletDetails.cash_balance / 100) {
        form.clearErrors()
        setErrorMessage('')
      } else {
        form.setError('amount', { message: `Value cannot be greater than $${walletDetails.cash_balance / 100}` })
      }
    })
    return () => {
      watch.unsubscribe()
    }
  }, [form.watch])

  const { isValid } = form.formState

  async function onSubmit(data: { amount: string }) {
    setIsLoading(true)

    const redirectUrl = window.location.href

    try {
      const resp = await cashWithdrawAPI({ amount: Number(data.amount) * 100, redirectUrl })

      if (resp?.data?.code === 200) {
        closeModal()
        if (resp.data.data.url) {
          window.open(resp.data.data.url, '_self')
        }
        const { wallet } = await getBalanceAPI({ isCurrentBalance: false })
        setWalletDetails(wallet)
      } else {
        setErrorMessage(resp.data.message)
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
  }

  return (
    <ModalShell>
      <p className="text-heading-3 text-monochrome-black">Withdraw Cash</p>
      <p className="text-title-3-med text-secondary-300">Enter value (up to ${walletDetails.cash_balance / 100})</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              return (
                <FormItem className="p-0 sm:w-full">
                  <FormControl>
                    <div className="relative flex items-center">
                      <p className="absolute left-3">$</p>
                      <Input
                        placeholder="Enter Amount"
                        type="text"
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 pl-7 text-title-3-med',
                          form.formState.errors.amount ? '!border-red' : ''
                        )}
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9.]/g, '')
                          // Ensure only two digits after the decimal
                          if (value.includes('.')) {
                            const [integerPart, decimalPart] = value.split('.')
                            value = decimalPart.length > 2 ? `${integerPart}.${decimalPart.slice(0, 2)}` : value
                          }
                          field.onChange(value)
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className={cn('!text-cap-1-demi')} />
                </FormItem>
              )
            }}
          />
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="mt-4 flex w-full items-center justify-center border-0">
            {isLoading ? (
              <Loader size="sm" className="fill-new-off-white" />
            ) : (
              <p className="text-title-3-demi text-new-off-white">Withdraw</p>
            )}
          </Button>
        </form>
      </Form>
      {errorMessage !== '' && (
        <div>
          <p className="text-body-1-med text-supplementary-red">{errorMessage}</p>
        </div>
      )}
    </ModalShell>
  )
}
