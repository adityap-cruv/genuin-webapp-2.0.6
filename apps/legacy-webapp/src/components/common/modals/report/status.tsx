'use client'

import { Button } from '@/components/ui/button'

interface StatusDialogProps {
  title: string
  subtitle: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const Status = ({ subtitle, action, title }: StatusDialogProps) => {
  return (
    <div className="rounded-t-2xl border-none p-6 md:rounded-2xl">
      <p className="text-center text-body-2-bold-home">{title}</p>
      <p className="mt-2 text-center text-title-3-med md:max-w-xs">{subtitle}</p>
      {action && (
        <Button
          className="mt-4 w-full rounded-md bg-primary py-2 text-title-3-demi text-monochrome-white"
          onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
