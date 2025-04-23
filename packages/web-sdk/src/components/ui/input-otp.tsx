'use client'

import * as React from 'react'
import { OTPInput, type SlotProps } from 'input-otp'
import { Dot } from 'lucide-react'

import { cn } from '@/utils'

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, style, ...props }, ref) => (
  <OTPInput
    ref={ref}
    style={{
      ...style,
      background: 'transparent !important',
      border: 'none !important',
    }}
    containerClassName={cn('flex !border-none items-center gap-2', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex w-full items-center justify-around', className)}
    {...props}
  />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  SlotProps & React.ComponentPropsWithoutRef<'div'>
>(({ char, hasFakeCaret, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative mx-1 flex h-10 w-10 items-center justify-center rounded-md outline-none transition-all md:h-14 md:w-14',
        className,
      )}
      {...props}>
      <p
        className={cn(
          'text-title-1-demi text-secondary',
          !char && 'text-tertiary',
        )}>
        {char ?? '•'}
      </p>
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='animate-caret-blink h-4 w-px bg-foreground duration-1000' />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div
    ref={ref}
    role='separator'
    {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
