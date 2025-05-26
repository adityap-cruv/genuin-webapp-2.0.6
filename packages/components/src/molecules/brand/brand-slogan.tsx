import { useBaseContext } from "src/context/base";
import { Image } from "@genuin/ui/image";
import { ComponentProps } from "react";

type BrandSloganProps = ComponentProps<typeof Image>;

export function BrandSlogan({ ...props }: BrandSloganProps) {
  const { brandDetails } = useBaseContext();
  // Early return if brandDetails or slogan is not available
  if (!brandDetails?.slogan) {
    return null;
  }
  const { image, text, font } = brandDetails.slogan;

  // Check if we have valid content to display
  const hasValidImage =
    image && typeof image === "string" && image.trim() !== "";
  const hasValidText = text && typeof text === "string" && text.trim() !== "";
  // If neither image nor text is valid, don't render anything
  if (!hasValidImage && !hasValidText) {
    return null;
  }

  return (
    <div className="gencl:px-16 gencl:w-2xl gencl:flex gencl:justify-center">
      {hasValidImage ? (
        <Image
          src={image}
          className="gencl:w-80"
          alt="Brand slogan"
          useWebp={false}
          {...props}
        />
      ) : (
        <p
          className="gencl:text-center"
          style={{
            fontWeight: font?.weight?.trim() || "",
            fontFamily: font?.style?.trim() || "inherit",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
