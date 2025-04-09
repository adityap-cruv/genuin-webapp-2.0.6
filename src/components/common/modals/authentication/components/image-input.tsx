import { useAuthenticationModalStore } from '../store'
import { getAvatarUrl } from '@lib/utils'
import { Label } from '@components/ui/label'
import { AuthenticationModal } from '..'
import { usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

const validateImage = (image: File): boolean => {
  const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg']
  if (!validImageTypes.includes(image.type)) return false
  return true
}

export function ImageInput() {
  const { formData, setStep, setFormData } = useAuthenticationModalStore((state) => ({
    formData: state.formData,
    setStep: state.setStep,
    setFormData: state.setFormData,
  }))
  const pathname = usePathname()

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2">
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
        className="h-20 w-20 rounded-full bg-blue-70"
      />
      <input
        id="pic"
        type="file"
        className="hidden w-full"
        accept="image/png, image/jpeg, image/jpg"
        onChange={(e) => {
          const validationResponse: boolean = validateImage(e.target.files?.[0] as File)
          if (!validationResponse) {
            toast({
              description: 'Choose a valid file format',
            })
            return
          }
          setFormData({ image: URL.createObjectURL(e.target.files?.[0] as any) })
          pathname.includes('settings')
            ? AuthenticationModal.open(undefined, 'IMAGE_CROPPER')
            : setStep('IMAGE_CROPPER')
        }}
      />
      <Label htmlFor="pic" className="cursor-pointer !text-body-1-demi text-primary">
        Change profile picture
      </Label>
    </div>
  )
}
