import { useBaseContext } from "@genuin/components/context/base";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@genuin/ui/carousel";
import {
  BecomeCreatorData,
  BecomeCreatorDataItem,
} from "./become-creator-data";
import { ComponentProps, useCallback, useEffect } from "react";
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

type BecomeCreatorProps = ComponentProps<"div">;

export function BecomeCreator({ ...props }: BecomeCreatorProps) {
  const { brandDetails } = useBaseContext();
  const { user, updateUser } = useAuthContext();
  const { data: cbStatus, isLoading: isCbStatusLoading } = useKsCbStatus({
    id: user?.id || "",
  });
  const isRequested = cbStatus?.status === "Requested";
  const Analytics = useAnalytics();
  const { mutate: requestCbMutate, isPending: isRequestMutating } =
    useCbRequestMutation({
      onSuccess: (res) => {
        if (res.isRequestSent) {
          updateUser({
            ...user,
            ksCbRequestStatus: "Requested",
          });
          setQueryDataBecomeCreator(user?.id || "");
          Analytics.track(Analytics.EventName.BECOME_CREATOR);
        }
      },
      onError: () => {
        Toast.Error({ message: "Something went wrong!" });
      },
    });

  const handleClick = useCallback(() => {
    requestCbMutate();
  }, []);

  return (
    <div className="gencl:text-center gencl:w-full" {...props}>
      <Carousel opts={{ align: "start", slidesToScroll: 1 }}>
        <CarouselContent className="gencl:w-full">
          {BecomeCreatorData(brandDetails.name).map(
            (data: BecomeCreatorDataItem, index: number) => {
              const Icon = data.src;
              return (
                <CarouselItem
                  key={index}
                  className="gencl:shrink-0 gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center"
                >
                  <Icon
                    key={index}
                    className="gencl:w-full gencl:h-auto gencl:object-contain gencl:fill-primary"
                  />
                  <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:text-center">
                    <p className="gencl:text-headline-2-semi-bold">
                      {data.title}
                    </p>
                    <p className="gencl:text-body-1-medium gencl:text-secondary-600">
                      {data.subtitle}
                    </p>
                  </div>
                </CarouselItem>
              );
            }
          )}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
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
