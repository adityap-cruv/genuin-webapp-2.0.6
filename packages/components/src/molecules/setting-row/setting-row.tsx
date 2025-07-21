import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  type HTMLAttributes,
  useState,
} from "react";
import { Switch } from "@genuin/ui/components/switch";
import {
  ChevronRightIcon,
  InstagramIcon,
  LinkedInIcon,
  TiktokIcon,
  TwitterIcon,
  YouTubeIcon,
} from "@genuin/ui/icons";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { StepsType } from "@genuin/components/organisms/authentication-modal/context";
import { cn } from "@genuin/ui/lib/utils";

interface SocialIds {
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
}

interface SettingFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  subLabel?: string;
  value?: string;
  socialIds?: SocialIds;
  onClick?: MouseEventHandler<HTMLDivElement>;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (val: boolean) => void;
  modalType?: StepsType;
}

const SOCIAL_ICON_MAP: Record<keyof SocialIds, ReactNode> = {
  instagram: <InstagramIcon />,
  linkedin: <LinkedInIcon />,
  tiktok: <TiktokIcon />,
  youtube: <YouTubeIcon />,
  x: <TwitterIcon />,
};

export const SettingRow: FC<SettingFieldProps> = ({
  label,
  subLabel,
  value,
  socialIds,
  onClick,
  toggle,
  toggleValue,
  onToggleChange,
  modalType,
  ...rest
}) => {
  const renderedIcons =
    socialIds &&
    Object.entries(socialIds)
      .filter(([_, id]) => id)
      .map(([platform], idx) => (
        <span key={idx} className="gencl:w-5 gencl:h-5">
          {SOCIAL_ICON_MAP[platform as keyof SocialIds]}
        </span>
      ));

  const [isHovered, setIsHovered] = useState(false);

  const Content = (
    <div
      onMouseEnter={() => !toggle && setIsHovered(true)}
      onMouseLeave={() => !toggle && setIsHovered(false)}
      onClick={!toggle ? onClick : undefined}
      className={cn(
        "gencl:flex gencl:justify-between gencl:w-full gencl:mb-4 gencl:items-center",
        { "gencl:cursor-pointer": !toggle }
      )}
      {...rest}
    >
      <div>
        <p className="gencl:text-body-1-medium gencl:text-secondary-900">
          {label}
        </p>
        {subLabel && (
          <span className="gencl:text-body-1-medium gencl:text-secondary-600">
            {subLabel}
          </span>
        )}
      </div>

      <div className="gencl:flex gencl:items-center gencl:gap-3">
        <div>
          {renderedIcons?.length ? (
            <div className="gencl:flex gencl:items-center gencl:gap-3">
              {renderedIcons}
            </div>
          ) : modalType === "DELETE_CONFIRMATION" ||
            modalType === undefined ||
            toggle ? null : (
            <span className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:line-clamp-1 gencl:max-w-sm">
              {value?.trim() ? value : "Not set"}
            </span>
          )}
        </div>

        {!toggle && (
          <div
            className={cn(
              "gencl:w-6 gencl:h-6 gencl:rounded-sm gencl:flex gencl:justify-center gencl:flex-center",
              {
                "gencl:bg-secondary-100": isHovered,
              }
            )}
          >
            <ChevronRightIcon
              className={cn(
                "gencl:h-4 gencl:w-4 gencl:flex-shrink-0 gencl:scale-75",
                {
                  "gencl:!stroke-black": isHovered,
                }
              )}
            />
          </div>
        )}
      </div>

      {toggle && (
        <Switch
          checked={toggleValue}
          onCheckedChange={(checked: boolean) => onToggleChange?.(checked)}
        />
      )}
    </div>
  );

  return toggle ? (
    Content
  ) : (
    <AuthenticationModal customStep={modalType} asChild>
      {Content}
    </AuthenticationModal>
  );
};
