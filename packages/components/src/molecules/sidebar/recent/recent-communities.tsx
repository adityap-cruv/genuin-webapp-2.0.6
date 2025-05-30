import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@genuin/ui/accordion";
import { Avatar } from "@genuin/ui/avatar";
import { RECENT_COMMUNITIES_KEY } from "src/lib/constants";
import { useLocalStorage } from "usehooks-ts";

type Community = {
  dp: string;
  community_name: string;
};

const dummyCommunities: Community[] = [
  {
    dp: "https://picsum.photos/200",
    community_name: "Gaming Enthusiasts",
  },
  {
    dp: "https://picsum.photos/201",
    community_name: "Tech Innovators",
  },
  {
    dp: "https://picsum.photos/202",
    community_name: "Art & Design",
  },
];

export function Recent() {
  const [communities] = useLocalStorage<Community[]>(
    RECENT_COMMUNITIES_KEY,
    dummyCommunities
  );

  if (communities.length > 0) {
    return (
      <Accordion
        type="single"
        collapsible={true}
        defaultValue="recent-communities"
        className="gencl:w-full gencl:py-4 gencl:px-3 gencl:border-secondary-100"
      >
        <AccordionItem value="recent-communities">
          <AccordionTrigger className="gencl:px-3 gencl:py-2 gencl:hidden gencl:xl:flex">
            <div className="gencl:text-body-1-bold">Recent</div>
          </AccordionTrigger>
          <AccordionContent className="gencl:pb-0">
            {communities.map((community, commIndex) => (
              <div
                key={commIndex}
                className="gencl:flex gencl:items-center gencl:gap-2 gencl:py-2 gencl:px-2 gencl:xl:px-3"
              >
                <Avatar
                  isAvatar={false}
                  imageUrl={community.dp}
                  alt={community.community_name}
                  size="xs"
                />
                <p className="gencl:text-body-1-medium gencl:hidden gencl:xl:block">  
                  {community.community_name}
                </p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  return null;
}
