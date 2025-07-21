import { SettingRow } from "@genuin/components/molecules/setting-row";
import type { FC } from "react";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { useAuthContext } from "@genuin/components/context/auth";

export const AccountSettings: FC = () => {
  const { user } = useAuthContext();
  const phoneNumber = user?.phoneNumber
    ? formatPhoneNumberIntl(
        !user?.phoneNumber.startsWith("+")
          ? "+" + user?.phoneNumber
          : user?.phoneNumber
      )
    : "Not set";

  return (
    <>
      <h4 className="gencl:text-headline-4-medium gencl:text-secondary-900 gencl:mb-3">
        General
      </h4>
      <SettingRow
        label="Username"
        modalType="EDIT_USERNAME"
        value={"@" + user?.nickname}
      />
      <SettingRow
        label="Email address"
        modalType="EDIT_EMAIL"
        value={user?.email || ""}
      />
      <SettingRow
        label="Phone Number"
        modalType="EDIT_PHONE_NUMBER"
        value={phoneNumber}
      />
      <SettingRow
        label="Birth date"
        modalType="EDIT_BIRTHDATE"
        value={user?.birth}
      />
      <h4 className="gencl:text-headline-4-medium gencl:mt-10 gencl:mb-4">
        Advanced
      </h4>
      <SettingRow label="Delete account" modalType="DELETE_CONFIRMATION" />
    </>
  );
};
