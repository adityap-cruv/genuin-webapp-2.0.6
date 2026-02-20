"use client";

import { Dialog, DialogContent, DialogTrigger } from "@genuin/ui/dialog";
import React, { ComponentProps, useState } from "react";
import "cropperjs/dist/cropper.css";
import { FileUploader } from "react-drag-drop-files";
import { useForm } from "react-hook-form";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, LinkIcon, UploadIcon } from "@genuin/ui/icons";
import { fetchImageBlob } from "@genuin/components/react-query/api/profile/image";
import { ImageCropper } from "@genuin/components/organisms/image-cropper";
import { Button } from "@genuin/ui/components/button";
import { Input } from "@genuin/ui/components/input";
import { Loader } from "@genuin/ui/components/loader";

type MediaModalProps = ComponentProps<typeof Dialog> & {
  children: React.ReactNode;
  onImageChange?: (args: { file: File; url: string }) => void;
  title?: string;
  uploadPath?: string;
  fileNamePrefix?: string;
  aspectRatio: number;
  roundCrop: boolean;
};

type SelectedImageState = File | string | null;

const imageUrlRegex = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

const formSchema = z.object({
  url: z
    .string()
    .url("Invalid URL.")
    .refine((val) => !val.startsWith("data:"), {
      message: "Base64 data URLs are not allowed.",
    })
    .refine((val) => imageUrlRegex.test(val), {
      message:
        "Only image URLs (.jpg, .jpeg, .png, .gif, .webp, .svg) are allowed.",
    }),
});

export function MediaModal({
  children,
  onImageChange,
  title,
  uploadPath,
  fileNamePrefix,
  aspectRatio,
  roundCrop,
  ...props
}: MediaModalProps) {
  const MAX_FILE_SIZE_ALLOW = 3; // file size in MB
  const [open, setOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageState>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async () => {
    try {
      setIsUploading(true);
      const res = await fetchImageBlob(form.getValues("url"));
      setSelectedImage(res);
    } catch (err) {
      form.setError("root", { message: "Failed to fetch image. Try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
    mode: "onChange",
  });

  const handleChange = async (file: File) => {
    setSelectedImage(file);
    setFileError("");
  };

  return (
    <Dialog modal open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="gencl:bg-white gencl:!max-w-4xl gencl:sm:min-w-lg gencl:sm:p-10 gencl:md:min-w-xl gencl:rounded-2xl gencl:space-y-4">
        <div className="gencl:space-y-2">
          <div className="gencl:flex gencl:items-end gencl:gap-4">
            {selectedImage && (
              <div
                className="gencl:text-secondary-600 gencl:hover:text-blue gencl:hover:cursor-pointer"
                onClick={() => setSelectedImage(null)}
              >
                <ArrowLeftIcon />
              </div>
            )}
            <h3 className="gencl:text-left gencl:text-headline-3-semi-bold">
              {title}
            </h3>
          </div>
        </div>

        {selectedImage && (
          <ImageCropper
            image={selectedImage as string}
            setImage={({ file, url }) => {
              onImageChange?.({ file, url });
              setOpen(false);
            }}
            onCancel={() => setSelectedImage(null)}
            uploadPath={uploadPath ?? ""}
            fileNamePrefix={fileNamePrefix ?? ""}
            aspectRatio={aspectRatio}
            roundCrop={roundCrop}
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
                  },
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
                  maxSize={MAX_FILE_SIZE_ALLOW}
                  onTypeError={(err: string) => {
                    setFileError(err || "Invalid file type");
                  }}
                  onSizeError={() =>
                    setFileError(
                      "Upload failed. Make sure file size is upto 3MB and in .jpg, .png, .jpeg format",
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
                      <p className="gencl:text-body-2-medium gencl:text-secondary-600">
                        Max {MAX_FILE_SIZE_ALLOW}MB files are allowed
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
              Only support .jpg, .png, .jpeg with file size upto{" "}
              {MAX_FILE_SIZE_ALLOW}MB
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
                // onSubmit={form.handleSubmit(onSubmit)}
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
                        <FormItem className="gencl:sm:w-full gencl:flex-1">
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
                  <Button
                    type="button"
                    onClick={() => onSubmit()}
                    disabled={!form.formState.isValid || isUploading}
                  >
                    {isUploading && <Loader size="sm" />}
                    Upload
                  </Button>
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
      </DialogContent>
    </Dialog>
  );
}
