import React from 'react'
import { Button, type ButtonProps } from '../ui/button'
import Analytics from '@/services/analytics'
import { getPlatform } from '@/lib/utils'
import { DownloadAppDialog } from '@components/pages/build/download-app-dialog'

const GetAppButton = ({ buttonText, onClick, ...buttonProps }: ButtonProps & { buttonText: string }) => {
  return (
    <DownloadAppDialog>
      <Button
        {...buttonProps}
        onClick={(e) => {
          onClick?.(e)
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
