import { type FC } from "react";
import { SettingRow } from "@genuin/components/molecules/setting-row";
import { Avatar, Button } from "@genuin/ui/components";
import { cn } from "@genuin/ui/lib/utils";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

export const EditProfileSettings: FC = () => {
  const { user } = useAuthContext();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const socialIds = {
    instagram: user?.instaId,
    linkedin: user?.linkedinId,
    tiktok: user?.tiktokId,
    youtube: user?.youtubeId,
    x: user?.xId,
  };

  return (
    <>
      {isDesktop && (
        <h4 className="gencl:text-headline-4-medium gencl:mb-4">
          Edit Profile
        </h4>
      )}
      <div className="gencl:flex gencl:gap-4 gencl:mb-4 gencl:flex-col gencl:items-center gencl:lg:flex-row gencl:lg:items-start! gencl:lg:justify-start">
        <div className="gencl:relative gencl:mb-0 gencl:lg:mb-0 gencl:max-h-22 gencl:max-w-22">
          <Avatar
            imageUrl={user?.image || ""}
            alt={user?.name || "User Avatar"}
            isAvatar={user?.isAvatar ?? false}
            size="3xl"
            className="gencl:shrink-0 gencl:border gencl:border-secondary-150"
          />
          <div
            className={cn(
              "gencl:absolute gencl:flex gencl:flex-col gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/50 gencl:top-0 gencl:left-0 gencl:w-full gencl:h-full gencl:opacity-0 gencl:hover:opacity-0 gencl:lg:hover:opacity-100"
            )}
          >
            <AuthenticationModal customStep="EDIT_PROFILE_PICTURE" asChild>
              <p className="gencl:text-white gencl:text-body-2-medium gencl:cursor-pointer">
                Edit
              </p>
            </AuthenticationModal>
            {/* <AuthenticationModal customStep="REMOVE_PICTURE" asChild>
            <p className="gencl:text-white gencl:text-body-2-medium gencl:cursor-pointer">
              Remove
            </p>
          </AuthenticationModal> */}
          </div>
        </div>
        {!isDesktop && (
          <div>
            <AuthenticationModal customStep="EDIT_PROFILE_PICTURE" asChild>
              <Button
                size="sm"
                theme="text"
                color="primary"
                className="gencl:text-body-1-semi-bold! gencl:text-red"
              >
                Change Profile Photo
              </Button>
            </AuthenticationModal>
          </div>
        )}
      </div>
      <SettingRow
        label="Full Name"
        modalType="EDIT_FULLNAME"
        value={user?.name || ""}
        // onClick={onClickFullName}
      />
      <SettingRow
        label="Bio"
        modalType="EDIT_BIO"
        value={user?.bio || ""}
        // onClick={onClickBio}
      />
      <SettingRow
        label="Social Profiles"
        modalType="EDIT_SOCIAL_PROFILES"
        socialIds={socialIds}
        // onClick={onClickSocialMedia}
      />
    </>
  );
};
