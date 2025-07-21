import { createRef, useState } from "react";
import Cropper from "react-cropper";
// import "cropperjs/dist/cropper.css";
import { uploadProfileImage } from "@genuin/components/react-query/api/profile/image";
import { Button } from "@genuin/ui/components";

export function ImageCropper({
  image,
  setImage,
  onCancel,
}: {
  image: string;
  setImage: ({ fileName, url }: { fileName: string; url: string }) => void;
  onCancel: () => void;
}) {
  const cropperRef = createRef<any>();
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  function getRoundedCanvas(sourceCanvas: any) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    canvas.width = width;
    canvas.height = height;
    if (context) {
      context.imageSmoothingEnabled = true;
      context?.drawImage(sourceCanvas, 0, 0, width, height);
      context.globalCompositeOperation = "destination-in";
      context?.beginPath();
      context?.arc(
        width / 2,
        height / 2,
        Math.min(width, height) / 2,
        0,
        2 * Math.PI,
        true
      );
      context?.fill();
    }
    return canvas;
  }

  const getCropData = async () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const canvas = getRoundedCanvas(
        cropperRef.current?.cropper.getCroppedCanvas()
      );
      if (canvas) {
        canvas.toBlob((blob: any) => {
          if (blob) {
            const timeStamp = Date.now();
            const file = new File([blob], `${timeStamp}.png`, {
              type: "image/png",
            });
            setUploadingImage(true);
            uploadProfileImage(file)
              .then((res) => {
                if (res) {
                  setImage({ fileName: file.name, url: res });
                } else {
                  setError("Something went wrong. Please try again.");
                }
              })
              .catch((e) => {
                setError("Something went wrong please try again.");
              })
              .finally(() => {
                setUploadingImage(false);
              });
          }
        }, "image/png");
      }
    }
  };

  return (
    <div>
      <div className="gencl:pb-5">
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
          src={
            typeof image === "string"
              ? image
              : URL.createObjectURL(image as any)
          }
          cropBoxMovable
          aspectRatio={1}
          style={{ maxHeight: "400px", maxWidth: "900px" }}
        />
      </div>
      <div className="gencl:flex gencl:justify-end gencl:gap-3">
        <Button theme="text" onClick={onCancel} disabled={uploadingImage}>
          Cancel
        </Button>
        <Button disabled={uploadingImage} onClick={getCropData}>
          {uploadingImage ? <p>Uploading...</p> : "Done"}
        </Button>
      </div>
      {error && (
        <p className="gencl:text-title-3-med gencl:text-error-status">
          {error}
        </p>
      )}
    </div>
  );
}
