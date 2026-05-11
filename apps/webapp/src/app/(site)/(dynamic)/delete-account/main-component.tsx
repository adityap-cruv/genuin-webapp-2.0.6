"use client";
import Link from "next/link";
import { useEffect } from "react";

import { AuthenticationModal } from "@/components/common/modals/authentication";
import { GenuinIcon } from "@icons/genuin-icon";
import { PATH_NAME } from "@lib/utils/constants/path";

export default function MainComponent() {
  useEffect(() => {
    AuthenticationModal.open("DELETE_ACCOUNT", "STARTER");
  }, []);

  return (
    <div className="bg-tertiary-200 relative flex h-screen w-screen items-center justify-center">
      <nav className="bg-monochrome-white absolute top-0 h-[76px] w-full">
        <div className="flex h-full items-center justify-between px-2 xl:container">
          <Link draggable={false} href={{ pathname: PATH_NAME.home() }}>
            <GenuinIcon.logo className="fill-new-off-black" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
