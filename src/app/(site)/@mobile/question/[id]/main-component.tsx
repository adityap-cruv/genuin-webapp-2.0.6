'use client'
import { DownloadAppDialog } from '@components/pages/home/download-app-dialog'
import { Button } from '@components/ui/button'

interface Props {
  questionDetails: any
}

export function MainComponent({ questionDetails }: Props) {
  const previewImage = questionDetails.preview_image

  if (previewImage)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div style={{ width: '100%' }}>
          <img style={{ width: '100%', height: 'auto', borderRadius: '20px' }} src={previewImage} alt="app store" />
        </div>
        <div className="mt-6">
          <DownloadAppDialog isMobile>
            <Button className="px-6 py-6">
              <p className="mx-2 text-title-2-bold text-new-off-white">Get App</p>
            </Button>
          </DownloadAppDialog>
        </div>
      </div>
    )
}
