import { useBaseContext } from "@genuin/components/context/base";
import {
  BecomeCreatorData,
  BecomeCreatorDataItem,
} from "./become-creator-data";
import { ComponentProps, useCallback } from "react";
import { Button } from "@genuin/ui/components/button";
import { DialogClose } from "@genuin/ui/components/dialog";
import {
  setQueryDataBecomeCreator,
  useCbRequestMutation,
  useKsCbStatus,
} from "@genuin/components/react-query/api/authentication";
import { Loader } from "@genuin/ui/components/loader";
import { useAnalytics } from "@genuin/components/context/analytics";
import { useAuthContext } from "@genuin/components/context/auth";
import { Toast } from "@genuin/ui/components/toaster";
import { AuthenticationModal } from "../../authentication-modal";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Mousewheel, Keyboard, Autoplay } from "swiper/modules";

type BecomeCreatorProps = ComponentProps<"div">;

export function BecomeCreator({ ...props }: BecomeCreatorProps) {
  const { brandDetails } = useBaseContext();
  const { user, updateUser } = useAuthContext();
  const { data: cbStatus, isLoading: isCbStatusLoading } = useKsCbStatus({
    id: user?.id || "",
  });
  const isRequested = cbStatus?.status === "Requested";
  const { track, EventName } = useAnalytics();
  const { mutate: requestCbMutate, isPending: isRequestMutating } =
    useCbRequestMutation({
      onSuccess: (res) => {
        if (res.isRequestSent) {
          updateUser({
            ...user,
            ksCbRequestStatus: "Requested",
          });
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

  const renderButton = () => (
    <>
      {user ? (
        <Button
          className="gencl:w-full gencl:text-body-0-semi-bold"
          theme="primary"
          onClick={handleClick}
          disabled={isRequestMutating || isCbStatusLoading || isRequested}
        >
          {isCbStatusLoading || isRequestMutating ? (
            <Loader size="sm" />
          ) : isRequested ? (
            "Requested"
          ) : (
            "Become a Creator"
          )}
        </Button>
      ) : (
        <AuthenticationModal
          asChild
          customStep={brandDetails.web_cta === "app" ? "GET_APP" : "SIGNIN"}
        >
          <Button
            className="gencl:w-full gencl:text-body-0-semi-bold"
            theme="primary"
          >
            Become a Creator
          </Button>
        </AuthenticationModal>
      )}
    </>
  );

  const slides = BecomeCreatorData(brandDetails.name);

  return (
    <div className="gencl:text-center gencl:w-full gencl:h-fit" {...props}>
      <Swiper
        mousewheel={true}
        keyboard={true}
        modules={[Autoplay, Pagination, Mousewheel, Keyboard]}
        autoplay={{
          delay: 2500,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        spaceBetween={24}
        slidesPerView={1}
        className="gencl:w-full gencl:h-fit"
      >
        {slides.map((data: BecomeCreatorDataItem, index: number) => {
          const Icon = data.src;
          return (
            <SwiperSlide key={index}>
              <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center gencl:h-fit gencl:mb-8">
                <Icon className="gencl:w-full gencl:h-auto gencl:object-contain gencl:fill-primary" />
                <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:text-center">
                  <p className="gencl:text-headline-2-semi-bold">
                    {data.title}
                  </p>
                  <p className="gencl:text-body-1-medium gencl:text-secondary-600">
                    {data.subtitle}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
        {cbStatus?.status !== "Accepted" && renderButton()}
        <DialogClose asChild>
          <Button
            className="gencl:w-full gencl:text-body-0-semi-bold"
            theme="secondary"
          >
            Not now
          </Button>
        </DialogClose>
      </div>
    </div>
  );
}
