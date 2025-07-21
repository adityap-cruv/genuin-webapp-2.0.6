"use client";
import { useAuthContext } from "@genuin/components/context/auth";
import { SettingRow } from "@genuin/components/molecules/setting-row";
import SideMenu from "@genuin/components/molecules/side-menus/side-menu";
import { MenuItem } from "@genuin/components/molecules/side-menus/side-menu.types";
import { AccountSettings } from "@genuin/components/organisms/settings/screen/account-settings";
import { EditProfileSettings } from "@genuin/components/organisms/settings/screen/edit-profile-settings";
import { NotificationSettings } from "@genuin/components/organisms/settings/screen/notifications-settings";
import { ContactUs } from "@genuin/components/organisms/settings/screen/contact-us";
import { useState, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@genuin/ui/components/tabs";
import {
  CreatedProfileIcon,
  EditIcon,
  NotificationIcon,
  PreferencesIcon,
  InfoIcon,
  SignOutIcon,
} from "@genuin/ui/icons";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { notificationsSettings } from "@genuin/components/react-query/api/authentication/notifications";
import { useGetCategoriesQuery } from "@genuin/components/react-query/api/authentication/categories";
import { Toast } from "@genuin/ui/components";

const menu: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    icon: <CreatedProfileIcon />,
    variant: "default",
  },
  {
    id: "editProfile",
    label: "Edit Profile",
    icon: <EditIcon />,
    variant: "default",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: <PreferencesIcon />,
    variant: "default",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationIcon />,
    variant: "default",
  },
  {
    id: "contactUs",
    label: "Contact Us",
    icon: <InfoIcon />,
    variant: "default",
  },
  {
    id: "signOut",
    label: "Log out",
    icon: <SignOutIcon />,
    variant: "signOut",
  },
];

export function SettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("account");
  const { isMobile, isTablet } = useDeviceDetectMediaQuery();
  const [groupNotify, setGroupNotify] = useState(false);
  const { isFetching, data: categories } = useGetCategoriesQuery();

  const textToShow = useMemo(() => {
    if (!categories) return "Loading...";
    const { selectedCount, totalTopics } = categories.reduce(
      (acc, category) => {
        acc.selectedCount += category.topics.filter(
          (topic) => topic.is_selected
        ).length;
        acc.totalTopics += category.topics.length;
        return acc;
      },
      { selectedCount: 0, totalTopics: 0 }
    );
    const isAllSelected = selectedCount === totalTopics;
    return isAllSelected ? "All selected" : `${selectedCount} Categories`;
  }, [categories]);

  // Memoize tab configuration for mobile/tablet tabs
  const tabs = useMemo(
    () => [
      { value: "account", label: "Account", content: <AccountSettings /> },
      {
        value: "editProfile",
        label: "Edit Profile",
        content: <EditProfileSettings />,
      },
      {
        value: "preferences",
        label: "Preferences",
        content: (
          <>
            <h4 className="gencl:text-headline-4-medium gencl:mb-4">
              Interests
            </h4>
            <SettingRow
              label="Categories"
              value={textToShow || "Loading..."}
              modalType="CATEGORY_SELECTION"
            />
          </>
        ),
      },
      {
        value: "notifications",
        label: "Notifications",
        content: (
          <NotificationSettings
            group={groupNotify}
            onToggleGroup={(val) => {
              setGroupNotify(val);
              notificationsSettings({ roundtable_notification: val })
                .then((res) => {
                  if (res) setGroupNotify(val);
                  Toast.Success({
                    message: "Your notifications has been updated",
                  });
                })
                .catch((err) => {
                  if (err) setGroupNotify(false);
                });
            }}
          />
        ),
      },
      {
        value: "contactUs",
        label: "Contact Us",
        content: <ContactUs email={user?.email ?? ""} />,
      },
    ],
    [groupNotify, textToShow, user?.email]
  );

  const handleSelect = (id: string) => {
    if (id === "signOut") {
      // Handle sign out logic here
      return;
    }
    setActiveTab(id);
  };

  const isMobileOrTablet = isMobile || isTablet;

  return (
    <div className="gencl:h-full">
      <div
        className={
          isMobileOrTablet
            ? "gencl:w-full gencl:h-full gencl:flex gencl:flex-col"
            : "gencl:flex gencl:max-w-[90%] gencl:h-full"
        }
      >
        {/* Desktop sidebar */}
        {!isMobileOrTablet && (
          <aside className="gencl:border-r gencl:border-secondary-150 gencl:pl-6 gencl:py-4 gencl:pr-3 gencl:min-w-3xs">
            <div className="gencl:m-3">
              <span className="gencl:text-headline-4-medium">Settings</span>
            </div>
            <SideMenu
              items={menu}
              activeId={activeTab}
              onSelect={handleSelect}
            />
          </aside>
        )}
        {/* Tabs and content */}
        <main
          className={
            isMobileOrTablet ? "gencl:flex-1" : "gencl:p-6 gencl:w-full"
          }
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="gencl:flex gencl:flex-col gencl:h-full"
          >
            {/* Tabs header only for mobile/tablet */}
            {isMobileOrTablet && (
              <div className="gencl:sticky gencl:top-0 gencl:z-10 gencl:bg-white gencl:border-b gencl:border-secondary-200">
                <div className="gencl:overflow-x-auto gencl:px-4">
                  <TabsList className="gencl:w-auto gencl:inline-flex gencl:bg-transparent gencl:border-none gencl:rounded-none gencl:h-10 gencl:p-0">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="gencl:relative gencl:data-[state=active]:gencl:bg-transparent gencl:data-[state=active]:gencl:text-secondary-900 gencl:data-[state=active]:gencl:border-b-2 gencl:data-[state=active]:gencl:border-primary gencl:rounded-none gencl:px-2 gencl:py-1 gencl:text-sm gencl:font-medium gencl:whitespace-nowrap gencl:flex-shrink-0"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            )}
            {/* Tab content area (scrollable for mobile/tablet) */}
            <div
              className={
                isMobileOrTablet
                  ? "gencl:flex-1 gencl:overflow-y-auto gencl:w-full"
                  : "gencl:w-full gencl:!border-none py-1"
              }
            >
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className={
                    isMobileOrTablet
                      ? "gencl:p-4 gencl:m-0 gencl:w-full"
                      : "gencl:p-0 gencl:m-0 gencl:w-full gencl:!border-none"
                  }
                >
                  {activeTab === tab.value ? tab.content : null}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
