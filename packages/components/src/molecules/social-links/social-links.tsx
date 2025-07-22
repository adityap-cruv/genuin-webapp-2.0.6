import {
  InstagramIcon,
  TwitterIcon,
  TiktokIcon,
  LinkedInIcon,
} from "@genuin/ui/icons";
import { LinkIcon } from "lucide-react";

import { Link } from "../link";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";

export type LinksType = Partial<
  Record<
    "x" | "instagram" | "tiktok" | "custom" | "linkedin" | "reddit",
    string | undefined
  >
>;

const socialLinksVariants = cva(
  "gencl:flex gencl:gap-2 gencl:[&_svg]:size-5 gencl:text-body-1-medium gencl:text-secondary-600",
  {
    variants: {
      variant: {
        default: "",
        /**
         * This variant will show link of the social media link in side of the icon.
         */
        detailed: "gencl:flex-col",
      },
      iconSize: {
        sm: "gencl:[&_svg]:size-5",
        md: "gencl:[&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type LinkProps = {
  links: LinksType;
} & VariantProps<typeof socialLinksVariants>;

/**
 * Component to render social media links.
 *
 * It displays icons for Twitter, Instagram, TikTok, and a custom link if provided.
 * @returns
 */
export function SocialLinks({ links, variant, iconSize }: LinkProps) {
  const textClassName =
    "gencl:text-body-1-medium gencl:text-blue gencl:line-clamp-1 gencl:break-all";

  const itemClassName = cn(
    variant === "detailed" && "gencl:flex gencl:items-center gencl:gap-2"
  );

  return (
    <div className={socialLinksVariants({ variant, iconSize })}>
      {links.custom && (
        <Link href={links.custom} target="_blank" className={itemClassName}>
          <LinkIcon />
          {links.custom && variant === "detailed" && (
            <p className={textClassName}>{links.custom}</p>
          )}
        </Link>
      )}
      {links.x && (
        <Link href={links.x} target="_blank" className={itemClassName}>
          <TwitterIcon className="gencl:fill-secondary-600" />
          {links.x && variant === "detailed" && (
            <p className={textClassName}>{links.x}</p>
          )}
        </Link>
      )}
      {links.instagram && (
        <Link href={links.instagram} target="_blank" className={itemClassName}>
          <InstagramIcon className="gencl:fill-secondary-600" />
          {links.instagram && variant === "detailed" && (
            <p className={textClassName}>{links.instagram}</p>
          )}
        </Link>
      )}
      {links.tiktok && (
        <Link href={links.tiktok} target="_blank" className={itemClassName}>
          <TiktokIcon className="gencl:fill-secondary-600" />
          {links.tiktok && variant === "detailed" && (
            <p className={textClassName}>{links.tiktok}</p>
          )}
        </Link>
      )}
      {links.linkedin && (
        <Link href={links.linkedin} target="_blank" className={itemClassName}>
          <LinkedInIcon className="gencl:fill-secondary-600" />
          {links.linkedin && variant === "detailed" && (
            <p className={textClassName}>{links.linkedin}</p>
          )}
        </Link>
      )}
    </div>
  );
}
