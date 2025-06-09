"use client";

import { Button } from "@genuin/ui/button";
import { Checkbox } from "@genuin/ui/checkbox";
import type { ComponentProps } from "react";
import { useState } from "react";

import { useBaseContext } from "src/context/base";
import { BrandLogo } from "src/molecules/brand";
import type { GuideLineSchema } from "src/react-query/api/guidelines";
import { useGuidelines } from "src/react-query/api/guidelines";

type GuidelinesProps = ComponentProps<"div">;

export function Guidelines({ ...props }: GuidelinesProps) {
  const { brandDetails } = useBaseContext();
  const guidelinePayload: GuideLineSchema = {
    brandId: brandDetails?.brand_id,
    isDefaultId: false,
  };

  const { data, isLoading } = useGuidelines(guidelinePayload);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="gencl:p-12 gencl:rounded-2xl gencl:min-w-xl" {...props}>
      <BrandLogo />
      <div className="gencl:w-full gencl:mt-5">
        <h2 className="gencl:text-headline-3-bold">Brand Guidelines</h2>
        <p className="gencl:text-body-1-medium gencl:font-normal gencl:mt-3">
          Welcome to Genuin! As you get settled, we wanted to introduce you to
          our Platform Guidelines. To keep Genuin a space for authentic
          connection and ongoing learning, here are a few ground rules, you, as
          a user, acknowledge and agree to by using this platform.
        </p>
        <div className="gencl:overflow-y-auto gencl:max-h-[60vh]">
          {data?.map((guideline, index) => (
            <div
              key={index}
              className="gencl:mt-3 gencl:text-body-1-medium gencl:font-normal"
            >
              <span className="gencl:font-semibold">{guideline.title}: </span>
              {guideline.description}
            </div>
          ))}
        </div>
      </div>
      <div className="gencl:mt-5 gencl:flex gencl:items-center gencl:justify-start gencl:gap-3 gencl:px-4 gencl:py-3 gencl:rounded-lg gencl:border gencl:border-secondary-100">
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(checked as boolean)}
          className="gencl:rounded-full gencl:w-5 gencl:h-5 gencl:fill-white"
        />
        <p className="gencl:text-body-1-medium">I agree to the guidelines</p>
      </div>
      <Button
        theme="primary"
        disabled={!isChecked} // Inverted the condition
        className="gencl:w-full gencl:mt-5"
      >
        Continue
      </Button>
    </div>
  );
}
