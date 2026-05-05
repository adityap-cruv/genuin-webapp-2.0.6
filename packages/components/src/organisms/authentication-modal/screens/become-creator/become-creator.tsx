import { Button } from "@genuin/ui/components/button";
import { Loader } from "@genuin/ui/components/loader";
import { Toast } from "@genuin/ui/components/toaster";
import { DialogClose } from "@genuin/ui/dialog";
import type { ComponentProps } from "react";
import { useCallback, useEffect } from "react";
import { Pagination, Autoplay, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useAnalytics } from "@genuin/components/context/analytics";
import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import {
  setQueryDataBecomeCreator,
  useCbRequestMutation,
  useKsCbStatus,
} from "@genuin/components/react-query/api/authentication";

import { AuthenticationModal } from "../../authentication-modal";

import type { BecomeCreatorDataItem } from "./become-creator-data";
import { BecomeCreatorData } from "./become-creator-data";

import "swiper/css";

import "swiper/css/navigation";
import "swiper/css/pagination";

type BecomeCreatorProps = ComponentProps<"div">;

export function BecomeCreator({ ...props }: BecomeCreatorProps) {
  const { brandDetails } = useBaseContext();
  const { user, updateUser, updateLocalStorageUserData } = useAuthContext();
  const {
    data: cbStatus,
    isLoading: isCbStatusLoading,
    refetch: refetchCbStatus,
  } = useKsCbStatus({
    id: user?.id || "",
  });
  const isRequested = cbStatus?.status === "Requested";
  const { track, EventName } = useAnalytics();
  const { mutate: requestCbMutate, isPending: isRequestMutating } = useCbRequestMutation({
    onSuccess: async (res) => {
      if (res.isRequestSent) {
        await refetchCbStatus();
        setQueryDataBecomeCreator(user?.id || "");
        track(EventName.BECOME_CREATOR);
      }
    },
    onError: () => {
      Toast.Error({ message: "Something went wrong!" });
    },
  });

  const handleClick = useCallback(() => {
    if (user) {
      requestCbMutate();
    }
  }, [user, requestCbMutate]);

  useEffect(() => {
    if (cbStatus?.status && user?.ksCbRequestStatus !== cbStatus?.status) {
      updateUser({
        ...user,
        ksCbRequestStatus: cbStatus?.status,
      });
      updateLocalStorageUserData({ ksCbRequestStatus: cbStatus.status });
    }
  }, [cbStatus]);

  const renderButton = () => (
    <>
      {user && cbStatus?.status !== "Accepted" ? (
        <Button
          className="gencl:w-full gencl:text-body-0-semi-bold"
          theme="primary"
          onClick={handleClick}
          disabled={isRequestMutating || isCbStatusLoading || isRequested}>
          {isCbStatusLoading || isRequestMutating ? (
            <Loader size="sm" />
          ) : isRequested ? (
            "Requested"
          ) : (
            "Become a Creator"
          )}
        </Button>
      ) : (
        <AuthenticationModal asChild customStep={brandDetails.web_cta === "app" ? "GET_APP" : "SIGNIN"}>
          <Button className="gencl:w-full gencl:text-body-0-semi-bold" theme="primary">
            Become a Creator
          </Button>
        </AuthenticationModal>
      )}
    </>
  );

  const slides = BecomeCreatorData(brandDetails.name);

  return (
    <div className="gencl:text-center gencl:w-full gencl:h-fit gencl:overflow-x-hidden" {...props}>
      <Swiper
        keyboard={true}
        modules={[Autoplay, Pagination, Keyboard]}
        autoplay={{
          delay: 2500,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        spaceBetween={24}
        slidesPerView={1}
        className="gencl:w-full gencl:h-fit gencl:mt-4 [touch-action:pan-y]">
        {slides.map((data: BecomeCreatorDataItem, index: number) => {
          const Icon = data.src;
          return (
            <SwiperSlide key={index}>
              <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:h-fit gencl:mb-8">
                <Icon className="gencl:w-full gencl:h-auto gencl:object-contain gencl:fill-primary" />
                <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:text-center">
                  <p className="gencl:text-headline-2-semi-bold">{data.title}</p>
                  <p className="gencl:text-body-1-medium gencl:text-secondary-600">{data.subtitle}</p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
        {renderButton()}
        <DialogClose asChild>
          <Button className="gencl:w-full gencl:text-body-0-semi-bold" theme="secondary">
            Not now
          </Button>
        </DialogClose>
      </div>
    </div>
  );
}
