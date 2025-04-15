'use client'
import GetAppButton from '@/components/common/get-app-button'

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
          <GetAppButton
            buttonText="Get App"
            className="mx-2 px-6 py-6 text-title-2-bold text-monochrome-white"
            variant="default"
          />
        </div>
      </div>
    )
}
