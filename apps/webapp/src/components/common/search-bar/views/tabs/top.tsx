import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type ReactNode } from "react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import { CustomAvatar } from "@components/custom/custom-avatar";
import { Button } from "@components/ui/button";
import { PATH_NAME } from "@lib/utils/constants/path";

import { type RankingResType, type LoopResType } from "../../schema/top-resp";
import { useSearchBarStore } from "../../store";

import { CommunityTile } from "./communities";
import { LoopItem } from "./loops";
import { NoResults } from "./no-results";
import { Posts } from "./posts";

import { type VideoType, type CommunityType, type PeopleType } from ".";

type Props = Partial<{
  communities: CommunityType[];
  loops: LoopResType[];
  people: PeopleType[];
  ranking: RankingResType;
  videos: VideoType[];
}>;

export function Top({ communities, loops, people, ranking, videos }: Props) {
  const compoArr: ReactNode[] = [];

  ranking?.forEach((item, _, __) => {
    if (item === "communities" && communities) compoArr.push(<CommunityView communities={communities} />);
    if (item === "loops" && loops && loops.length !== 0) compoArr.push(<LoopView loops={loops} />);
    if (item === "people" && people) compoArr.push(<PeopleView people={people} />);
  });
  if (videos) compoArr.push(<VideoView videos={videos} />);
  if (compoArr.length !== 0) return <div className="flex flex-col gap-y-4 pt-4 pb-16 sm:py-4">{compoArr}</div>;

  return <NoResults />;
}

function CommunityView({ communities }: { communities: CommunityType[] }) {
  const { setView } = useSearchBarStore();
  return (
    <span>
      <span className="flex justify-between px-4 pb-1">
        <p className="text-title-3-bold">Communities</p>
        <p
          className="text-body-1-demi text-tertiary cursor-pointer"
          onClick={() => {
            setView("TABS", "COMMUNITIES");
          }}>
          See all
        </p>
      </span>
      <div className="relative w-full">
        {communities.length === 1 ? (
          <div className="px-4">
            <CommunityTile community={communities[0]!} />
          </div>
        ) : (
          <Swiper
            spaceBetween={8}
            slidesPerView={1.2}
            initialSlide={0}
            centeredSlides
            centerInsufficientSlides
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            centeredSlidesBounds
            direction="horizontal">
            {communities.map((item) => (
              <SwiperSlide key={item.id} className="p-1">
                <CommunityTile key={item.id} community={item} />
              </SwiperSlide>
            ))}
            <SlideButtons />
          </Swiper>
        )}
      </div>
    </span>
  );
}

function SlideButtons() {
  const slider = useSwiper();
  const [status, setStatus] = useState({ isStart: true, isEnd: slider.slides.length === 1 });
  return (
    <>
      {!status.isStart && (
        <div className="absolute top-1/2 left-2 z-50 -translate-y-1/2">
          <Button
            className="bg-monochrome-white/80 drop-shadow-circle-shadow hover:bg-monochrome-white h-10 w-10 rounded-full hover:shadow-md"
            size="custom"
            onClick={() => {
              slider.slidePrev();
              setStatus({ isEnd: slider.isEnd, isStart: slider.isBeginning });
            }}>
            <ChevronLeft className="stroke-monochrome-black h-7 stroke-[2px]" />
          </Button>
        </div>
      )}
      {!status.isEnd && (
        <div className="absolute top-1/2 right-2 z-50 -translate-y-1/2">
          <Button
            className="bg-monochrome-white/80 drop-shadow-circle-shadow hover:bg-monochrome-white h-10 w-10 rounded-full hover:shadow-md"
            size="custom"
            onClick={() => {
              slider.slideNext();
              setStatus({ isEnd: slider.isEnd, isStart: slider.isBeginning });
            }}>
            <ChevronRight className="stroke-monochrome-black h-7 stroke-[2px]" />
          </Button>
        </div>
      )}
    </>
  );
}

function LoopView({ loops }: { loops: LoopResType[] }) {
  const { setView } = useSearchBarStore();
  return (
    <span>
      <span className="flex justify-between px-4 pb-2">
        <p className="text-title-3-bold">Groups</p>
        <p
          className="text-body-1-demi text-tertiary cursor-pointer"
          onClick={() => {
            setView("TABS", "LOOPS");
          }}>
          See all
        </p>
      </span>
      <div className="relative w-full">
        {loops.length === 1 ? (
          <div className="w-full px-4">
            <LoopItem loop={loops[0]!} />
          </div>
        ) : (
          <Swiper
            spaceBetween={8}
            slidesPerView={1.2}
            initialSlide={0}
            centeredSlides
            centerInsufficientSlides
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            centeredSlidesBounds
            direction="horizontal">
            {loops.map((item) => (
              <SwiperSlide key={item.chat_id} className="w-full p-1">
                <LoopItem key={item.chat_id} loop={item} />
              </SwiperSlide>
            ))}
            <SlideButtons />
          </Swiper>
        )}
      </div>
    </span>
  );
}

function PeopleView({ people }: { people: PeopleType[] }) {
  const { setView, close } = useSearchBarStore();
  return (
    <span>
      <span className="flex justify-between px-4 pb-2">
        <p className="text-title-3-bold">People</p>
        <p
          className="text-body-1-demi text-tertiary cursor-pointer"
          onClick={() => {
            setView("TABS", "PEOPLE");
          }}>
          See all
        </p>
      </span>
      <div className="flex gap-x-2 overflow-auto px-4">
        {people.slice(0, 4).map((person) => {
          return (
            <Link
              onClick={close}
              href={person.brand ? PATH_NAME.brand(person.brand.brand_slug) : PATH_NAME.profile(person.userName)}
              className="flex w-fit flex-col items-center gap-y-1"
              key={person.id}>
              <CustomAvatar
                fallbackString={person.name ?? ""}
                imageUrl={person.profileImage ?? ""}
                isAvatar={person.isAvatar}
                className="h-16 w-16"
              />
              <p className="text-cap-1-demi line-clamp-1 break-all">{`@${person.userName}`}</p>
            </Link>
          );
        })}
      </div>
    </span>
  );
}

function VideoView({ videos }: { videos: VideoType[] }) {
  const { setView } = useSearchBarStore();
  return (
    <span>
      <span className="flex justify-between px-4 pb-2">
        <p className="text-title-3-bold">Posts</p>
        <p
          className="text-body-1-demi text-tertiary cursor-pointer"
          onClick={() => {
            setView("TABS", "POSTS");
          }}>
          See all
        </p>
      </span>
      <Posts videos={videos} />
    </span>
  );
}
