'use client'
import { Button } from '@/components/ui/button'

type StatusDialogProps = {
  title: string
  subtitle: string
  action?: {
    label: string
    onClick: () => void
  }
}
export const Status = ({ title, subtitle, action }: StatusDialogProps) => {
  return (
    <p className='rounded-t-2xl md:rounded-2xl border-none p-6 font-sans'>
      <p className='text-center text-title-1-med'>{title}</p>
      <p
        className='mt-2 text-center md:max-w-xs text-title-3-med'
        onClick={action?.onClick}>
        {subtitle}
      </p>
      {action && (
        <Button
          type='submit'
          className='w-full mt-4 rounded-md bg-primary py-2 text-title-3-demi text-monochrome-white'
          onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </p>
  )
}
