import React from 'react'
import { Button } from '../ui/button'
import Analytics from '@/services/analytics'
import { getPlatform } from '@/lib/utils'
import { DownloadAppDialog } from '@components/pages/build/download-app-dialog'

const GetAppButton = ({
  className,
  variant,
  buttonText,
  size,
}: {
  className?: string
  variant: 'outline' | 'custom' | 'default'
  buttonText: string
  size?: 'custom' | 'default' | 'sm' | 'lg' | 'index-page'
}) => {
  return (
    <DownloadAppDialog>
      <Button
        size={size}
        className={className}
        variant={variant}
        onClick={() => {
          void Analytics.track({
            eventName: 'Get App Button Clicked',
            properties: {
              device_type: getPlatform(),
            },
          })
        }}>
        {buttonText}
      </Button>
    </DownloadAppDialog>
  )
}

export default GetAppButton
