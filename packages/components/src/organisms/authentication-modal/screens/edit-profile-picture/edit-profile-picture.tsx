import { ComponentProps, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@genuin/ui/components/form";
import { cn } from "@genuin/ui/lib/utils";
import { Input, Toast } from "@genuin/ui/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkIcon, UploadIcon } from "@genuin/ui/icons";
import { useAuthContext } from "@genuin/components/context/auth";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";
import { fetchImageBlob } from "@genuin/components/react-query/api/profile/image";
import { ImageCropper } from "@genuin/components/organisms/image-cropper";
import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

const formSchema = z.object({
  url: z.string().url("Invalid Url."),
});

type SelectedImageState = File | string | null;

export function EditProfilePicture({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageState>(null);
  const [newProfileImage, setNewProfileImage] = useState("");

  const { closeModal } = useAuthenticationModalContext();

  const onSubmit = async () => {
    const res = await fetchImageBlob(form.getValues("url"));
    setSelectedImage(res);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
    mode: "onBlur",
  });

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } =
    useUpdateUserMutation({
      onSuccess: ({ status }) => {
        if (status) {
          updateUser({ ...user, image: newProfileImage, isAvatar: false });
          Toast.Success({ message: "Your profile image has been updated" });
        }
        closeModal();
      },
      onError: () => {
        form.setError("root", {
          message:
            "Something went wrong while updating username. Please try again!",
        });
      },
    });

  const handleChange = async (file: File) => {
    setSelectedImage(file);
    setFileError("");
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <div className="gencl:flex gencl:items-end gencl:gap-4">
          {selectedImage && (
            <div
              className="gencl:text-secondary-600 gencl:hover:text-blue gencl:hover:cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              <ArrowLeft />
            </div>
          )}
          <h3 className="gencl:text-left gencl:text-headline-3-semi-bold">
            Media Upload
          </h3>
        </div>
      </div>

      {selectedImage && (
        <ImageCropper
          image={selectedImage as string}
          setImage={(image) => {
            updateUserDetails({
              profile_image: image.fileName,
              is_avatar: false,
            });
            setNewProfileImage(image.url);
          }}
          onCancel={() => setSelectedImage(null)}
        />
      )}

      {!selectedImage && (
        <>
          <div className="gencl:mb-0">
            <div
              className={cn(
                "gencl:text-center gencl:mb-5 gencl:rounded-md gencl:border gencl:border-dashed gencl:z-10",
                {
                  "gencl:border-primary": isDragging,
                  "gencl:border-secondary-300": !isDragging,
                }
              )}
            >
              <FileUploader
                onDraggingStateChange={(dragging: any) =>
                  setIsDragging(dragging)
                }
                multiple={false}
                handleChange={handleChange}
                name="file"
                types={["JPG", "PNG", "JPEG"]}
                maxSize={3}
                onTypeError={(err: string) => {
                  setFileError(err || "Invalid file type");
                }}
                onSizeError={() =>
                  setFileError(
                    "Upload failed. Make sure file size is upto 3MB and in .jpg, .png, .jpeg format"
                  )
                }
                hoverTitle=" "
                classes={`drop_area drop_zone custom_style ${isDragging ? "drag-active" : ""}`}
              >
                <div className="gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:p-6 gencl:gap-3">
                  <UploadIcon
                    className={
                      isDragging
                        ? "gencl:stroke-blue gencl:stroke-0"
                        : "gencl:stroke-secondary-600 gencl:stroke-0"
                    }
                  />
                  <div>
                    <p className="gencl:text-body-1-semi-bold">
                      Drag your file(s) or{" "}
                      <span className="gencl:text-primary">browse</span>
                    </p>
                    <p className="gencl:text-body-2-medium gencl:text-secondary-600 jay">
                      Max 3 MB files are allowed
                    </p>
                  </div>
                </div>
              </FileUploader>
            </div>
            {fileError && (
              <p className="gencl:text-body-2-medium gencl:text-red gencl:mt-2 gencl:mb-1">
                {fileError}
              </p>
            )}
          </div>
          <p className="gencl:text-secondary-600 gencl:text-body-1-medium">
            Only support .jpg, .png, .jpeg with file size upto 3MB
          </p>
          <div className="gencl:align-middle gencl:flex">
            <span className="gencl:border-b gencl:border-secondary-100 gencl:w-100 gencl:h-2" />
            <span className="gencl:px-2 gencl:text-body-2-medium gencl:text-secondary-600">
              OR
            </span>
            <span className="gencl:border-b gencl:border-secondary-100 gencl:w-100 gencl:h-2" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="gencl:flex gencl:flex-col gencl:gap-2"
            >
              <div
                className={`gencl:flex gencl:gap-4 ${form.formState.errors.url ? "gencl:items-center" : "gencl:items-end"}`}
              >
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => {
                    return (
                      <FormItem className="sm:w-full gencl:flex-1">
                        <FormLabel
                          htmlFor="url-input"
                          className="gencl:flex gencl:justify-between"
                        >
                          Upload from URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="url-input"
                            autoComplete="off"
                            placeholder="Enter URL"
                            icon={
                              <LinkIcon className="gencl:w-5 gencl:h-5 gencl:stroke-secondary-900" />
                            }
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <SubmitButton
                  disabled={!form.formState.isValid}
                  isLoading={isPendingUpdateUser}
                  title="Upload"
                />
              </div>
              {form.formState.errors.root?.message && (
                <FormMessage error>
                  {form.formState.errors.root?.message}
                </FormMessage>
              )}
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
