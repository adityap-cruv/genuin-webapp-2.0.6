import React, { createRef } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { Button } from '@components/ui/button'
import { useAuthenticationModalStore } from '../store'

export function ImageCropper() {
  const cropperRef = createRef<any>()
  const { image, setImage, setStep, goBack } = useAuthenticationModalStore((state) => ({
    image: state.formData.image,
    setImage: state.setFormData,
    setStep: state.setStep,
    goBack: state.goToPrevios,
  }))

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

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== 'undefined') {
      const canvas = getRoundedCanvas(cropperRef.current?.cropper.getCroppedCanvas())

      if (canvas) {
        canvas.toBlob((blob: any) => {
          if (blob) {
            setImage({ image: new File([blob], `cropper_image.png`, { type: 'image/png' }), isAvatar: false })
            goBack()
          }
        }, 'image/png')
      }
    }
  }

  return (
    <>
      <h3 className="flex w-full items-center  justify-center text-heading-3">Edit Profile picture</h3>
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
        className="w-full bg-new-off-black  text-title-3-demi !text-new-off-white hover:bg-new-dark-grey"
        onClick={getCropData}>
        Save Changes
      </Button>
    </>
  )
}
