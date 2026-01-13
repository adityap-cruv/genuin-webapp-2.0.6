import { useIheartUrlManager } from "@genuin/components/hooks/embed/use-iheart-url-manager";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type IheartUrlManagerProps = {
  websiteType: "polaris" | "legacy" | undefined;
  activePlayerType: string;
  activeIndex: number;
  videos: PostDetailsType[];
};

export function IheartUrlManager({
  websiteType,
  activePlayerType,
  activeIndex,
  videos,
}: IheartUrlManagerProps) {
  useIheartUrlManager({
    isIheartLayout: true,
    websiteType,
    activePlayerType,
    activeIndex,
    videos,
  });
  return null;
}
