declare module "*.css" {}

// Static image asset declarations — compatible with next/image StaticImageData
declare module "*.webp" {
  import type { StaticImageData } from "next/dist/shared/lib/get-img-props";
  const content: StaticImageData;
  export default content;
}

declare module "*.gif" {
  import type { StaticImageData } from "next/dist/shared/lib/get-img-props";
  const content: StaticImageData;
  export default content;
}

declare module "*.png" {
  import type { StaticImageData } from "next/dist/shared/lib/get-img-props";
  const content: StaticImageData;
  export default content;
}

declare module "*.jpg" {
  import type { StaticImageData } from "next/dist/shared/lib/get-img-props";
  const content: StaticImageData;
  export default content;
}

declare module "*.jpeg" {
  import type { StaticImageData } from "next/dist/shared/lib/get-img-props";
  const content: StaticImageData;
  export default content;
}
