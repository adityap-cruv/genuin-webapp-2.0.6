import {
  InstagramIcon,
  TwitterIcon,
  TiktokIcon,
  LinkedInIcon,
} from "@genuin/ui/icons";
import { LinkIcon } from "lucide-react";

import { Link } from "../link";

export type LinksType = Partial<
  Record<
    "x" | "instagram" | "tiktok" | "custom" | "linkedin" | "reddit",
    string | undefined
  >
>;

export type LinkProps = {
  links: LinksType;
};

/**
 * Component to render social media links.
 *
 * It displays icons for Twitter, Instagram, TikTok, and a custom link if provided.
 * @returns
 */
export function SocialLinks({ links }: LinkProps) {
  return (
    <div className="gencl:flex gencl:gap-2 gencl:[&_svg]:size-5 gencl:text-body-1-medium gencl:text-secondary-600">
      {links.custom && (
        <Link href={links.custom} target="_blank">
          <LinkIcon />
        </Link>
      )}
      {links.x && (
        <Link href={links.x} target="_blank">
          <TwitterIcon className="gencl:fill-secondary-600" />
        </Link>
      )}
      {links.instagram && (
        <Link href={links.instagram} target="_blank">
          <InstagramIcon className="gencl:fill-secondary-600" />
        </Link>
      )}
      {links.tiktok && (
        <Link href={links.tiktok} target="_blank">
          <TiktokIcon className="gencl:fill-secondary-600" />
        </Link>
      )}
      {links.linkedin && (
        <Link href={links.linkedin} target="_blank">
          <LinkedInIcon className="gencl:fill-secondary-600" />
        </Link>
      )}
    </div>
  );
}
