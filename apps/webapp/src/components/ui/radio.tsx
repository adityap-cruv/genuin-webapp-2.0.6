'use client'

import * as React from 'react'
import { cn } from '@lib/utils'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'border-gray-300 aspect-square h-5 w-5 rounded-full border',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary',
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center transition-all duration-500">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-4 w-4 stroke-monochrome-white" />
        </div>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

const RadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    label: string
    disabled?: boolean
  }
>(({ className, value, label, disabled, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between font-sans',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}>
      <label htmlFor={`radio-${value}`} className="cursor-pointer text-body-1-bold">
        {label}
      </label>
      <RadioGroupItem className="transition-all duration-500" value={value} disabled={disabled} id={`radio-${value}`} />
    </div>
  )
})
RadioItem.displayName = 'RadioItem'

export { RadioGroup, RadioGroupItem, RadioItem }
