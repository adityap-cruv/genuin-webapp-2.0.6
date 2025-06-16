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
import { Image } from "@genuin/ui/components/image";
import { ComponentProps } from "react";
import { Button } from "@genuin/ui/components/button";

type BecomeCreatorProps = ComponentProps<"div">;

export function BecomeCreator({ ...props }: BecomeCreatorProps) {
  const { brandDetails } = useBaseContext();
  return (
    <div className="gencl:text-center gencl:w-full" {...props}>
      <Carousel opts={{ align: "start", slidesToScroll: 1 }}>
        <CarouselContent className="gencl:w-full">
          {BecomeCreatorData(brandDetails.name).map(
            (data: BecomeCreatorDataItem, index: number) => {
              const Icon = data.src
              return (
                <CarouselItem
                  key={index}
                  className="gencl:shrink-0 gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center"
                >
                  <Icon key={index} className="gencl:w-full gencl:h-auto gencl:object-contain gencl:fill-primary" />
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
        >
          Become a creator{" "}
        </Button>
        <Button
          className="gencl:w-full gencl:text-body-0-semi-bold"
          theme="secondary"
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
