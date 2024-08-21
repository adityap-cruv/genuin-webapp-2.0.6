'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { Form, FormField, useFormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Loader } from '@/components/ui/loader'
import { useState } from 'react'
import { useWalletStore } from './store'

const usernameSchema = z.object({
  amount: z.string(),
})

export function WithdrawDialog() {
  const { currentCardView } = useWalletStore()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    mode: 'onBlur',
    defaultValues: { amount: '' },
  })
  const { isValid, isDirty } = form.formState

  async function onSubmit({ amount }: { amount: string }) {}
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="custom" className="rounded border border-primary" variant="outline">
          <p className="px-4 py-1.5 text-body-1-demi text-primary">
            {currentCardView === 'Cash' ? 'Withdraw' : 'Redeem'}
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex w-full flex-col items-center justify-center gap-y-4 px-2 sm:min-w-[582px] sm:max-w-md sm:px-4"
        style={{
          padding: '48px',
        }}>
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
                      <Input
                        maxLength={25}
                        placeholder="Enter Amount"
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
      </DialogContent>
    </Dialog>
  )
}
