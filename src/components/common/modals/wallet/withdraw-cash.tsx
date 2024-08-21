'use client'
import { Button } from '@/components/ui/button'
import { Form, FormField, useFormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/ui/loader'
import { useState } from 'react'
import { ModalShell } from '../authentication/modal-shell'
// import { useWalletStore } from '../../wallet/store'

const usernameSchema = z.object({
  amount: z.number(),
})

export function WithdrawDialog() {
  // const { currentCardView } = useWalletStore()
  const [isLoading] = useState(false)
  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    mode: 'onBlur',
    defaultValues: { amount: 0 },
  })
  const { isValid } = form.formState

  async function onSubmit({ amount }: { amount: number }) {}
  return (
    <ModalShell>
      <p className="text-heading-3 text-monochrome-black">Withdraw Cash</p>
      <p className="text-title-3-med text-secondary-300">Enter value (upto $20)</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => {
              const errors = useFormField().error
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
          {form.formState.errors.root && (
            <p className="flex items-center justify-center text-title-3-med text-supplementary-red">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>
      </Form>
    </ModalShell>
  )
}
