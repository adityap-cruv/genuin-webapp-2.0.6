declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  // @svgr/webpack exports a React component as the default export.
  // url-loader attaches src/height/width so SVG imports also satisfy
  // next/image's StaticImageData shape and can be used as <Image src={...} />.
  const SVG: FC<SVGProps<SVGSVGElement>> & {
    src: string;
    height: number;
    width: number;
  };
  export default SVG;
}
