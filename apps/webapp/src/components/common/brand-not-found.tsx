"use client";
import { TopBar } from "@components/layouts/desktop/top-bar";
import { Button } from "@components/ui/button";
import imgPuppet from "@images/not-found/puppet.svg";

import { CustomImage } from "../custom/custom-image";

import { ContactUs } from "./modals/contact-us";

export function BrandNotFound() {
  return (
    <>
      <TopBar showUserTick={false} showSearchBar={false} />
      <div className="-mt-20 hidden justify-center lg:flex xl:container xl:px-0">
        <div className="relative flex h-screen flex-col justify-center">
          <p className="text-new-h2 mb-6">This URL doesn't exist...yet</p>
          <p className="text-title-1-bold mb-10 font-medium">
            The URL you are attempting to access is not found. But, you can claim it and make it yours!
          </p>
          <div>
            <ContactUs>
              <Button variant="default" size={"custom"} className="bg-new-off-black hover:bg-new-dark-grey px-4 py-3">
                <p className="text-new-para-2 font-semibold">Contact Us</p>
              </Button>
            </ContactUs>
          </div>
          <CustomImage src={imgPuppet} height={200} width={200} alt="genuin" className="absolute right-0 bottom-0" />
        </div>
      </div>
      <div className="container -mt-20 flex justify-center lg:hidden">
        <div className="relative flex h-screen flex-col items-center justify-center">
          <p className="text-new-h2-mobile mb-4 text-center">This URL doesn't exist...yet</p>
          <p className="text-new-para-2 text-center font-medium">
            The URL you are attempting to access is not found. But, you can claim it and make it yours!
          </p>
          <CustomImage src={imgPuppet} height={200} width={100} alt="genuin" className="my-10" />
          <div>
            <ContactUs>
              <Button variant="default" size={"custom"} className="bg-new-off-black hover:bg-new-dark-grey px-4 py-3">
                <p className="text-new-para-2 font-semibold">Contact Us</p>
              </Button>
            </ContactUs>
          </div>
        </div>
      </div>
    </>
  );
}
