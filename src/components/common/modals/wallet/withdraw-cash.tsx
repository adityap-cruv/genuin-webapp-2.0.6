import { useState } from 'react'
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
import { cashWithdrawAPI } from '@/lib/api/wallet'
import { useShallow } from 'zustand/react/shallow'
import { useAuthenticationModalStore } from '../authentication/store'

// Define the schema with an optional `cash_balance` parameter
const createSchema = (cashBalance: number) =>
  z.object({
    amount: z
      .number()
      .gt(0, { message: 'Value must be greater than 0' }) // Ensures amount is greater than 0
      .max(cashBalance, { message: `Value cannot be greater than $${cashBalance / 100}` }),
  })

export function WithdrawDialog() {
  const { walletDetails } = useWalletStore()
  const [isLoading] = useState(false)
  const { closeModal } = useAuthenticationModalStore(useShallow((state) => ({ closeModal: state.close })))
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize form with dynamic schema based on walletDetails.cash_balance
  const schema = createSchema(walletDetails.cash_balance)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    // defaultValues: { amount: 0 },
  })

  const { isValid } = form.formState

  async function onSubmit(data: { amount: number }) {
    // Process the submitted data
    const redirectUrl = window.location.href
    console.log(redirectUrl)
    const resp = await cashWithdrawAPI({ amount: data.amount * 100, redirectUrl })
    console.log(resp)

    if (resp?.data?.code === 200) {
      closeModal()
      if (resp.data.data.url) {
        window.open(resp.data.data.url, '_self')
      }
    } else {
      setErrorMessage(resp.data.message)
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
                        type="number"
                        className={cn(
                          'border border-tertiary-200 bg-tertiary-100 pl-7 text-title-3-med',
                          form.formState.errors.amount ? '!border-red' : ''
                        )}
                        {...field}
                        onChange={(e) => {
                          // Convert to number before setting value
                          field.onChange(Number(e.target.value))
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
