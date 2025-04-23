import { useModalHandler } from '@/hooks/useModalHandler'
import { Button, ButtonProps } from './ui/button'
import { Analytics } from '@/analytics'
import { getPlatform } from '@/utils'

const GetAppButton = ({
  buttonText,
  onClick,
  ...buttonProps
}: ButtonProps & { buttonText: string }) => {
  const { handleAppDownloadModal } = useModalHandler()
  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        onClick?.(e)
        handleAppDownloadModal()

        Analytics.track(Analytics.EventNames.GetAppButtonClicked, {
          device_type: getPlatform(),
        })
      }}>
      {buttonText}
    </Button>
  )
}

export default GetAppButton
