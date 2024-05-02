import { useAuthenticationModalStore } from '../store'
import { getAvatarUrl } from '@lib/utils'
import { Label } from '@components/ui/label'
import { AuthenticationModal } from '..'

export function ImageInput() {
  const { formData, setFormData, setStep, isOpen } = useAuthenticationModalStore((state) => ({
    formData: state.formData,
    setStep: state.setStep,
    setFormData: state.setFormData,
    isOpen: state.isOpen,
  }))

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
          setFormData({ image: URL.createObjectURL(e.target.files?.[0] as any) })
          isOpen ? setStep('IMAGE_CROPPER') : AuthenticationModal.open(undefined, 'IMAGE_CROPPER')
        }}
      />
      <Label htmlFor="pic" className="cursor-pointer !text-body-1-demi text-primary">
        Change profile picture
      </Label>
    </div>
  )
}
