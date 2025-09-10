"use client";
import { cn } from "@genuin/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@genuin/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@genuin/ui/components/form";
import { Input } from "@genuin/ui/components/input";
import { LinkThumbnail } from "@genuin/components/molecules/link-thumbnail";
import { LinkIcon } from "@genuin/ui/icons";
import { useRef, useState } from "react";
import { usePostFetchMetaMutation } from "@genuin/components/react-query/api/linkouts/fetch-meta";
import { uploadProfileImage } from "@genuin/components/react-query/api/profile/image";

const formSchema = z.object({
  url: z.string().url().min(1, { message: "URL is required" }),
  title: z
    .string()
    .trim()
    // .min(1, { message: "Link title is required" })
    .max(56, { message: "Max length should be 56" }),
});

interface AddLinksProps {
  url: string;
  title: string;
  image: string;
  onCancel?: () => void;
  onSubmit?: (data: { url: string; title: string; image: string }) => void;
}

export const AddLinks: React.FC<AddLinksProps> = ({
  url,
  title,
  image,
  onCancel,
  onSubmit: onSubmitProp,
}: AddLinksProps) => {
  const UPLOAD_LINKOUTS_PATH = "uploads/linkouts";
  const FILE_PREFIX = "linkouts";

  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [fileUrl, setFileUrl] = useState(image ?? "");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      url: url ?? "",
      title: title ?? "",
    },
  });
  const { isValid, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitProp?.({ ...values, image: fileUrl });
    form.reset();
  }

  const { mutate: fetchMetaPost, isPending: fetchMetaData } =
    usePostFetchMetaMutation({
      onSuccess: async ({ res }) => {
        if (res.data.code === 200) {
          const metaTitle = res.data.data.title || "";
          const metaImageUrl = res.data.data.image || "";

          // Set meta image in state
          convertImageUrlToBlob(metaImageUrl);

          // Set title in input
          form.setValue("title", metaTitle, {
            shouldDirty: true,
            shouldValidate: true,
          });

          // Validate title length
          if (metaTitle.length > 56) {
            form.setError("title", {
              type: "manual",
              message: "Max length should be 56",
            });
          }
        }
      },
      onError: () => {
        form.setError("root", {
          message:
            "Something went wrong while fetching meta data. Please try again.",
        });
      },
    });

  const convertImageUrlToBlob = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const timeStamp = Date.now();
      const file = new File([blob], `${FILE_PREFIX}_${timeStamp}.png`, {
        type: blob.type || "image/png",
      });

      const uploadRes = await uploadProfileImage(file, UPLOAD_LINKOUTS_PATH);
      if (uploadRes) {
        const fileName = file.name;
        const uploadedUrl = `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/${UPLOAD_LINKOUTS_PATH}/${fileName}`;
        setFileUrl(uploadedUrl);
      }
    } catch (error) {
      console.error("Error converting image URL to Blob:", error);
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const newUrl = e.target.value;
    onChange(newUrl);

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      if (newUrl) {
        fetchMetaPost({ url: newUrl });
      }
    }, 1000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gencl:bg-white gencl:relative gencl:h-full gencl:w-full gencl:border gencl:border-secondary-150 gencl:p-4 gencl:rounded-lg"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => {
            const errors = useFormField().error;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="is-required">URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter URL"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
                      errors && "!gencl:border-red"
                    )}
                    {...field}
                    icon={<LinkIcon />}
                    onChange={(e) => handleUrlChange(e, field.onChange)}
                    disabled={fetchMetaData}
                    isLoading={fetchMetaData}
                  />
                </FormControl>
                <FormMessage className={cn("!gencl:text-cap-1-demi")} />
              </FormItem>
            );
          }}
        />

        <FormField
          name="title"
          control={form.control}
          render={({ field }) => {
            const errors = useFormField().error;
            const currentLength = field.value?.length || 0;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="gencl:flex gencl:justify-between">
                  Link title
                  <span className="gencl:text-secondary-500 gencl:text-body-2-medium">
                    {currentLength}/56
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
                      errors && "!gencl:border-red"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn("!text-cap-1-demi")} />
              </FormItem>
            );
          }}
        />

        <FormLabel className="gencl:mb-2 gencl:block">Link thumbnail</FormLabel>
        <LinkThumbnail
          fileDimension="1 : 1"
          fileTypes=".jpg, .png, .jpeg"
          height={100}
          scale={1}
          image={fileUrl}
          title="Thumbnail"
          width={100}
          onImageChange={({ file }) => {
            setFileUrl(
              `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL}/uploads/linkouts/${file.name}`
            );
            setThumbnailRemoved(true);
          }}
          handelRemove={() => {
            setFileUrl("");
            setThumbnailRemoved(true);
          }}
        />
        <div className="gencl:flex gencl:justify-end gencl:gap-3">
          <Button size="sm" theme="custom" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="default"
            type="submit"
            disabled={!isValid || (!isDirty && !thumbnailRemoved)}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
