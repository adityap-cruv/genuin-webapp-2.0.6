import {CommunityDiscussion01} from "@genuin/ui/icons/misc-icons/become-creator/community-01";
import {CommunityDiscussion02} from "@genuin/ui/icons/misc-icons/become-creator/community-02";
import {CommunityDiscussion03} from "@genuin/ui/icons/misc-icons/become-creator/community-03";
import React, { SVGProps } from "react";

export type BecomeCreatorDataItem = {
    src: (props: SVGProps<SVGSVGElement>) => React.ReactNode;
    title: string;
    subtitle: string;
}

// TODO : add src links of the become creator 

export function BecomeCreatorData(brandName: string): BecomeCreatorDataItem[] {
    return [
        {
            src : CommunityDiscussion01,
            title: `Become a creator for ${brandName}`,
            subtitle: `Join us in shaping the future of ${brandName} by making your own ${brandName} community and expanding it by sharing thought-provoking content.`
        },
        {
            src : CommunityDiscussion02,
            title: "Make Connections & Spark Dialogues",
            subtitle: `Invite others to join your ${brandName} community, share engaging content, and spark meaningful conversations to make connections and foster intellectual dialogue.`
        },
        {
            src : CommunityDiscussion03,
            title: "Moderate your Community",
            subtitle: "Create a safe space where your members can thrive. Customize your community with guidelines, add admins, and more."
        }
    ];
}