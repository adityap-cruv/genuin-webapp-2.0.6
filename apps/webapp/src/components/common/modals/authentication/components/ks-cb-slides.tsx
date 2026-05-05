import { Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useShallow } from "zustand/react/shallow";

import { useGenuinOptions } from "@/lib/stores/genuin-options";
import { toTitleCase } from "@/lib/utils";
import { CommunityDiscussion01 } from "@icons/ks-cb-flow/community-01";
import { CommunityDiscussion02 } from "@icons/ks-cb-flow/community-02";
import { CommunityDiscussion03 } from "@icons/ks-cb-flow/community-03";

import "swiper/swiper-bundle.css";

export function KsCbSlides() {
  const { brandName, reactionSuffix, reactionTitle } = useGenuinOptions(
    useShallow((state) => ({
      brandName: state.config?.name ? state.config?.name : "Genuin",
      reactionTitle: state.config.reactions.title,
      reactionSuffix: state.config.reactions.suffix,
    }))
  );

  return (
    <Swiper
      pagination={{
        clickable: true,
      }}
      mousewheel={true}
      keyboard={true}
      modules={[Pagination, Mousewheel, Keyboard]}
      className="mySwiper h-fit w-full">
      <SwiperSlide>
        <div className="flex flex-col items-center gap-2">
          <CommunityDiscussion01 className="fill-primary h-40" />
          <p className="text-title-1-bold text-center">Become a Creator for {brandName}</p>
          <p className="text-body-1-med text-center">
            Join us in shaping the future of {brandName} by making your own {brandName} community and expanding it by
            sharing thought-provoking content.
          </p>
          <br />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex flex-col items-center gap-2">
          <CommunityDiscussion02 className="fill-primary h-40" />
          <p className="text-title-1-bold text-center">
            Make Connections & {toTitleCase(reactionTitle) + " " + reactionSuffix} Dialogues
          </p>
          <p className="text-body-1-med text-center">
            Invite others to join your {brandName} community, share engaging content, and{" "}
            {reactionTitle + " " + reactionSuffix} meaningful conversations to make connections and foster intellectual
            dialogue.
          </p>
          <br />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex flex-col items-center gap-2">
          <CommunityDiscussion03 className="fill-primary h-40" />
          <p className="text-title-1-bold text-center">Moderate your Community</p>
          <p className="text-body-1-med text-center">
            Create a safe space where your members can thrive. Customize your community with guidelines, add admins, and
            more.
          </p>
          <br />
        </div>
      </SwiperSlide>
    </Swiper>
  );
}
