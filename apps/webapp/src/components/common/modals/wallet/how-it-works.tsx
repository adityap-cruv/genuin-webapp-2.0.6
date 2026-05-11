import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenuinOptions } from "@/lib/stores/genuin-options";
import { DiscountCouponIcon } from "@icons/wallet/discount-coupon-icon";
import { MoneyAtmIcon } from "@icons/wallet/money-atm-icon";
import { PlayIconRound } from "@icons/wallet/play-icon";
import { RubricIcon } from "@icons/wallet/rubric-icon";
import { TrophyIcon } from "@icons/wallet/trophy-icon";

import { ModalShell } from "../authentication/modal-shell";

const HOW_IT_WORKS = (reactionTitle: string) => ({
  rewards: [
    {
      icon: <PlayIconRound className="stroke-primary h-8" />,
      title: "Engage with Videos & Earn Rewards",
      description: `Watch videos, comment, ${reactionTitle}, share or repost to earn reward credits.`,
    },
    {
      icon: <TrophyIcon className="stroke-primary h-8" />,
      title: "Join Challenges for More Rewards",
      description: "Participate in challenges to boost your reward credits even further.",
    },
    {
      icon: <DiscountCouponIcon className="stroke-primary h-8" />,
      title: "Redeem Your Reward Credits",
      description: "Redeem your reward credits as coupons, or complete challenges to convert them into cash earrings.",
    },
  ],
  cash: [
    {
      icon: <RubricIcon className="fill-primary h-8" />,
      title: "Complete Challenges to Earn Cash",
      description: "Join challenges and complete all the steps to convert your rewards into cash earnings.",
    },
    {
      icon: <MoneyAtmIcon className="stroke-primary h-8" />,
      title: "Deposit Your Cash Earnings",
      description: "Easily deposit your cash earnings directly into your bank account anytime.",
    },
  ],
});

const TABS_TRIGGER_CLASS =
  "rounded-lg border-none py-2 !text-title-3-med data-[state=active]:!text-title-3-demi text-secondary-300 data-[state=active]:bg-monochrome-white data-[state=active]:text-primary";

export function HowItWorks() {
  const [flowType, setFlowType] = useState<"rewards" | "cash">("rewards");
  const { reactionTitle } = useGenuinOptions(useShallow((state) => ({ reactionTitle: state.config.reactions.title })));

  return (
    <ModalShell>
      <span className="text-center">
        <h3 className="text-title-1-demi" style={{ fontSize: "32px" }}>
          How it works
        </h3>
      </span>
      <Tabs
        className="w-full"
        defaultValue={flowType}
        onValueChange={(value) => {
          setFlowType(value as "rewards" | "cash");
        }}>
        <TabsList className="bg-tertiary-200 h-14 rounded-lg p-2">
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="rewards">
            Reward credits
          </TabsTrigger>
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="cash">
            Cash earnings
          </TabsTrigger>
        </TabsList>
        <p className="text-secondary-300 my-6 text-center">
          Earn real cash by completing challenges. Deposit cash earnings directly to your bank anytime, or use them to
          shop.
        </p>
        <div className="h-[40vh] overflow-auto">
          {HOW_IT_WORKS(reactionTitle)[flowType].map((item, index) => {
            return (
              <div key={index} className="flex items-center bg-white pb-8">
                <div className="bg-tertiary-200 mr-4 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full">
                  {item.icon}
                </div>
                <div>
                  <p className="text-monochrome-black">{item.title}</p>
                  <p className="text-tertiary">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Tabs>
    </ModalShell>
  );
}
