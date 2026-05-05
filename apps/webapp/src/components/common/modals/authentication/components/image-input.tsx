import { usePathname } from "next/navigation";

import { toast } from "@/components/ui/use-toast";
import { Label } from "@components/ui/label";
import { getAvatarUrl, validateImage } from "@lib/utils";

import { AuthenticationModal } from "..";
import { useAuthenticationModalStore } from "../store";

export function ImageInput() {
  const { formData, setStep, setFormData } = useAuthenticationModalStore((state) => ({
    formData: state.formData,
    setStep: state.setStep,
    setFormData: state.setFormData,
  }));
  const pathname = usePathname();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-2">
      <img
        src={
          formData.image
            ? typeof formData.image === "string"
              ? formData.isAvatar
                ? getAvatarUrl(formData.image)
                : formData.image
              : URL.createObjectURL(formData.image as any)
            : null
        }
        className="bg-blue-70 h-20 w-20 rounded-full"
      />
      <input
        id="pic"
        type="file"
        className="hidden w-full"
        accept="image/png, image/jpeg, image/jpg"
        onChange={async (e) => {
          const validationResponse: boolean = await validateImage(e.target.files?.[0] as File);
          if (!validationResponse) {
            toast({
              description: "Choose a valid file format",
            });
            return;
          }
          setFormData({ image: URL.createObjectURL(e.target.files?.[0] as any) });
          if (pathname.includes("settings")) {
            AuthenticationModal.open(undefined, "IMAGE_CROPPER");
          } else {
            setStep("IMAGE_CROPPER");
          }
        }}
      />
      <Label htmlFor="pic" className="!text-body-1-demi text-primary cursor-pointer">
        Change profile picture
      </Label>
    </div>
  );
}
