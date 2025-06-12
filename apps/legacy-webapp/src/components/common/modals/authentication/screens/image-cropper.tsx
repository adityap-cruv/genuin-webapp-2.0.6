import React, { createRef, useState } from 'react'
import Cropper from 'react-cropper'
// import 'cropperjs/dist/cropper.css'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'
import { ModalShell } from '../modal-shell'
import { v4 } from 'uuid'
import { usePathname } from 'next/navigation'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { uploadProfileImage } from '../api/auth'
import { CloseIcon } from '@icons/close-icon'

export function ImageCropper() {
  const cropperRef = createRef<any>()
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  /*  Here step is previousStep because we want if we want to upload image or not
    in case of signup we don't upload image we directly sent it by API.
    while in other cases we have to upload image to aws and then send response to api.
   because update_user_profile api is private. */
  const { image, setImage, goBack, close } = useAuthenticationModalStore((state) => ({
    image: state.formData.image,
    setImage: state.setFormData,
    setStep: state.setStep,
    goBack: state.goToPrevious,
    close: state.close,
  }))
  const pathname = usePathname()
  const user = useGenuinOptions().user

  function getRoundedCanvas(sourceCanvas: any) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const width = sourceCanvas.width
    const height = sourceCanvas.height

    canvas.width = width
    canvas.height = height
    if (context) {
      context.imageSmoothingEnabled = true
      context?.drawImage(sourceCanvas, 0, 0, width, height)
      context.globalCompositeOperation = 'destination-in'
      context?.beginPath()
      context?.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true)
      context?.fill()
    }
    return canvas
  }

  const getCropData = async () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const canvas = getRoundedCanvas(cropperRef.current?.cropper.getCroppedCanvas())
      if (canvas) {
        canvas.toBlob((blob: any) => {
          if (blob) {
            const file = new File([blob], `${v4()}.png`, { type: 'image/png' })
            setUploadingImage(true)
            void uploadProfileImage(file)
              .then((res) => {
                if (res) {
                  setImage({ imageName: file.name, image: file, isAvatar: false })
                  pathname.includes('settings') ? close() : goBack()
                } else {
                  setError('Something went wrong. Please try again.')
                }
              })
              .catch((e) => {
                setError('Something went wrong please try again.')
              })
              .finally(() => {
                setUploadingImage(false)
              })
          }
        }, 'image/png')
      }
    }
  }

  return (
    <ModalShell className="relative">
      {pathname.includes('settings') && (
        <div className="absolute -right-0 -top-8">
          <CloseIcon
            onClick={() => {
              setImage({ image: user?.image ?? undefined, isAvatar: false })
              close()
            }}
          />
        </div>
      )}
      <h3 className="mb-4 flex w-full items-center justify-center text-title-1-demi sm:text-heading-3">
        Edit Profile picture
      </h3>
      <div className="pb-2">
        <Cropper
          viewMode={1}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          cropBoxResizable
          background
          responsive
          autoCropArea={1}
          checkOrientation={false}
          zoomable={true}
          zoomOnWheel
          initialAspectRatio={1}
          ref={cropperRef}
          src={typeof image === 'string' ? image : URL.createObjectURL(image as any)}
          cropBoxMovable
          aspectRatio={1}
          style={{ maxHeight: '400px', maxWidth: '500px' }}
        />
      </div>
      <Button
        disabled={uploadingImage}
        className="w-full text-title-3-demi !text-monochrome-white"
        onClick={getCropData}>
        {uploadingImage ? <p>Uploading...</p> : <p>Save Changes</p>}
      </Button>
      {error && <p className="flex items-center justify-center text-title-3-med text-supplementary-red">{error}</p>}
    </ModalShell>
  )
}
