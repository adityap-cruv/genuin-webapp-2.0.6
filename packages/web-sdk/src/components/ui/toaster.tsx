'use client'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/utils'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        className,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast
            key={id}
            {...props}
            className={cn(
              'flex items-center',
              variant === 'destructive' && 'border-[#FFA0A0] bg-[#FFF0F0]',
              className,
            )}>
            <div className='flex items-center justify-center gap-4'>
              {/* {variant === 'destructive' && (
                <Image
                  src={errorIcon}
                  alt='Error'
                  width={24}
                  height={24}
                />
              )} */}
              <div className='grid gap-1'>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
