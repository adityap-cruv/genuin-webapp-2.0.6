// src/components/common/ShareButton.tsx
import React from 'react'
import { Button } from '@components/ui/button'
import { ShareIcon } from '@icons/share-icon'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { getCurrentShareUrl } from '@lib/utils'
import { useToast } from '@components/ui/use-toast'

type ShareButtonProps = {
  className?: string
  url: string
}

export default function ShareButton({ className, url }: ShareButtonProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  return (
    <Button
      title="Copy Link"
      size="custom"
      variant="outline"
      className={`border border-primary p-[3px] group ${className}`}
      onClick={async () =>
        await shareFn({
          shareLink: getCurrentShareUrl({ url }),
          toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
        })
      }>
      <ShareIcon className="stroke-primary" />
    </Button>
  )
}
