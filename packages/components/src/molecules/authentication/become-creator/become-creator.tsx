import { useBaseContext } from "@/context/base";
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

type BecomeCreatorProps = ComponentProps<"div">

export function BecomeCreator({...props} : BecomeCreatorProps) {
  const { brandDetails } = useBaseContext(); 
  return (
    <div className="gencl:text-center gencl:p-12 gencl:rounded-2xl gencl:min-w-xl" {...props}>
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent>
          {BecomeCreatorData(brandDetails.name).map(
            (data: BecomeCreatorDataItem, index: number) => {
              return (
                <CarouselItem
                  key={index}
                  className="gencl:flex gencl:flex-col gencl:gap-4 gencl:items-center"
                >
                  <Image src={data.src} className="gencl:py-10 gencl:px-5 gencl:h-56 gencl:w-64" alt="Become a creator" />
                  <div className="gencl:flex gencl:gap-4 gencl:flex-col gencl:text-center">
                    <p className="gencl:text-headline-2-semi-bold">{data.title}</p>
                    <p className="gencl:text-body-1-medium gencl:text-secondary-600">{data.subtitle}</p>
                  </div>
                </CarouselItem>
              );
            }
          )}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
        <Button className="gencl:w-full gencl:text-body-0-semi-bold" theme="primary">Become a creator </Button>
        <Button className="gencl:w-full gencl:text-body-0-semi-bold" theme="secondary">Not now</Button>
      </div>
    </div>
  );
}
