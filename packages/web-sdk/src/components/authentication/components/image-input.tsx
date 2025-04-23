import { getAvatarUrl } from '@/utils'
import { Label } from '@/components/ui/label'
import { AuthenticationModal } from '..'
import { useRef, useEffect } from 'react'
import { useAuthModalContext } from '@/components/authentication/context'
import { toast } from '@/components/ui/use-toast'

type ImageInputPropsType = {
  forSettings?: boolean
}

const validateImage = (image: File): boolean => {
  const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg']
  if (!validImageTypes.includes(image.type)) return false
  return true
}

/**
 * This component takes image from user and sets it into form data.
 * However, This component is used at only places, (authentication modal, settings) to take image of user.
 * In need to use any other places we have to imporove this component.
 * @returns
 */
export function ImageInput({ forSettings }: ImageInputPropsType) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { formData, setFormData, isOpen } = useAuthModalContext()

  useEffect(() => {
    if (!isOpen && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [isOpen])

  return (
    <div className='flex w-full flex-col items-center justify-center gap-y-2'>
      <img
        src={
          formData.image
            ? typeof formData.image === 'string'
              ? formData.isAvatar
                ? getAvatarUrl(formData.image)
                : formData.image
              : URL.createObjectURL(formData.image as any)
            : null
        }
        className='h-20 w-20 rounded-full bg-tertiary'
      />
      <input
        ref={fileInputRef}
        id='pic'
        type='file'
        className='hidden w-full'
        accept='image/png, image/jpeg, image/jpg'
        onChange={(e) => {
          const validationResponse: boolean = validateImage(
            e.target.files?.[0] as File,
          )
          if (!validationResponse) {
            toast({
              description: 'Choose a valid file format',
            })
            return
          }
          setFormData({
            image: URL.createObjectURL(e.target.files?.[0] as any),
          })
          AuthenticationModal.open(
            undefined,
            forSettings ? 'IMAGE_CROPPER_SETTINGS' : 'IMAGE_CROPPER',
          )
        }}
      />
      <Label
        htmlFor='pic'
        className='cursor-pointer !text-body-1-demi text-primary'>
        Change profile picture
      </Label>
    </div>
  )
}
